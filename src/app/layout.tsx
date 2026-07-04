import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../context/CartContext";

export const metadata: Metadata = {
  title: "Indian Streetwear Brand for Men’s Streetwear Clothing | The Outliers Studio",
  description: "India’s top streetwear brand – The Outliers Studio. Shop cargos, co-ords, neon fits, crochet shirts & premium urban streetwear styles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

