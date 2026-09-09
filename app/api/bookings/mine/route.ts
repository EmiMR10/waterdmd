import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireUser } from "@/lib/auth-user";

export async function GET() {
  try {
    const user = await requireUser();
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL no está configurada.");
    const sql = neon(connectionString);
    const rows = await sql`SELECT b.id, b.status, b.check_in, b.check_out, b.guests, b.nights, b.total_cents, p.title, p.slug, p.location, p.image_url FROM bookings b INNER JOIN properties p ON p.id = b.property_id WHERE b.user_id = ${user.id} ORDER BY b.created_at DESC` as { id: number; status: "confirmed" | "cancelled"; check_in: string; check_out: string; guests: number; nights: number; total_cents: number; title: string; slug: string; location: string; image_url: string }[];
    return NextResponse.json(rows.map((row) => ({ id: Number(row.id), status: row.status, checkIn: String(row.check_in).slice(0, 10), checkOut: String(row.check_out).slice(0, 10), guests: Number(row.guests), nights: Number(row.nights), totalCents: Number(row.total_cents), property: { title: row.title, slug: row.slug, location: row.location, imageUrl: row.image_url } })));
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible cargar las reservas.";
    return NextResponse.json({ error: message === "UNAUTHORIZED" ? "Inicia sesión para continuar." : message }, { status: message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
