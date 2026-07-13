import "../globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title:
    "Indian Streetwear Brand for Men’s Streetwear Clothing | House of Outliers",
  description:
    "India’s top streetwear brand – House of Outliers. Shop cargos, co-ords, neon fits, crochet shirts & premium urban streetwear styles.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
