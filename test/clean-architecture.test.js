import assert from "node:assert/strict";
import test from "node:test";

import {
  ListArtistsUseCase,
  CreateBookingUseCase,
  CreateRatingUseCase,
  UploadImageUseCase,
} from "../dist/application/index.js";
import { BadRequestError, ConflictError } from "../dist/shared/errors.js";

test("ListArtistsUseCase applies pagination and filters correctly", async () => {
  const mockArtistRepo = {
    findMany: async (filters, skip, limit) => {
      assert.equal(skip, 10);
      assert.equal(limit, 10);
      assert.equal(filters.category, "humor");
      return {
        items: [
          {
            id: "artist-1",
            userId: "u-1",
            city: "Medellín",
            category: "humor",
            baseRate: 150000,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 25,
      };
    },
  };

  const useCase = new ListArtistsUseCase(mockArtistRepo);
  const result = await useCase.execute({
    page: "2",
    limit: "10",
    category: "humor",
  });

  assert.equal(result.data.length, 1);
  assert.equal(result.pagination.total, 25);
  assert.equal(result.pagination.currentPage, 2);
  assert.equal(result.pagination.limit, 10);
  assert.equal(result.pagination.totalPages, 3);
});

test("CreateBookingUseCase rejects booking for self or schedule conflict", async () => {
  const mockBookingRepo = {
    hasConflict: async () => true,
    create: async () => ({ id: "book-1" }),
  };

  const useCase = new CreateBookingUseCase(mockBookingRepo);

  // Self booking error
  await assert.rejects(
    async () => {
      await useCase.execute({
        clientId: "same-user",
        artistId: "same-user",
        eventDate: new Date(Date.now() + 86400000),
        eventLocation: "Salón de eventos",
        jobHours: 2,
        agreedPrice: 200000,
      });
    },
    (err) => err instanceof BadRequestError
  );

  // Conflict error
  await assert.rejects(
    async () => {
      await useCase.execute({
        clientId: "client-1",
        artistId: "artist-1",
        eventDate: new Date(Date.now() + 86400000),
        eventLocation: "Salón de eventos",
        jobHours: 2,
        agreedPrice: 200000,
      });
    },
    (err) => err instanceof ConflictError
  );
});

test("CreateRatingUseCase prevents self rating and duplicate rating", async () => {
  const mockRatingRepo = {
    findByArtistAndClient: async () => ({ id: "rating-1" }),
    create: async () => ({ id: "rating-2" }),
  };

  const useCase = new CreateRatingUseCase(mockRatingRepo);

  // Self rating error
  await assert.rejects(
    async () => {
      await useCase.execute({
        artistId: "user-1",
        clientId: "user-1",
        rating: 5,
      });
    },
    (err) => err instanceof BadRequestError
  );

  // Duplicate rating error
  await assert.rejects(
    async () => {
      await useCase.execute({
        artistId: "artist-1",
        clientId: "client-1",
        rating: 4.5,
      });
    },
    (err) => err instanceof ConflictError
  );
});

test("UploadImageUseCase validates file type and size", async () => {
  const mockStorageService = {
    uploadFile: async () => "https://supabase-storage.url/image.jpg",
  };

  const useCase = new UploadImageUseCase(mockStorageService);

  // Missing file
  await assert.rejects(
    async () => {
      await useCase.execute(undefined);
    },
    (err) => err instanceof BadRequestError
  );

  // Invalid mime type
  await assert.rejects(
    async () => {
      await useCase.execute({
        mimetype: "application/pdf",
        size: 1024,
      });
    },
    (err) => err instanceof BadRequestError
  );

  // Exceeded file size (> 5MB)
  await assert.rejects(
    async () => {
      await useCase.execute({
        mimetype: "image/png",
        size: 6 * 1024 * 1024,
      });
    },
    (err) => err instanceof BadRequestError
  );

  // Valid upload
  const res = await useCase.execute({
    mimetype: "image/jpeg",
    size: 2 * 1024 * 1024,
  });
  assert.equal(res.fileUrl, "https://supabase-storage.url/image.jpg");
});
