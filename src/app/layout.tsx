import type { Metadata } from "next";
import "./globals.css";
import { Inter, Pacifico, Rajdhani } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-pacifico" });
const rajdhani = Rajdhani({ weight: ["600","700"], subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "30 Minutes — 30 Days",
  description: "3D member card with 30 scratch tiles",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${pacifico.variable} ${rajdhani.variable}`}>
      <body className="min-h-screen bg-aurora text-slate-50 antialiased">{children}</body>
    </html>
  );
}
