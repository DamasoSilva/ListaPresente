import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lista de Presentes · Casa Nova",
  description:
    "Estamos começando uma nova fase juntos e queremos compartilhar esse momento especial com você.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-[var(--color-bg)] text-[var(--color-ink)] antialiased font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
