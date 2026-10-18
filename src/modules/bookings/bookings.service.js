import { randomUUID } from 'node:crypto'
import { db } from '../../config/db.js'
import { bookings } from '../../schemas/app.schema.js'
import { eq, and, gte, lte } from 'drizzle-orm'

export async function checkBookingConflict(artistId, eventDate, jobHours) {
	try {
		const startTime = new Date(eventDate)
		const endTime = new Date(startTime.getTime() + jobHours * 60 * 60 * 1000)

		const artistBookings = await db.select().from(bookings).where(eq(bookings.artistId, artistId))
		const activeConflicts = artistBookings.filter((booking) => {
			if (booking.status === 'rechazada') {
				return false
			}

			const existingStart = new Date(booking.eventDate)
			const existingEnd = new Date(existingStart.getTime() + (booking.jobHours || 0) * 60 * 60 * 1000)

			return startTime < existingEnd && endTime > existingStart
		})

		return {
			hasConflict: activeConflicts.length > 0,
			conflictingBookings: activeConflicts,
		}
	} catch (error) {
		console.error('Error checking booking conflict:', error)
		throw new Error('Error al verificar disponibilidad del artista')
	}
}

export function validateBookingData(data) {
	const errors = []

	if (!data.artistId || typeof data.artistId !== 'string') {
		errors.push('ID del artista es requerido')
	}

	if (!data.clientId || typeof data.clientId !== 'string') {
		errors.push('ID del cliente es requerido')
	}

	if (!data.eventDate) {
		errors.push('Fecha del evento es requerida')
	} else {
		const eventDate = new Date(data.eventDate)
		if (isNaN(eventDate.getTime())) {
			errors.push('Fecha del evento inválida')
		}
		if (eventDate < new Date()) {
			errors.push('La fecha del evento debe ser en el futuro')
		}
	}

	if (!data.eventLocation || typeof data.eventLocation !== 'string' || data.eventLocation.trim().length === 0) {
		errors.push('Ubicación del evento es requerida')
	}

	if (!data.jobHours || typeof data.jobHours !== 'number') {
		errors.push('Horas de trabajo es requerido')
	} else if (data.jobHours <= 0) {
		errors.push('Las horas de trabajo deben ser mayor a 0')
	} else if (data.jobHours > 24) {
		errors.push('Las horas de trabajo no pueden exceder 24 horas')
	}

	if (data.agreedPrice !== undefined && data.agreedPrice !== null) {
		if (typeof data.agreedPrice !== 'number' || data.agreedPrice < 0) {
			errors.push('Precio debe ser un número positivo')
		}
	}

	if (data.description && typeof data.description !== 'string') {
		errors.push('Descripción debe ser texto')
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}

export async function createBooking(bookingData) {
	try {
		const validation = validateBookingData(bookingData)
		if (!validation.isValid) {
			const error = new Error('Datos de reserva inválidos')
			error.details = validation.errors
			throw error
		}

		const conflictCheck = await checkBookingConflict(
			bookingData.artistId,
			bookingData.eventDate,
			parseFloat(bookingData.jobHours)
		)

		if (conflictCheck.hasConflict) {
			const error = new Error('El artista no está disponible en la fecha y hora seleccionada')
			error.code = 'BOOKING_CONFLICT'
			error.conflicts = conflictCheck.conflictingBookings
			throw error
		}

		const recentBooking = await db
			.select()
			.from(bookings)
			.where(
				and(
					eq(bookings.artistId, bookingData.artistId),
					eq(bookings.clientId, bookingData.clientId),
					gte(bookings.createdAt, new Date(Date.now() - 5000))
				)
			)
			.limit(1)

		if (recentBooking.length > 0) {
			const error = new Error('Ya existe una reserva reciente para este artista. Espere un momento antes de intentar de nuevo.')
			error.code = 'DUPLICATE_BOOKING_ATTEMPT'
			throw error
		}

		const newBooking = await db
			.insert(bookings)
			.values({
				id: randomUUID(),
				clientId: bookingData.clientId,
				artistId: bookingData.artistId,
				eventDate: new Date(bookingData.eventDate),
				eventLocation: bookingData.eventLocation,
				description: bookingData.description || null,
				jobHours: parseFloat(bookingData.jobHours),
				agreedPrice:
					bookingData.agreedPrice !== undefined && bookingData.agreedPrice !== null
						? parseFloat(bookingData.agreedPrice)
						: null,
				status: 'pendiente',
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()

		return {
			success: true,
			data: newBooking[0],
		}
	} catch (error) {
		console.error('Error creating booking:', error)
		throw error
	}
}

export async function getArtistAvailability(artistId, dateFrom, dateTo) {
	try {
		const artistBookings = await db
			.select({
				id: bookings.id,
				eventDate: bookings.eventDate,
				jobHours: bookings.jobHours,
				status: bookings.status,
			})
			.from(bookings)
			.where(
				and(
					eq(bookings.artistId, artistId),
					gte(bookings.eventDate, new Date(dateFrom)),
					lte(bookings.eventDate, new Date(dateTo))
				)
			)
			.orderBy(bookings.eventDate)

		const activeBookings = artistBookings.filter((booking) => booking.status !== 'rechazada')

		return {
			artistId,
			dateFrom,
			dateTo,
			bookedSlots: activeBookings,
			totalBookings: activeBookings.length,
		}
	} catch (error) {
		console.error('Error getting artist availability:', error)
		throw error
	}
}

export async function cancelBooking(bookingId, artistId) {
	try {
		const cancelled = await db
			.update(bookings)
			.set({
				status: 'rechazada',
				updatedAt: new Date(),
			})
			.where(and(eq(bookings.id, bookingId), eq(bookings.artistId, artistId)))
			.returning()

		if (cancelled.length === 0) {
			throw new Error('Reserva no encontrada')
		}

		return {
			success: true,
			data: cancelled[0],
		}
	} catch (error) {
		console.error('Error cancelling booking:', error)
		throw error
	}
}

export async function getArtistBookingStats(artistId) {
	try {
		const allBookings = await db.select().from(bookings).where(eq(bookings.artistId, artistId))

		return {
			total: allBookings.length,
			pending: allBookings.filter((b) => b.status === 'pendiente').length,
			accepted: allBookings.filter((b) => b.status === 'aceptada').length,
			rejected: allBookings.filter((b) => b.status === 'rechazada').length,
		}
	} catch (error) {
		console.error('Error getting booking stats:', error)
		throw error
	}
}
