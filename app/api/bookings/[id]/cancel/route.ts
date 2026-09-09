import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireUser } from "@/lib/auth-user";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const bookingId = Number(id);
    if (!Number.isInteger(bookingId) || bookingId < 1) return NextResponse.json({ error: "Reserva no válida." }, { status: 400 });
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL no está configurada.");
    const sql = neon(connectionString);
    const result = await sql`UPDATE bookings SET status = 'cancelled' WHERE id = ${bookingId} AND user_id = ${user.id} AND status = 'confirmed' RETURNING id`;
    if (!result.length) return NextResponse.json({ error: "No encontramos una reserva activa para cancelar." }, { status: 404 });
    return NextResponse.json({ cancelled: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible cancelar la reserva.";
    return NextResponse.json({ error: message === "UNAUTHORIZED" ? "Inicia sesión para continuar." : message }, { status: message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
