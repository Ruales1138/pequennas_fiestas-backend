import { pgTable, uuid, text, boolean, timestamp, numeric, index, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth.schema.js";
import { decimal } from "drizzle-orm/gel-core";

export const artistProfiles = pgTable("artist_profiles", {
    id: uuid("id").primaryKey(),
    userId: text("user_id").notNull().unique(),

    bio: text("bio"),
    contactPhone: text("contact_phone"),
    contactSocial: text("contact_social"),
    baseRate: numeric("base_rate", {precision:10, scale:2}),
    city: text("city"),
    converageArea: text("converage_area"),
    category: text("category")
})

export const bookings = pgTable("bookings", {
    id: uuid("id").primaryKey(),
    clientId: text('client_id').notNull().references(() => user.id),
    artistId: text('artist_id').notNull().references(() => user.id),
    eventDate: timestamp('event_date').notNull(),
    eventLocation: text('event_location').notNull(),
    description: text('description'),
    jobHours: numeric('job_hours', {precision:5, scale:2}),
    agreedPrice: decimal('agreed_price', {precision:10,scale:2}),
    status: text('status').notNull().default('pendiente'),
    createdAt: timestamp('create_at').notNull().defaultNow(),
    updatedAt: timestamp('update_at').notNull().defaultNow()
    }
)

export const artistRatings = pgTable(
    "artist_ratings",
    {
        id: uuid("id").primaryKey(),
        artistId: text("artist_id").notNull().references(() => user.id, { onDelete: "cascade" }),
        clientId: text("client_id").notNull().references(() => user.id, { onDelete: "cascade" }),
        rating: numeric("rating", { precision: 3, scale: 1 }).notNull(),
        comment: text("comment"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => ({
        artistIndex: index("artist_ratings_artist_idx").on(table.artistId),
        artistClientUnique: uniqueIndex("artist_ratings_artist_client_unique").on(table.artistId, table.clientId),
    })
)