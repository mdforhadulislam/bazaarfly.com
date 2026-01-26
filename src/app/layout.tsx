// ==============================================
// src/app/layout.tsx
// PRODUCTION ROOT LAYOUT FOR BAZAARFLY
// ==============================================

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MainLayout from "../components/Layout/MainLayout";
import MobileBottomBar from "../components/Layout/MobileBottomBar";
import "./globals.css";

// 🔥 Providers (You can add more later)
// import { AuthProvider } from "@/context/AuthContext";
// import { ThemeProvider } from "@/context/ThemeContext";

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
  title: "Bazaarfly | Smart Online Shopping in Bangladesh",
  description:
    "Bazaarfly is a modern online shopping platform in Bangladesh. Shop fashion, electronics, lifestyle products with fast delivery, secure checkout, and exclusive daily deals.",
  keywords: [
    "Bazaarfly",
    "online shopping Bangladesh",
    "ecommerce Bangladesh",
    "buy fashion online",
    "electronics store BD",
    "best online shop BD",
    "fast delivery Bangladesh",
  ],
  authors: [{ name: "Forhadul Islam" }],
  metadataBase: new URL("https://bazaarfly.com"),

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    title: "Bazaarfly | Smart Shopping Starts Here",
    description:
      "Shop fashion, electronics, and lifestyle products at Bazaarfly. Fast delivery, secure payment, and exclusive offers.",
    url: "https://bazaarfly.com",
    siteName: "Bazaarfly",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bazaarfly Online Shopping",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Bazaarfly | Smart Online Shopping",
    description:
      "Discover trending fashion, electronics & lifestyle products at Bazaarfly.",
    images: ["/og-image.jpg"],
  },

  themeColor: "#0f172a",
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

        <MainLayout>
          <main>{children}</main>
        </MainLayout>

        <MobileBottomBar />
      </body>
    </html>
  );
}
