"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, MapPin } from "lucide-react";
import type { Property } from "@/lib/types";

export function PropertyCard({ property, featured, saved, onToggleSaved }: { property: Property; featured?: boolean; saved: boolean; onToggleSaved: (slug: string) => void }) {
  return (
    <article className={`property-card ${featured ? "property-card--featured" : ""}`}>
      <div className="property-card__image-wrap"><img className="property-card__image" src={property.imageUrl} alt={`Vista de ${property.title}`} /><div className="property-card__topline"><span className="eyebrow-chip">{property.tag}</span><button aria-label={saved ? "Quitar de guardadas" : "Guardar estancia"} className={`save-button ${saved ? "save-button--active" : ""}`} onClick={() => onToggleSaved(property.slug)} type="button"><Heart size={16} fill={saved ? "currentColor" : "none"} /></button></div>{featured && <span className="featured-note">Elección de la guía</span>}</div>
      <div className="property-card__body"><p className="property-card__location"><MapPin size={13} /> {property.location}</p><div className="property-card__heading"><h3>{property.title}</h3></div><p className="property-card__description">{property.description}</p><div className="property-card__footer"><span><strong>${(property.priceCents / 100).toLocaleString("es-MX")}</strong> MXN / noche</span><Link className="text-link" href={`/estancias/${property.slug}`}>Ver ficha <ArrowUpRight size={15} /></Link></div></div>
    </article>
  );
}
