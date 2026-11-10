import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import path from "node:path";

export interface IStorageService {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<string>;
}

export class SupabaseStorageService implements IStorageService {
  private client: SupabaseClient | null = null;
  private bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
    this.bucket = process.env.SUPABASE_BUCKET || "artists";

    if (url && key) {
      this.client = createClient(url, key, {
        auth: { persistSession: false },
      });
    }
  }

  async uploadFile(file: Express.Multer.File, folder = "uploads"): Promise<string> {
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `${folder}/${randomUUID()}${ext}`;

    if (this.client) {
      const { data, error } = await this.client.storage
        .from(this.bucket)
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new Error(`Error subiendo archivo a Supabase Storage: ${error.message}`);
      }

      const { data: publicUrlData } = this.client.storage
        .from(this.bucket)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    }

    // Fallback URL simulada cuando las credenciales de Supabase no están configuradas en .env
    const fallbackBase =
      process.env.SUPABASE_URL ||
      process.env.BACKEND_URL ||
      "https://supabase-storage.gigashow.pequenasfiestas.app";
    return `${fallbackBase}/storage/v1/object/public/${this.bucket}/${filename}`;
  }
}

