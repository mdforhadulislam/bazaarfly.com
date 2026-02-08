"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Hash, ChevronRight, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/Product/ProductCard";

interface ProductType {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice: number;
  discountPrice?: number;
  finalPrice: number;
  stock: number;
}

type TagType = {
  _id: string;
  name: string;
  slug: string;
  banner?: string;
  count?: number;
};

const PRODUCTS_PER_LOAD = 10;

const tags: TagType[] = [
  { _id: "1", name: "Fashion", slug: "fashion", banner: "/categories/fashion-banner.jpg", count: 245 },
  { _id: "2", name: "Shoes", slug: "shoes", banner: "/categories/electronics-banner.jpg", count: 88 },
  { _id: "3", name: "Electronics", slug: "electronics", banner: "/categories/electronics-banner.jpg", count: 150 },
];

const dummyProducts: ProductType[] = [
  { _id: "1", name: "Premium Men's Casual Shirt", slug: "premium-mens-casual-shirt", basePrice: 1590, discountPrice: 1290, finalPrice: 1290, stock: 25, images: ["/sharee.png", "/candle.png"] },
  { _id: "2", name: "Running Sneakers", slug: "running-sneakers", basePrice: 3490, discountPrice: 2990, finalPrice: 2990, stock: 20, images: ["/sharee.png", "/candle.png"] },
  { _id: "3", name: "Smart Watch Series 9", slug: "smart-watch-series-9", basePrice: 4990, discountPrice: 4490, finalPrice: 4490, stock: 18, images: ["/sharee.png", "/candle.png"] },
  { _id: "4", name: "Luxury Sunglasses", slug: "luxury-sunglasses", basePrice: 1990, discountPrice: 1690, finalPrice: 1690, stock: 15, images: ["/sharee.png", "/candle.png"] },
  { _id: "5", name: "Stylish Women's Handbag", slug: "stylish-womens-handbag", basePrice: 2490, discountPrice: 1990, finalPrice: 1990, stock: 12, images: ["/sharee.png", "/candle.png"] },
];

export default function TagDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);

  const tag = useMemo(() => tags.find((t) => t.slug === slug), [slug]);

  if (!tag) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg border max-w-md w-full text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
            <Hash className="text-orange-600" />
          </div>

          <h1 className="text-xl font-black text-gray-900 mb-2">
            Tag Not Found
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            The tag you’re looking for doesn’t exist or has been removed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-5 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
            >
              Go to Home
            </Link>

            <Link
              href="/tag"
              className="px-5 py-2 rounded-lg border text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              Browse Tags
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const products = dummyProducts; // later replace with API filtered by tag

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="pt-6 pb-4 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <ChevronRight size={16} />
          <Link href="/tag" className="hover:text-orange-600">Tags</Link>
          <ChevronRight size={16} />
          <span className="text-gray-800 font-semibold">#{tag.slug}</span>
        </div>

        {/* Banner */}
        {tag.banner && (
          <div className="relative w-full h-56 md:h-64 rounded-2xl overflow-hidden mb-8 border bg-white shadow-sm">
            <Image src={tag.banner} alt={tag.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold">
                <Hash size={14} />
                TAG
              </p>
              <h1 className="mt-3 text-2xl md:text-3xl font-black flex items-center gap-2">
                {tag.name}
              </h1>
              <p className="text-sm opacity-90 mt-1">
                {tag.count ?? products.length} products available
              </p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Products with “{tag.name}”
            </h2>
            <p className="text-sm text-gray-500">
              Showing {Math.min(visibleCount, products.length)} of {products.length}
            </p>
          </div>

          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border hover:bg-gray-50 font-semibold text-sm text-gray-700"
            onClick={() => alert("Add filter/sort later")}
          >
            <SlidersHorizontal size={18} />
            Sort / Filter
          </button>
        </div>

        {/* Products */}
        <div className="bg-white border rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0">
            {products.slice(0, visibleCount).map((p) => (
              <ProductCard key={p._id} {...p} />
            ))}
          </div>

          {visibleCount < products.length && (
            <div className="text-center mt-10">
              <button
                onClick={() => setVisibleCount((prev) => prev + PRODUCTS_PER_LOAD)}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition"
              >
                Load More Products
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
