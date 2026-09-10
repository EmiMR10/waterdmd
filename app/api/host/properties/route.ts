import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireUser } from "@/lib/auth-user";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
        id,
        slug,
        title,
        location,
        region,
        price_cents,
        max_guests,
        published,
        image_url
      FROM properties
      WHERE host_user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No fue posible cargar propiedades";

    return NextResponse.json(
      { error: message === "UNAUTHORIZED" ? "Inicia sesión." : message },
      { status: message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    if (user.role !== "host") {
      return NextResponse.json(
        { error: "Solo los anfitriones pueden publicar." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      location,
      region,
      description,
      details,
      imageUrl,
      price,
      maxGuests,
    } = body;

    if (
      !title ||
      !location ||
      !region ||
      !description ||
      !details ||
      !imageUrl ||
      !price ||
      !maxGuests
    ) {
      return NextResponse.json(
        { error: "Completa todos los campos." },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    let slug = slugify(title);

    const duplicate = await sql`
      SELECT id
      FROM properties
      WHERE slug = ${slug}
      LIMIT 1
    `;

    if (duplicate.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const rows = await sql`
      INSERT INTO properties (
        host_user_id,
        slug,
        title,
        location,
        region,
        tag,
        description,
        details,
        host_name,
        image_url,
        accent,
        price_cents,
        max_guests,
        published
      )
      VALUES (
        ${user.id},
        ${slug},
        ${title},
        ${location},
        ${region},
        'Nueva estancia',
        ${description},
        ${details},
        ${user.name || "Anfitrión"},
        ${imageUrl},
        'host',
        ${Math.round(Number(price) * 100)},
        ${Number(maxGuests)},
        TRUE
      )
      RETURNING id, slug, title
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "No fue posible publicar la propiedad." },
      { status: 500 }
    );
  }
}
