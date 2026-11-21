import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gta6mobile.shop"),
  title: {
    default: "GTA 6 Móviles | Edición digital independiente para Android",
    template: "%s | GTA 6 Móviles",
  },
  description: "Conoce GTA 6 Móviles, consulta los detalles de la edición digital independiente para Android y accede al checkout de PayPal.",
  applicationName: "GTA 6 Móviles",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://gta6mobile.shop/",
    siteName: "GTA 6 Móviles",
    title: "GTA 6 Móviles | Edición digital para Android",
    description: "Información de la edición digital independiente para Android y acceso a compra mediante PayPal.",
    locale: "es_DO",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
