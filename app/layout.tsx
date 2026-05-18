import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "AI INCIDENT · On-call Simulator",
  description: "Simulador de plantão de produção pra aprender AWS AI Practitioner sob pressão real",
  openGraph: {
    title: "AI INCIDENT · On-call Simulator",
    description: "3:17AM. A produção tá pegando fogo. Resolve o incidente.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${dmsans.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased text-gray-200 selection:bg-acid-500/30">
        <div className="scan-overlay" />
        <div className="vignette" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
