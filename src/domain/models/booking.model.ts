import type { UserModel } from "./user.model.js";

export interface BookingModel {
  id: string;
  clientId: string;
  artistId: string;
  eventDate: Date;
  eventLocation: string;
  description?: string | null;
  jobHours: number;
  agreedPrice: number;
  status: string;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client?: UserModel;
  artist?: UserModel;
}

