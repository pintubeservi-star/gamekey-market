import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: { default: "REDFLIX | Películas y series", template: "%s | REDFLIX" },
  description: "Tu espacio de películas y series. Descubre, organiza y disfruta tu entretenimiento en REDFLIX.",
  applicationName: "REDFLIX",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "REDFLIX", statusBarStyle: "black-translucent" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#141414", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}<Analytics /></body></html>;
}
