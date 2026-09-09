import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "waterdmd · Estancias con carácter",
  description: "Una guía mexicana de estancias con carácter, reservas y favoritos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
