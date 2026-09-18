import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barbearia Gentlemen",
  description: "Sistema de gestão da Barbearia Gentlemen",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.jpeg",
    apple: "/icons/icon-192.jpeg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gentlemen",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  // viewport-fit=cover permite usar env(safe-area-inset-*) para respeitar o
  // notch/home indicator do iPhone quando o app roda instalado (PWA/standalone).
  viewportFit: "cover",
  // Evita zoom acidental ao focar inputs no Safari iOS, mantendo os campos acessíveis.
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
