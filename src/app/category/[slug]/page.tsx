"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import ProductCard from "@/components/Product/ProductCard";

/* ---------------- TYPES ---------------- */

type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  parent?: string | null;
  level: number;
  isActive: boolean;
  priority: number;
};

interface ProductType {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice: number;
  discountPrice?: number;
  finalPrice: number;
  stock: number;
  colors?: {
    name: string;
    hex?: string;
    images: string[];
  }[];
}

/* ---------------- DEMO DATA ---------------- */

const PRODUCTS_PER_LOAD = 10;

const dummyProducts: ProductType[] = [
  {
    _id: "1",
    name: "Premium Men's Casual Shirt",
    slug: "premium-mens-casual-shirt",
    basePrice: 1590,
    discountPrice: 1290,
    finalPrice: 1290,
    stock: 25,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "2",
    name: "Stylish Women's Handbag",
    slug: "stylish-womens-handbag",
    basePrice: 2490,
    discountPrice: 1990,
    finalPrice: 1990,
    stock: 12,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "3",
    name: "Smart Watch Series 9",
    slug: "smart-watch-series-9",
    basePrice: 4990,
    discountPrice: 4490,
    finalPrice: 4490,
    stock: 18,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "4",
    name: "Kids Trendy Hoodie",
    slug: "kids-trendy-hoodie",
    basePrice: 1490,
    discountPrice: 1190,
    finalPrice: 1190,
    stock: 30,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "5",
    name: "Running Sneakers",
    slug: "running-sneakers",
    basePrice: 3490,
    discountPrice: 2990,
    finalPrice: 2990,
    stock: 20,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "6",
    name: "Luxury Sunglasses",
    slug: "luxury-sunglasses",
    basePrice: 1990,
    discountPrice: 1690,
    finalPrice: 1690,
    stock: 15,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "7",
    name: "Women's Summer Dress",
    slug: "womens-summer-dress",
    basePrice: 2790,
    discountPrice: 2290,
    finalPrice: 2290,
    stock: 22,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "8",
    name: "Men's Formal Shoes",
    slug: "mens-formal-shoes",
    basePrice: 3990,
    discountPrice: 3490,
    finalPrice: 3490,
    stock: 14,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "9",
    name: "Wireless Earbuds Pro",
    slug: "wireless-earbuds-pro",
    basePrice: 2990,
    discountPrice: 2590,
    finalPrice: 2590,
    stock: 40,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "10",
    name: "Leather Wallet for Men",
    slug: "leather-wallet-men",
    basePrice: 1290,
    discountPrice: 990,
    finalPrice: 990,
    stock: 50,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "11",
    name: "Elegant Wrist Watch",
    slug: "elegant-wrist-watch",
    basePrice: 4590,
    discountPrice: 3990,
    finalPrice: 3990,
    stock: 10,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "12",
    name: "Casual Backpack",
    slug: "casual-backpack",
    basePrice: 2190,
    discountPrice: 1890,
    finalPrice: 1890,
    stock: 28,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "1",
    name: "Premium Men's Casual Shirt",
    slug: "premium-mens-casual-shirt",
    basePrice: 1590,
    discountPrice: 1290,
    finalPrice: 1290,
    stock: 25,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "2",
    name: "Stylish Women's Handbag",
    slug: "stylish-womens-handbag",
    basePrice: 2490,
    discountPrice: 1990,
    finalPrice: 1990,
    stock: 12,
    images: ["/sharee.png", "/candle.png"],
  },
  {
    _id: "3",
    name: "Smart Watch Series 9",
    slug: "smart-watch-series-9",
    basePrice: 4990,
    discountPrice: 4490,
    finalPrice: 4490,
    stock: 18,
    images: ["/sharee.png", "/candle.png"],
  },
];

/* Categories */
const categories: Category[] = [
  {
    _id: "1",
    name: "Fashion",
    slug: "fashion",
    banner: "/categories/fashion-banner.jpg",
    parent: null,
    level: 0,
    isActive: true,
    priority: 1,
  },
  {
    _id: "11",
    name: "Men Fashion",
    slug: "men-fashion",
    image: "/categories/men.jpg",
    parent: "1",
    level: 1,
    isActive: true,
    priority: 1,
  },
  {
    _id: "12",
    name: "Women Fashion",
    slug: "women-fashion",
    image: "/categories/women.jpg",
    parent: "1",
    level: 1,
    isActive: true,
    priority: 2,
  },
];

/* ---------------- PAGE ---------------- */

export default function CategoryDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);

  const category = useMemo(
    () => categories.find((c) => c.slug === slug),
    [slug]
  );

  const subcategories = useMemo(() => {
    if (!category) return [];
    return categories
      .filter((c) => c.parent === category._id)
      .sort((a, b) => a.priority - b.priority);
  }, [category]);

if (!category) {
  return (
    <div className="h-auto py-5 flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg border max-w-md w-full text-center p-8">
        
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
          <span className="text-3xl">😕</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Category Not Found
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-6">
          The category you’re looking for doesn’t exist or has been removed.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition"
          >
            Go to Home
          </Link>

          <Link
            href="/category"
            className="px-5 py-2 rounded-lg border text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="h-auto">
      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* BANNER */}
        {category.banner && (
          <div className="relative w-full h-56 md:h-64 rounded-xl overflow-hidden mt-6 mb-8">
            <Image
              src={category.banner}
              alt={category.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {category.name}
                </h1>
                <p className="text-sm opacity-90">
                  Discover products in {category.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUBCATEGORIES */}
        {subcategories.length > 0 && (
          <div className="mb-14">
            <h2 className="text-lg font-semibold mb-5">
              Shop by Subcategory
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-5">
              {subcategories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className="group bg-white border rounded-xl p-5 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition"
                >
                  <div className="relative w-full h-20 mb-3">
                    <Image
                      src={cat.image || "/placeholder.png"}
                      alt={cat.name}
                      fill
                      className="object-contain group-hover:scale-110 transition"
                    />
                  </div>

                  <p className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        <h2 className="text-lg font-semibold mb-3">
          Products in {category.name}
        </h2>

        <div className="bg-white border rounded-xl p-4 md:p-5 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0">
            {dummyProducts.slice(0, visibleCount).map((product) => (
              <ProductCard key={product._id} {...product} />
            ))}
          </div>

          {visibleCount < dummyProducts.length && (
            <div className="text-center mt-10">
              <button
                onClick={() =>
                  setVisibleCount((prev) => prev + PRODUCTS_PER_LOAD)
                }
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
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
