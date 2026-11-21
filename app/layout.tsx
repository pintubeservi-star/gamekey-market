import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gta6mobile.shop"),
  title: {
    default: "GTA 6 Móviles | Guía de Grand Theft Auto VI, Vice City y Leonida",
    template: "%s | GTA 6 Móviles",
  },
  description: "Guía independiente en español de GTA 6: historia de Jason y Lucia, mapa de Leonida, Vice City, personajes, plataformas confirmadas, preguntas frecuentes e información para Android.",
  applicationName: "GTA 6 Móviles",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://gta6mobile.shop/",
    siteName: "GTA 6 Móviles",
    title: "GTA 6 Móviles | Guía de Grand Theft Auto VI",
    description: "Información verificada sobre Grand Theft Auto VI, Jason y Lucia, Vice City, Leonida y disponibilidad en plataformas.",
    locale: "es_DO",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
