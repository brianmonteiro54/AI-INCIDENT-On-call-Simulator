import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const dmsans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: ["400"],
});

// Used to turn the auto-generated OG/Twitter image into an ABSOLUTE URL (which
// scrapers require). Override with NEXT_PUBLIC_SITE_URL for a custom domain;
// on Vercel it falls back to the deployment URL, and to localhost in dev.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AI INCIDENT · On-call Simulator",
  description: "Simulador de plantão de produção pra aprender AWS AI Practitioner sob pressão real",
  openGraph: {
    title: "AI INCIDENT · On-call Simulator",
    description: "3:17AM. A produção tá pegando fogo. Resolve o incidente.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI INCIDENT · On-call Simulator",
    description: "3:17AM. A produção tá pegando fogo. Resolve o incidente e aprende AWS.",
  },
};

// Tints the mobile browser UI (Android address bar, etc.) to match the app.
export const viewport: Viewport = {
  themeColor: "#FFFBEF",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${dmsans.variable} ${jetbrains.variable} ${serif.variable}`}>
      <body className="font-sans antialiased text-duo-ink bg-duo-cream selection:bg-duo-yellow selection:text-duo-ink">
        <MotionProvider>{children}</MotionProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
