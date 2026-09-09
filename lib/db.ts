import "server-only";

import { neon } from "@neondatabase/serverless";
import type { Property } from "@/lib/types";

type PropertyRow = {
  id: number;
  slug: string;
  title: string;
  location: string;
  region: string;
  tag: string;
  description: string;
  details: string;
  host_name: string;
  image_url: string;
  accent: string;
  price_cents: number;
  max_guests: number;
};

function sql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL no está configurada.");
  return neon(connectionString);
}

function mapProperty(row: PropertyRow): Property {
  return {
    id: Number(row.id), slug: row.slug, title: row.title, location: row.location,
    region: row.region, tag: row.tag, description: row.description, details: row.details,
    hostName: row.host_name, imageUrl: row.image_url, accent: row.accent,
    priceCents: Number(row.price_cents), maxGuests: Number(row.max_guests),
  };
}

export async function getProperties(): Promise<Property[]> {
  const rows = await sql()`SELECT id, slug, title, location, region, tag, description, details, host_name, image_url, accent, price_cents, max_guests FROM properties WHERE published = true ORDER BY id` as PropertyRow[];
  return rows.map(mapProperty);
}

export async function getProperty(slug: string): Promise<Property | null> {
  const rows = await sql()`SELECT id, slug, title, location, region, tag, description, details, host_name, image_url, accent, price_cents, max_guests FROM properties WHERE slug = ${slug} AND published = true LIMIT 1` as PropertyRow[];
  return rows[0] ? mapProperty(rows[0]) : null;
}

export async function getOrCreateUser(email: string, name: string | null | undefined, image: string | null | undefined) {
  const rows = await sql()`INSERT INTO users (email, name, image_url) VALUES (${email}, ${name ?? null}, ${image ?? null}) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url RETURNING id` as { id: number }[];
  return Number(rows[0].id);
}

export async function getSavedIds(userId: number): Promise<number[]> {
  const rows = await sql()`SELECT property_id FROM saved_properties WHERE user_id = ${userId}` as { property_id: number }[];
  return rows.map((row) => Number(row.property_id));
}

export async function toggleSaved(userId: number, propertyId: number) {
  const db = sql();
  const existing = await db`SELECT id FROM saved_properties WHERE user_id = ${userId} AND property_id = ${propertyId} LIMIT 1` as { id: number }[];
  if (existing[0]) {
    await db`DELETE FROM saved_properties WHERE id = ${existing[0].id}`;
    return false;
  }
  await db`INSERT INTO saved_properties (user_id, property_id) VALUES (${userId}, ${propertyId})`;
  return true;
}
