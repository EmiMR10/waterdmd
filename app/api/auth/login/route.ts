import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    const users = await sql`
      SELECT id, name, email, password_hash, role
      FROM users
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const user = users[0];

    if (!user.password_hash) {
      return NextResponse.json(
        { error: "Esta cuenta no tiene contraseña configurada" },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const response = NextResponse.json({
      message: "Inicio de sesión correcto",
      user: sessionUser,
    });

    response.cookies.set(
      "waterdmd_user",
      JSON.stringify(sessionUser),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "No fue posible iniciar sesión" },
      { status: 500 }
    );
  }
}
