import type { Metadata } from "next";
import { Space_Grotesk, Inter, Geist, Syne } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ClientProviders from "@/components/ClientProviders";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], display: "swap" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mohamed El Harakani — AI Engineer",
  description: "AI Engineer at Nokia. LLMs, RAG, agents. Building things that think.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, spaceGrotesk.variable, syne.variable)}>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
