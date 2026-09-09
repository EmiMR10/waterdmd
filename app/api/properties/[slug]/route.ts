import { NextResponse } from "next/server";
import { getProperty } from "@/lib/db";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const property = await getProperty(slug);
    if (!property) return NextResponse.json({ error: "Estancia no encontrada." }, { status: 404 });
    return NextResponse.json(property);
  } catch {
    return NextResponse.json({ error: "No fue posible cargar la estancia." }, { status: 500 });
  }
}
