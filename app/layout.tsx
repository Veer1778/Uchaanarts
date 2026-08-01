import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Uchaan Art Gallery — Contemporary Indian Art",
    template: "%s · Uchaan Arts",
  },
  description:
    "Uchaan Arts, with galleries in Delhi and Gurgaon, has been a platform for contemporary art for over 15 years. Original paintings, sculpture and more by India's finest artists.",
  openGraph: {
    title: "Uchaan Art Gallery",
    description:
      "Contemporary Indian art — original paintings, sculpture and serigraphs, curated for over 15 years.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
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
