import { randomUUID } from "node:crypto";

import { and, desc, eq, or } from "drizzle-orm";

import { db } from "../../config/db.js";
import { artistProfiles, artistRatings, bookings } from "../../schemas/app.schema.js";
import { user } from "../../schemas/schema.js";

const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeNumericValue(value, fallback = 0) {
	const parsedValue = Number.parseFloat(value);

	return Number.isNaN(parsedValue) ? fallback : parsedValue;
}

function buildRatingSummary(rows) {
	const ratingCount = rows.length;

	if (ratingCount === 0) {
		return { rating: 0, ratingCount: 0 };
	}

	const totalRating = rows.reduce((sum, row) => sum + normalizeNumericValue(row.rating), 0);
	const averageRating = totalRating / ratingCount;

	return {
		rating: Number(averageRating.toFixed(1)),
		ratingCount,
	};
}

async function resolveArtistTarget(identifier) {
	if (!identifier) {
		return null;
	}

	const rows = await db
		.select({
			profileId: artistProfiles.id,
			userId: artistProfiles.userId,
		})
		.from(artistProfiles)
		.where(
			UUID_REGEX.test(identifier)
				? or(eq(artistProfiles.id, identifier), eq(artistProfiles.userId, identifier))
				: eq(artistProfiles.userId, identifier)
		)
		.limit(1);

	if (rows.length === 0) {
		return null;
	}

	return rows[0];
}

async function getRatingSummaryByArtistId(artistUserId) {
	const rows = await db
		.select({ rating: artistRatings.rating })
		.from(artistRatings)
		.where(eq(artistRatings.artistId, artistUserId));

	return buildRatingSummary(rows);
}

async function getRatingSummaryMap() {
	const rows = await db
		.select({
			artistId: artistRatings.artistId,
			rating: artistRatings.rating,
		})
		.from(artistRatings);

	const groupedRatings = new Map();

	for (const row of rows) {
		const currentRatings = groupedRatings.get(row.artistId) ?? [];
		currentRatings.push(row);
		groupedRatings.set(row.artistId, currentRatings);
	}

	const summaryMap = new Map();
	for (const [artistId, ratingRows] of groupedRatings.entries()) {
		summaryMap.set(artistId, buildRatingSummary(ratingRows));
	}

	return summaryMap;
}

function toRatingRecord(row) {
	return {
		id: row.id,
		rating: normalizeNumericValue(row.rating),
		comment: row.comment ?? null,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		client: {
			id: row.clientId,
			name: row.clientName ?? "Cliente",
			image: row.clientImage ?? null,
		},
	};
}

function toCatalogArtist(row) {
	const hourlyRate = normalizeNumericValue(row.hourlyRate);
	const ratingSummary = row.ratingSummary ?? { rating: 0, ratingCount: 0 };

	return {
		id: row.id,
		userId: row.userId,
		name: row.name ?? "Artista",
		category: row.category ?? "General",
		city: row.city ?? "No definida",
		bio: row.bio ?? "Este artista aun no ha completado su biografia.",
		contactSocial: row.contactSocial ?? "",
		contactPhone: row.contactPhone ?? "",
		imageUrl: row.imageUrl ?? FALLBACK_IMAGE_URL,
		hourlyRate,
		rating: ratingSummary.rating,
		ratingCount: ratingSummary.ratingCount,
	};
}

export async function listArtists() {
	const rows = await db
		.select({
			id: artistProfiles.id,
				userId: artistProfiles.userId,
			name: user.name,
			category: artistProfiles.category,
			city: artistProfiles.city,
			bio: artistProfiles.bio,
			contactSocial: artistProfiles.contactSocial,
			contactPhone: artistProfiles.contactPhone,
			imageUrl: user.image,
			hourlyRate: artistProfiles.baseRate,
		})
		.from(artistProfiles)
		.leftJoin(user, eq(artistProfiles.userId, user.id));

	const ratingSummaryMap = await getRatingSummaryMap();

	return rows.map((row) =>
		toCatalogArtist({
			...row,
			ratingSummary: ratingSummaryMap.get(row.userId),
		})
	);
}

