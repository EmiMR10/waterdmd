import type { Property } from "@/lib/types";

export function dateFromInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Selecciona fechas válidas.");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Selecciona fechas válidas.");
  return date;
}

export function quoteBooking(property: Property, checkInInput: string, checkOutInput: string, guests: number) {
  const checkIn = dateFromInput(checkInInput);
  const checkOut = dateFromInput(checkOutInput);
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  if (nights < 1 || nights > 60) throw new Error("La estancia debe ser de 1 a 60 noches.");
  if (!Number.isInteger(guests) || guests < 1 || guests > property.maxGuests) throw new Error("El número de huéspedes no es válido para esta estancia.");
  const subtotalCents = property.priceCents * nights;
  const serviceFeeCents = Math.round(subtotalCents * 0.12);
  return { checkIn, checkOut, nights, guests, subtotalCents, serviceFeeCents, totalCents: subtotalCents + serviceFeeCents };
}
