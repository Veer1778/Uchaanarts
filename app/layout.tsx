import type { Metadata } from "next";
import { Bodoni_Moda, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  // Bodoni's high contrast is the point — load the range so very large
  // display sizes render with proper hairline serifs.
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
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
    <html lang="en" className={`${bodoni.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