export async function findArtistById(id) {
	const rows = await db
		.select({
			id: artistProfiles.id,
				userId: artistProfiles.userId,
			name: user.name,
			category: artistProfiles.category,
			city: artistProfiles.city,
			bio: artistProfiles.bio,
			contactSocial: artistProfiles.contactSocial,
			contactPhone: artistProfiles.contactPhone,
			imageUrl: user.image,
			hourlyRate: artistProfiles.baseRate,
		})
		.from(artistProfiles)
		.leftJoin(user, eq(artistProfiles.userId, user.id))
		.where(eq(artistProfiles.id, id))
		.limit(1);

	if (rows.length === 0) {
		return null;
	}

	const ratingSummary = await getRatingSummaryByArtistId(rows[0].userId);

	return toCatalogArtist({
		...rows[0],
		ratingSummary,
	});
}

export async function getArtistRatings(identifier) {
	const target = await resolveArtistTarget(identifier);

	if (!target) {
		return null;
	}

	const rows = await db
		.select({
			id: artistRatings.id,
			rating: artistRatings.rating,
			comment: artistRatings.comment,
			createdAt: artistRatings.createdAt,
			updatedAt: artistRatings.updatedAt,
			clientId: artistRatings.clientId,
			clientName: user.name,
			clientImage: user.image,
		})
		.from(artistRatings)
		.leftJoin(user, eq(artistRatings.clientId, user.id))
		.where(eq(artistRatings.artistId, target.userId))
		.orderBy(desc(artistRatings.createdAt));

	return {
		artist: target,
		ratingSummary: await getRatingSummaryByArtistId(target.userId),
		ratings: rows.map(toRatingRecord),
	};
}

export async function submitArtistRating({ artistIdentifier, clientId, rating, comment }) {
	const target = await resolveArtistTarget(artistIdentifier);

	if (!target) {
		const error = new Error("Artista no encontrado.");
		error.code = "ARTIST_NOT_FOUND";
		throw error;
	}

	const normalizedRating = Number.parseFloat(rating);

	if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
		const error = new Error("La calificacion debe estar entre 1 y 5.");
		error.code = "INVALID_RATING";
		throw error;
	}

	const normalizedComment = typeof comment === "string" ? comment.trim() : "";

	if (normalizedComment.length > 1000) {
		const error = new Error("El comentario no puede superar 1000 caracteres.");
		error.code = "INVALID_COMMENT";
		throw error;
	}

	const acceptedBooking = await db
		.select({ id: bookings.id })
		.from(bookings)
		.where(
			and(
				eq(bookings.artistId, target.userId),
				eq(bookings.clientId, clientId),
				eq(bookings.status, "aceptada")
			)
		)
		.limit(1);

	if (acceptedBooking.length === 0) {
		const error = new Error("Solo puedes calificar a un artista con una reserva aceptada.");
		error.code = "RATING_REQUIRES_BOOKING";
		throw error;
	}

	const existingRating = await db
		.select({ id: artistRatings.id })
		.from(artistRatings)
		.where(and(eq(artistRatings.artistId, target.userId), eq(artistRatings.clientId, clientId)))
		.limit(1);

	let savedRating;

	if (existingRating.length > 0) {
		savedRating = await db
			.update(artistRatings)
			.set({
				rating: normalizedRating.toFixed(1),
				comment: normalizedComment.length > 0 ? normalizedComment : null,
				updatedAt: new Date(),
			})
			.where(eq(artistRatings.id, existingRating[0].id))
			.returning();
	} else {
		savedRating = await db
			.insert(artistRatings)
			.values({
				id: randomUUID(),
				artistId: target.userId,
				clientId,
				rating: normalizedRating.toFixed(1),
				comment: normalizedComment.length > 0 ? normalizedComment : null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
	}

	const ratingSummary = await getRatingSummaryByArtistId(target.userId);

	return {
		data: toRatingRecord({
			...savedRating[0],
			clientName: undefined,
			clientImage: undefined,
		}),
		ratingSummary,
	};
}
