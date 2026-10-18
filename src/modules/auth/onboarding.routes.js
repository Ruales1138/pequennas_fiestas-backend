import express from "express";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto"

import {db} from "../../config/db.js"
import { user, artistProfiles } from "../../schemas/schema.js";
import { auth } from "../../config/auth.js";

export const onboardingRouter = express.Router()

onboardingRouter.post("/role", async (req, res) => {
    try{
        const session = await auth.api.getSession(
            {headers:req.headers}
        )

        if (!session?.user?.id){
            return res.status(401).json(
                {error: "Unauthorized"}
            )
        }

        const userId = session.user.id;

        const { role } = req.body ?? {};

        if (role !== "cliente" && role !== "artista") {
            return res.status(400).json({error: "Invalid role"})
        }

        await db.update(user).set({role}).where(
            eq(user.id, userId)
        ).execute()

        if (role === "artista"){
            const existing = await db.select({id: artistProfiles.id}).from(artistProfiles)
            .where(eq(artistProfiles.userId,userId)).limit(1);
            
            if (existing.length === 0){
                await db.insert(artistProfiles).values({
                    id: randomUUID(),
                    userId,
                });
            }
        }
        
        return res.json({ok:true,role})
    } catch (err){
        console.log(err);
        return res.status(500).json({error: "Internal Server Error"})
    }
})

onboardingRouter.post("/artist-profile", async (req, res) => {
  try {
    const { userId, bio, contactPhone, contactSocial, baseRate, city, coverageArea, category } = req.body

    if (!userId) return res.status(400).json({ error: 'userId requerido' })

    const [profile] = await db
      .insert(artistProfiles)
      .values({
        id: randomUUID(),
        userId,
        bio,
        contactPhone,
        contactSocial,
        baseRate,
        city,
            converageArea: coverageArea,
        category,
      })
      .returning()

    res.status(201).json(profile)
  } catch (error) {
    console.error('Error guardando perfil:', error)
    res.status(500).json({ error: 'Error al guardar el perfil' })
  }
})