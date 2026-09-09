import { describe, expect, it } from "vitest";
import { quoteBooking } from "./booking";

const property = {
  id: 1,
  slug: "casa-brisa",
  title: "Casa Brisa",
  location: "Punta Mita, Nayarit",
  region: "Pacífico",
  tag: "Frente al mar",
  description: "Una estancia de prueba para verificar los cálculos.",
  details: "2 habitaciones",
  hostName: "Waterdmd",
  imageUrl: "/media/mini-airbnb-cabin.jpg",
  accent: "nopal",
  priceCents: 250000,
  maxGuests: 4,
};

describe("quoteBooking", () => {
  it("calcula noches, subtotal, comisión y total de una reserva válida", () => {
    expect(quoteBooking(property, "2026-10-10", "2026-10-13", 2)).toMatchObject({
      nights: 3,
      guests: 2,
      subtotalCents: 750000,
      serviceFeeCents: 90000,
      totalCents: 840000,
    });
  });

  it("rechaza una salida que no sea posterior a la llegada", () => {
    expect(() => quoteBooking(property, "2026-10-10", "2026-10-10", 2)).toThrow();
  });

  it("rechaza más huéspedes que la capacidad de la estancia", () => {
    expect(() => quoteBooking(property, "2026-10-10", "2026-10-13", 5)).toThrow();
  });
});
