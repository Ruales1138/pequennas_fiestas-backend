import { auth } from "../../config/auth.js";
import { findArtistById, getArtistRatings, listArtists, submitArtistRating } from "./artists.service.js";

export async function getArtists(_req, res) {
	try {
		const artists = await listArtists();
		return res.json({ data: artists });
	} catch (error) {
		console.error("Error listing artists:", error);
		return res.status(500).json({ message: "No se pudieron cargar los artistas." });
	}
}

export async function getArtistById(req, res) {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "El id del artista es obligatorio." });
	}

	try {
		const artist = await findArtistById(id);

		if (!artist) {
			return res.status(404).json({ message: "Artista no encontrado." });
		}

		return res.json({ data: artist });
	} catch (error) {
		console.error("Error loading artist by id:", error);
		return res.status(500).json({ message: "No se pudo cargar el artista." });
	}
}

export async function listRatingsByArtist(req, res) {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: "El id del artista es obligatorio." });
	}

	try {
		const ratings = await getArtistRatings(id);

		if (!ratings) {
			return res.status(404).json({ message: "Artista no encontrado." });
		}

		return res.json({ data: ratings.ratings, meta: ratings.ratingSummary });
	} catch (error) {
		console.error("Error loading artist ratings:", error);
		return res.status(500).json({ message: "No se pudieron cargar las calificaciones." });
	}
}

export async function createArtistRating(req, res) {
	const session = await auth.api.getSession({ headers: req.headers });

	if (!session?.user?.id) {
		return res.status(401).json({ message: "No autorizado." });
	}

	if (session.user.role !== "cliente") {
		return res.status(403).json({ message: "Solo los clientes pueden calificar artistas." });
	}

	const { id } = req.params;
	const { rating, comment } = req.body;

	if (!id) {
		return res.status(400).json({ message: "El id del artista es obligatorio." });
	}

	try {
		const result = await submitArtistRating({
			artistIdentifier: id,
			clientId: session.user.id,
			rating,
			comment,
		});

		return res.status(201).json({
			message: "Calificacion guardada exitosamente.",
			data: result.data,
			meta: result.ratingSummary,
		});
	} catch (error) {
		console.error("Error creating artist rating:", error);

		if (error.code === "ARTIST_NOT_FOUND") {
			return res.status(404).json({ message: error.message });
		}

		if (error.code === "INVALID_RATING" || error.code === "INVALID_COMMENT") {
			return res.status(400).json({ message: error.message });
		}

		if (error.code === "RATING_REQUIRES_BOOKING") {
			return res.status(403).json({ message: error.message });
		}

		return res.status(500).json({ message: "No se pudo guardar la calificacion." });
	}
}
