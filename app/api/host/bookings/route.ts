import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireUser } from "@/lib/auth-user";

export async function GET() {
  try {
    const user = await requireUser();

    if (user.role !== "host") {
      return NextResponse.json(
        { error: "Solo los anfitriones pueden acceder." },
        { status: 403 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    const rows = await sql`
      SELECT
        b.id,
        b.check_in,
        b.check_out,
        b.guests,
        b.nights,
        b.total_cents,
        b.status,
        b.created_at,
        p.title AS property_title,
        p.slug AS property_slug,
        u.name AS guest_name,
        u.email AS guest_email
      FROM bookings b
      INNER JOIN properties p ON p.id = b.property_id
      INNER JOIN users u ON u.id = b.user_id
      WHERE p.host_user_id = ${user.id}
      ORDER BY b.created_at DESC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No fue posible cargar reservas";

    return NextResponse.json(
      { error: message === "UNAUTHORIZED" ? "Inicia sesión." : message },
      { status: message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
