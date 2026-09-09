import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { quoteBooking } from "@/lib/booking";
import { requireUser } from "@/lib/auth-user";
import { getProperty } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json() as { slug?: string; checkIn?: string; checkOut?: string; guests?: number };
    const guests = Number(body.guests);
    if (!body.slug || !body.checkIn || !body.checkOut || !Number.isInteger(guests)) return NextResponse.json({ error: "Completa las fechas y los huéspedes." }, { status: 400 });
    const property = await getProperty(body.slug);
    if (!property) return NextResponse.json({ error: "Estancia no encontrada." }, { status: 404 });
    const quote = quoteBooking(property, body.checkIn, body.checkOut, guests);
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL no está configurada.");
    const sql = neon(connectionString);
    const rows = await sql`INSERT INTO bookings (user_id, property_id, check_in, check_out, guests, nights, nightly_rate_cents, subtotal_cents, service_fee_cents, total_cents) VALUES (${user.id}, ${property.id}, ${body.checkIn}, ${body.checkOut}, ${quote.guests}, ${quote.nights}, ${property.priceCents}, ${quote.subtotalCents}, ${quote.serviceFeeCents}, ${quote.totalCents}) RETURNING id` as { id: number }[];
    return NextResponse.json({ bookingId: Number(rows[0].id), ...quote }, { status: 201 });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "23P01") return NextResponse.json({ error: "Estas fechas ya no están disponibles." }, { status: 409 });
    const message = error instanceof Error ? error.message : "No fue posible confirmar la reserva.";
    return NextResponse.json({ error: message === "UNAUTHORIZED" ? "Inicia sesión para confirmar una reserva." : message }, { status: message === "UNAUTHORIZED" ? 401 : 400 });
  }
}
