import { Router } from 'express'
import { eq, and, or } from 'drizzle-orm'
import { db } from '../../config/db.js'
import { artistProfiles, bookings } from '../../schemas/app.schema.js'
import { user } from '../../schemas/schema.js'
import { auth } from '../../config/auth.js'
import {
	createBooking,
	getArtistAvailability,
	getArtistBookingStats,
} from './bookings.service.js'

const router = Router()

router.post('/', async (req, res) => {
	try {
		const session = await auth.api.getSession({ headers: req.headers })
		if (!session?.user?.id) {
			return res.status(401).json({ error: 'No autorizado' })
		}

		const { artistId, eventDate, eventLocation, description, jobHours, agreedPrice } = req.body

		if (req.body.clientId !== session.user.id) {
			return res.status(403).json({ error: 'No puedes crear una reserva para otro usuario' })
		}

		if (artistId === session.user.id) {
			return res.status(400).json({ error: 'No puedes reservarte a ti mismo' })
		}

		const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(artistId)

		const artistProfile = await db
			.select({
				profileId: artistProfiles.id,
				userId: artistProfiles.userId,
			})
			.from(artistProfiles)
			.where(
				looksLikeUuid
					? or(eq(artistProfiles.id, artistId), eq(artistProfiles.userId, artistId))
					: eq(artistProfiles.userId, artistId)
			)
			.limit(1)

		if (artistProfile.length === 0) {
			return res.status(404).json({ error: 'Artista no encontrado' })
		}

		const artistUserId = artistProfile[0].userId

		const artistRecord = await db.select().from(user).where(eq(user.id, artistUserId)).limit(1)
		if (artistRecord.length === 0) {
			return res.status(404).json({ error: 'Artista no encontrado' })
		}

		const bookingResult = await createBooking({
			artistId: artistUserId,
			clientId: session.user.id,
			eventDate,
			eventLocation,
			description,
			jobHours: parseFloat(jobHours),
			agreedPrice: agreedPrice !== undefined && agreedPrice !== null ? parseFloat(agreedPrice) : null,
		})

		return res.status(201).json({
			message: 'Reserva creada exitosamente',
			data: bookingResult.data,
		})
	} catch (error) {
		console.error('Error creating booking:', error)

		if (error.code === 'BOOKING_CONFLICT') {
			return res.status(409).json({
				error: error.message,
				code: 'BOOKING_CONFLICT',
				conflicts: error.conflicts || [],
			})
		}

		if (error.code === 'DUPLICATE_BOOKING_ATTEMPT') {
			return res.status(429).json({
				error: error.message,
				code: 'DUPLICATE_BOOKING_ATTEMPT',
			})
		}

		if (error.details) {
			return res.status(400).json({
				error: error.message,
				details: error.details,
			})
		}

		return res.status(500).json({
			error: error.message || 'Error al crear la reserva',
		})
	}
})

router.get('/artist', async (req, res) => {
	try {
		const session = await auth.api.getSession({ headers: req.headers })
		if (!session?.user?.id) {
			return res.status(401).json({ error: 'No autorizado' })
		}

		const rows = await db
			.select({
				id: bookings.id,
				eventDate: bookings.eventDate,
				eventLocation: bookings.eventLocation,
				description: bookings.description,
				jobHours: bookings.jobHours,
				agreedPrice: bookings.agreedPrice,
				status: bookings.status,
				createdAt: bookings.createdAt,
				clientName: user.name,
				clientEmail: user.email,
				clientImage: user.image,
			})
			.from(bookings)
			.leftJoin(user, eq(bookings.clientId, user.id))
			.where(eq(bookings.artistId, session.user.id))

		return res.json({ data: rows })
	} catch (error) {
		console.error('Error listado reservas', error)
		return res.status(500).json({ error: 'Error al cargar las reservas' })
	}
})

router.get('/availability/:artistId', async (req, res) => {
	try {
		const { artistId } = req.params
		const { dateFrom, dateTo } = req.query

		if (!dateFrom || !dateTo) {
			return res.status(400).json({
				error: 'dateFrom y dateTo son requeridos',
			})
		}

		const availability = await getArtistAvailability(artistId, dateFrom, dateTo)
		return res.json({ data: availability })
	} catch (error) {
		console.error('Error getting availability', error)
		return res.status(500).json({ error: 'Error al obtener disponibilidad' })
	}
})

router.get('/stats', async (req, res) => {
	try {
		const session = await auth.api.getSession({ headers: req.headers })
		if (!session?.user?.id) {
			return res.status(401).json({ error: 'No autorizado' })
		}

		const stats = await getArtistBookingStats(session.user.id)
		return res.json({ data: stats })
	} catch (error) {
		console.error('Error getting stats', error)
		return res.status(500).json({ error: 'Error al obtener estadísticas' })
	}
})

router.patch('/:id/status', async (req, res) => {
	try {
		const session = await auth.api.getSession({ headers: req.headers })
		if (!session?.user?.id) {
			return res.status(401).json({ error: 'No autorizado' })
		}

		const { status } = req.body
		if (!['aceptada', 'rechazada'].includes(status)) {
			return res.status(400).json({ error: 'Estado inválido' })
		}

		const [updated] = await db
			.update(bookings)
			.set({ status, updatedAt: new Date() })
			.where(
				and(
					eq(bookings.id, req.params.id),
					eq(bookings.artistId, session.user.id)
				)
			)
			.returning()

		if (!updated) {
			return res.status(404).json({ error: 'Reserva no encontrada' })
		}

		return res.json({ data: updated })
	} catch (error) {
		console.error('Error actualizacion reserva', error)
		return res.status(500).json({ error: 'Error al actualizar la reserva' })
	}
})

export { router as bookingsRouter }
