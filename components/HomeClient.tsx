"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, Compass, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/PropertyCard";

const categories = ["Todos", "Escapada lenta", "Para trabajar", "Junto al mar", "Pista local", "Naturaleza"];

export function HomeClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { Promise.all([fetch("/api/properties").then((r) => r.json()), fetch("/api/favorites").then((r) => r.ok ? r.json() : { propertyIds: [] })]).then(([catalog, favorites]) => { setProperties(catalog); setSavedIds(favorites.propertyIds ?? []); }).catch(() => setMessage("No pudimos cargar las estancias. Intenta recargar la página.")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => properties.filter((p) => (category === "Todos" || p.tag === category) && `${p.title} ${p.location} ${p.region}`.toLowerCase().includes(search.trim().toLowerCase())), [category, properties, search]);

  async function toggleSaved(slug: string) {
    const response = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Inicia sesión para guardar estancias."); return; }
    const property = properties.find((item) => item.slug === slug);
    if (!property) return;
    setSavedIds((ids) => result.saved ? [...ids, property.id] : ids.filter((id) => id !== property.id));
  }

  return <div className="home-page"><main>
    <section className="hero-section"><img className="hero-section__image" src="/media/mini-airbnb-hero.jpg" alt="Sala luminosa frente al mar" /><div className="hero-section__veil" /><div className="hero-section__copy"><p className="eyebrow eyebrow--light">Pequeñas estancias, grandes historias</p><h1>Quédate donde<br /><em>empieza el día.</em></h1><p>Una forma sencilla de descubrir casas con carácter, barrios para caminar y anfitriones que conocen el camino.</p><a className="hero-scroll" href="#explorar"><span>Explorar estancias</span><ArrowDown size={17} /></a></div><div className="hero-section__stamp"><Compass size={16} /> Guía local · 01</div></section>
    <section className="search-panel" aria-label="Buscar una estancia"><div className="search-panel__field search-panel__field--wide"><Search size={18} /><label htmlFor="destination">¿A dónde te lleva el fin de semana?</label><input id="destination" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ciudad, región o nombre" /></div><div className="search-panel__field"><span className="field-kicker">Cuándo</span><button type="button" onClick={() => document.getElementById("explorar")?.scrollIntoView({ behavior: "smooth" })}>Elige tus fechas <ArrowDown size={14} /></button></div><div className="search-panel__field"><span className="field-kicker">Quiénes</span><button type="button" onClick={() => document.getElementById("explorar")?.scrollIntoView({ behavior: "smooth" })}>Añade huéspedes <ArrowDown size={14} /></button></div><button className="search-panel__submit" type="button" aria-label="Buscar"><Search size={19} /></button></section>
    <section className="explore-section" id="explorar"><div className="section-heading"><div><p className="eyebrow">Una selección para empezar</p><h2>Encuentra tu próxima<br /><em>pista local.</em></h2></div><p className="section-heading__aside">No necesitas planearlo todo.<br />Empieza por un lugar que te dé curiosidad.</p></div><div className="category-row" role="tablist">{categories.map((item) => <button className={category === item ? "category-button category-button--active" : "category-button"} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}<button className="filter-button" type="button"><SlidersHorizontal size={15} /> Sin filtros extra</button></div>{message && <p className="form-message form-message--error">{message}</p>}{loading ? <div className="empty-results"><h3>Preparando estancias…</h3></div> : filtered.length ? <div className="property-grid">{filtered.map((property, index) => <PropertyCard key={property.id} property={property} saved={savedIds.includes(property.id)} onToggleSaved={toggleSaved} featured={index === 0 && category === "Todos"} />)}</div> : <div className="empty-results"><Sparkles size={22} /><h3>No encontramos esa pista todavía.</h3><p>Prueba con otra ciudad o vuelve a ver todas las estancias.</p></div>}</section>
    <section className="local-note" id="pistas"><div className="local-note__marker"><span>02</span></div><div><p className="eyebrow">La idea detrás de waterdmd</p><h2>Viajar también es<br /><em>aprender a mirar.</em></h2></div><div className="local-note__copy"><p>waterdmd empieza por lo esencial: una buena fotografía y una pista local que te ayude a imaginar el viaje antes de llegar.</p><Link className="text-link" href="/estancias/casa-brisa">Abrir una ficha de viaje <ArrowUpRight size={15} /></Link></div></section>
    <section className="how-section" id="como-funciona"><div className="how-section__intro"><p className="eyebrow">Cómo funciona</p><h2>Tres pasos para<br /><em>empezar.</em></h2></div><div className="how-list"><div><span>01</span><h3>Explora</h3><p>Usa la búsqueda y las categorías para encontrar una estancia que se parezca a tu viaje.</p></div><div><span>02</span><h3>Guarda</h3><p>Inicia sesión para guardar las estancias que quieres volver a mirar.</p></div><div><span>03</span><h3>Reserva</h3><p>Elige fechas y confirma una estancia disponible desde tu cuenta.</p></div></div></section>
  </main></div>;
}
