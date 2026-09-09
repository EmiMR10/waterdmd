import { NextResponse } from "next/server";
import { getProperties } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(await getProperties());
  } catch {
    return NextResponse.json({ error: "No fue posible cargar el catálogo." }, { status: 500 });
  }
}
