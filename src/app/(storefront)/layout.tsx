import type { Metadata, Viewport } from "next";
import "../globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Indian Streetwear Brand for Men’s Streetwear Clothing | House of Outliers",
  description: "India’s top streetwear brand – House of Outliers. Shop cargos, co-ords, neon fits, crochet shirts & premium urban streetwear styles.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
