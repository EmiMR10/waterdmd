"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type PropertyRow = {
  id: number;
  slug: string;
  title: string;
  location: string;
  region: string;
  price_cents: number;
  max_guests: number;
  published: boolean;
  image_url: string;
};

type BookingRow = {
  id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_cents: number;
  status: string;
  property_title: string;
  guest_name: string | null;
  guest_email: string;
};

function money(cents: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function HostPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [maxGuests, setMaxGuests] = useState("2");

  async function loadData() {
    const [propertiesResponse, bookingsResponse] = await Promise.all([
      fetch("/api/host/properties"),
      fetch("/api/host/bookings"),
    ]);

    if (propertiesResponse.status === 401 || bookingsResponse.status === 401) {
      window.location.assign("/login");
      return;
    }

    if (propertiesResponse.status === 403 || bookingsResponse.status === 403) {
      setError("Esta sección es solo para anfitriones.");
      return;
    }

    const propertiesData = await propertiesResponse.json();
    const bookingsData = await bookingsResponse.json();

    if (!propertiesResponse.ok) {
      setError(propertiesData.error || "No fue posible cargar propiedades.");
      return;
    }

    if (!bookingsResponse.ok) {
      setError(bookingsData.error || "No fue posible cargar reservas.");
      return;
    }

    setProperties(propertiesData);
    setBookings(bookingsData);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const response = await fetch("/api/host/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        location,
        region,
        description,
        details,
        imageUrl,
        price,
        maxGuests,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "No fue posible publicar.");
      return;
    }

    setMessage("Propiedad publicada correctamente.");
    setTitle("");
    setLocation("");
    setRegion("");
    setDescription("");
    setDetails("");
    setImageUrl("");
    setPrice("");
    setMaxGuests("2");

    await loadData();
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <Link href="/">← Volver al inicio</Link>

      <h1 style={{ marginTop: 24 }}>Panel de anfitrión</h1>
      <p>Publica tus estancias y revisa quién reservó.</p>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <section style={{ marginTop: 48 }}>
        <h2>Publicar alojamiento</h2>

        <form
          onSubmit={publish}
          style={{
            display: "grid",
            gap: 12,
            maxWidth: 650,
          }}
        >
          <input
            placeholder="Nombre de la propiedad"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            placeholder="Ciudad o ubicación"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <input
            placeholder="Estado o región"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
          />

          <textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <textarea
            placeholder="Detalles de la estancia"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />

          <input
            placeholder="URL de imagen"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />

          <input
            type="number"
            min="1"
            placeholder="Precio por noche MXN"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <input
            type="number"
            min="1"
            max="20"
            placeholder="Máximo de huéspedes"
            value={maxGuests}
            onChange={(e) => setMaxGuests(e.target.value)}
            required
          />

          <button type="submit">Publicar alojamiento</button>
        </form>
      </section>

      <section style={{ marginTop: 56 }}>
        <h2>Mis alojamientos</h2>

        {properties.length === 0 ? (
          <p>Todavía no has publicado propiedades.</p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {properties.map((property) => (
              <article key={property.id}>
                <strong>{property.title}</strong>
                <div>
                  {property.location}, {property.region}
                </div>
                <div>{money(Number(property.price_cents))} por noche</div>
                <div>Máximo {property.max_guests} huéspedes</div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 56 }}>
        <h2>Reservas recibidas</h2>

        {bookings.length === 0 ? (
          <p>Todavía no tienes reservas.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>Propiedad</th>
                  <th>Huésped</th>
                  <th>Correo</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Personas</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.property_title}</td>
                    <td>{booking.guest_name || "Sin nombre"}</td>
                    <td>{booking.guest_email}</td>
                    <td>{String(booking.check_in).slice(0, 10)}</td>
                    <td>{String(booking.check_out).slice(0, 10)}</td>
                    <td>{booking.guests}</td>
                    <td>{money(Number(booking.total_cents))}</td>
                    <td>{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
