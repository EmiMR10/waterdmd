"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, MapPin } from "lucide-react";
import type { Booking } from "@/lib/types";

function currency(cents: number) { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(cents / 100); }
function date(value: string) { return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00Z`)); }

export function MyBookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/bookings/mine").then(async (response) => { const json = await response.json(); if (!response.ok) throw new Error(json.error); setBookings(json); }).catch((reason) => setError(reason.message)).finally(() => setLoading(false)); }, []);
  async function cancel(id: number) { const response = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" }); const json = await response.json(); if (!response.ok) { setError(json.error); return; } setBookings((items) => items.map((booking) => booking.id === id ? { ...booking, status: "cancelled" } : booking)); }
  if (loading) return <main className="empty-page"><p className="eyebrow">Cargando tu cuenta</p><h1>Un momento, estamos preparando tus viajes.</h1></main>;
  if (error) return <main className="empty-page"><p className="eyebrow">Tu bitácora de viaje</p><h1>{error}</h1><Link className="button button--coral" href="/api/auth/signin">Iniciar sesión</Link></main>;
  return <main className="account-page"><Link className="back-link" href="/"><ChevronLeft size={17} /> Volver a explorar</Link><div className="detail-intro"><div><p className="eyebrow">Tu bitácora</p><h1>Reservas y<br /><em>próximos caminos.</em></h1></div><p className="detail-intro__note">Aquí quedan guardadas las reservas confirmadas desde tu cuenta.</p></div>{bookings.length === 0 ? <div className="empty-results"><CalendarDays size={22} /><h3>Aún no tienes reservas.</h3><p>Cuando confirmes una estancia, aparecerá aquí para que puedas consultarla.</p><Link className="button button--coral" href="/">Explorar estancias</Link></div> : <div className="booking-list">{bookings.map((booking) => <article className="booking-list__item" key={booking.id}><img src={booking.property.imageUrl} alt={`Vista de ${booking.property.title}`} /><div><p className="eyebrow">{booking.status === "confirmed" ? "Confirmada" : "Cancelada"}</p><h2>{booking.property.title}</h2><p className="property-card__location"><MapPin size={14} /> {booking.property.location}</p><p>{date(booking.checkIn)} — {date(booking.checkOut)} · {booking.guests} {booking.guests === 1 ? "huésped" : "huéspedes"}</p></div><div className="booking-list__action"><strong>{currency(booking.totalCents)}</strong><span>Total</span>{booking.status === "confirmed" ? <button className="text-link" type="button" onClick={() => cancel(booking.id)}>Cancelar</button> : <span>Cancelada</span>}</div></article>)}</div>}</main>;
}
