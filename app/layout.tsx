import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GAMEKEY MARKET | Digital Game Store",
  description: "Explora videojuegos, ediciones y plataformas en GAMEKEY MARKET.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
