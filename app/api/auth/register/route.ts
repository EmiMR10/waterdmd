import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Completa todos los campos" },
        { status: 400 }
      );
    }

    if (role !== "guest" && role !== "host") {
      return NextResponse.json(
        { error: "Tipo de cuenta inválido" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    const existing = await sql`
      SELECT id FROM users WHERE LOWER(email) = LOWER(${email})
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Ese correo ya está registrado" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const rows = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email.toLowerCase()}, ${passwordHash}, ${role})
      RETURNING id, name, email, role
    `;

    return NextResponse.json({
      message: "Cuenta creada correctamente",
      user: rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "No fue posible crear la cuenta" },
      { status: 500 }
    );
  }
}
