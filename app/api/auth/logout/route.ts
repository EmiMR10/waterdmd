import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Sesión cerrada correctamente",
  });

  response.cookies.set("waterdmd_user", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
