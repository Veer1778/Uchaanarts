import type { Metadata } from "next";
import { Suspense } from "react";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

/**
 * One family, several weights, per the client's brief: Montserrat SemiBold and
 * Bold for titles, regular and light for body copy. Both CSS variables point
 * at it so nothing downstream has to change.
 */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Uchaan Art Gallery — Contemporary Indian Art",
    template: "%s · Uchaan Arts",
  },
  description:
    "Uchaan Arts, with galleries in Delhi and Gurgaon, has been a platform for contemporary art since 2014. Original paintings, sculpture and more by India's finest artists.",
  openGraph: {
    title: "Uchaan Art Gallery",
    description:
      "Contemporary Indian art — original paintings, sculpture and serigraphs, curated since 2014.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="antialiased">
        <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {/* Navbar reads the category query string, so it needs a
                  Suspense boundary to keep pages statically renderable. */}
              <Suspense fallback={<div className="h-[72px] border-b border-line" />}>
                <Navbar />
              </Suspense>
              <main>{children}</main>
              <Footer />
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
