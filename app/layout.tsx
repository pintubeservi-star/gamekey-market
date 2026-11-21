import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTA 6 MÓVILES | Vice City en tu móvil",
  description: "GTA 6 MÓVILES: novedades, imágenes e información sobre la experiencia móvil de GTA VI. Sitio independiente no afiliado a Rockstar Games.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
