import { NextResponse } from "next/server";
import { getProperty, getSavedIds, toggleSaved } from "@/lib/db";
import { requireUser } from "@/lib/auth-user";

function errorResponse(error: unknown) {
  return NextResponse.json({ error: error instanceof Error && error.message === "UNAUTHORIZED" ? "Inicia sesión para continuar." : "No fue posible guardar la estancia." }, { status: error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500 });
}

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ propertyIds: await getSavedIds(user.id) });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json() as { slug?: string };
    if (!body.slug) return NextResponse.json({ error: "Falta la estancia." }, { status: 400 });
    const property = await getProperty(body.slug);
    if (!property) return NextResponse.json({ error: "Estancia no encontrada." }, { status: 404 });
    return NextResponse.json({ saved: await toggleSaved(user.id, property.id) });
  } catch (error) { return errorResponse(error); }
}
