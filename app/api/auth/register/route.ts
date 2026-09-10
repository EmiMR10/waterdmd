import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Ese correo ya está registrado" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name || null}, ${email}, ${passwordHash})
      RETURNING id, name, email
    `;

    return NextResponse.json({
      message: "Usuario creado correctamente",
      user: result[0],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
