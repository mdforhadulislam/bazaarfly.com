import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Bazaarfly  | Your Smart Shopping Destination",
  description:
    "Bazaarfly  is your one-stop e-commerce platform for fashion, electronics, lifestyle products, and more. Shop smarter with secure checkout, fast delivery, and exclusive deals every day.",
  keywords: [
    "Bazaarfly ",
    "online shopping",
    "buy online",
    "e-commerce Bangladesh",
    "fashion",
    "electronics",
    "lifestyle products",
    "secure shopping",
    "fast delivery",
  ],
  authors: [{ name: "Bazaarfly  Team" }],
  openGraph: {
    title: "Bazaarfly  | Shop Smarter, Live Better",
    description:
      "Discover fashion, electronics, and lifestyle products at Bazaarfly. Exclusive offers, fast delivery, and a seamless shopping experience.",
    url: "https://bazaarfly.com",
    siteName: "Bazaarfly",
    images: [
      {
        url: "https://bazaarfly.com/og-image.jpg", // og image এখানে দিতে হবে
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
    images: ["https://bazaarfly.com/og-image.jpg"], // twitter card image
  },
  metadataBase: new URL("https://Bazaarfly.com"),
  category: "e-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > 
        <Analytics />

        {children}
      </body>
    </html>
  );
}
