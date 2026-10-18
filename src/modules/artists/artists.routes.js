import express from "express";

import { createArtistRating, getArtistById, getArtists, listRatingsByArtist } from "./artists.controller.js";

export const artistsRouter = express.Router();

artistsRouter.get("/", getArtists);
artistsRouter.get("/:id/ratings", listRatingsByArtist);
artistsRouter.post("/:id/ratings", createArtistRating);
artistsRouter.get("/:id", getArtistById);
