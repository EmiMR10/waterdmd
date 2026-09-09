export type Property = {
  id: number;
  slug: string;
  title: string;
  location: string;
  region: string;
  tag: string;
  description: string;
  details: string;
  hostName: string;
  imageUrl: string;
  accent: string;
  priceCents: number;
  maxGuests: number;
};

export type Booking = {
  id: number;
  status: "confirmed" | "cancelled";
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalCents: number;
  property: Pick<Property, "title" | "slug" | "location" | "imageUrl">;
};
