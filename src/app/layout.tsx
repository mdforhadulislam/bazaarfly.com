// ==============================================
// src/app/layout.tsx
// PRODUCTION ROOT LAYOUT FOR BAZAARFLY
// ==============================================

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 🔥 Providers (You can add more later)
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

// 🔥 Layout Components (optional; add later)
// import Navbar from "@/components/shared/Navbar/Navbar";
// import Footer from "@/components/shared/Footer/Footer";

// -------------------------
// GOOGLE FONTS
// -------------------------
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// -------------------------
// GLOBAL METADATA (SEO)
// -------------------------
export const metadata: Metadata = {
  title: "Bazaarfly | Your Smart Shopping Destination",
  description:
    "Bazaarfly is your one-stop e-commerce platform for fashion, electronics, lifestyle products, and more. Shop smarter with secure checkout, fast delivery, and exclusive deals every day.",
  keywords: [
    "Bazaarfly",
    "online shopping",
    "buy online",
    "e-commerce Bangladesh",
    "fashion",
    "electronics",
    "lifestyle products",
    "secure shopping",
    "fast delivery",
  ],
  authors: [{ name: "Bazaarfly Team" }],
  metadataBase: new URL("https://bazaarfly.com"),

  openGraph: {
    title: "Bazaarfly | Shop Smarter, Live Better",
    description:
      "Discover fashion, electronics, and lifestyle products at Bazaarfly. Exclusive offers, fast delivery, and a seamless shopping experience.",
    url: "https://bazaarfly.com",
    siteName: "Bazaarfly",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bazaarfly - Online Shopping",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Bazaarfly | Your Smart Shopping Destination",
    description:
      "Shop smarter with Bazaarfly. Fashion, electronics, lifestyle, and more — delivered fast.",
    images: ["/og-image.jpg"],
  },

  category: "e-commerce",
};

// -------------------------
// ROOT LAYOUT
// -------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 text-gray-900`}
      > 
        <Analytics />
 
        <ThemeProvider>
          <AuthProvider>
             
            {/* <Navbar /> */}

            <main className="container mx-auto px-4 py-6">
              {children}
            </main>

            {/* <Footer /> */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
