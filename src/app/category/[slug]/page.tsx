"use client";

import HomeProductSection from "@/components/Home/HomeProductSection";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

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


 const dummyProducts = [
  {
    _id: "1",
    name: "Premium Men's Casual Shirt",
    slug: "premium-mens-casual-shirt",
    description: "High quality cotton casual shirt for men.",
    basePrice: 1590,
    discountPrice: 1290,
    finalPrice: 1290,
    sku: "SKU-MEN-001",
    stock: 25,
    commissionPercent: 10,
    category: "65fabc1234567890abcd1111",
    tags: ["fashion", "men"],
    images: ["/sharee.png","/candle.png"],

    sizes: ["S", "M", "L", "XL"],

    colors: [
      {
        name: "Blue",
        hex: "#2563EB",
        images: ["/sharee.png","/candle.png"],
      },
      {
        name: "Black",
        hex: "#000000",
        images: ["/sharee.png","/candle.png"],
      },
    ],

    status: "active",
  },

  {
    _id: "2",
    name: "Stylish Women's Handbag",
    slug: "stylish-womens-handbag",
    description: "Premium leather handbag for women.",
    basePrice: 2490,
    discountPrice: 1990,
    finalPrice: 1990,
    sku: "SKU-WOMEN-002",
    stock: 12,
    commissionPercent: 15,
    category: "65fabc1234567890abcd2222",
    tags: ["fashion", "bags"],
    images: ["/sharee.png","/candle.png"],

    colors: [
      {
        name: "Brown",
        hex: "#7C3E0F",
        images: ["/sharee.png","/candle.png"],
      },
      {
        name: "Cream",
        hex: "#F5EDE2",
        images: ["/sharee.png","/candle.png"],
      },
    ],

    status: "active",
  },

  {
    _id: "3",
    name: "Smart Watch Series 9",
    slug: "smart-watch-series-9",
    description: "Latest smart watch with health tracking features.",
    basePrice: 4990,
    discountPrice: 4490,
    finalPrice: 4490,
    sku: "SKU-TECH-003",
    stock: 18,
    commissionPercent: 12,
    category: "65fabc1234567890abcd3333",
    tags: ["electronics", "watch"],
    images: ["/sharee.png","/candle.png"],

    colors: [
      {
        name: "Silver",
        hex: "#CBD5E1",
        images: ["/sharee.png","/candle.png"],
      },
      {
        name: "Black",
        hex: "#111827",
        images: ["/sharee.png","/candle.png"],
      },
    ],

    status: "active",
  },

  {
    _id: "4",
    name: "Kids Trendy Hoodie",
    slug: "kids-trendy-hoodie",
    description: "Soft and warm hoodie for kids.",
    basePrice: 1490,
    discountPrice: 1190,
    finalPrice: 1190,
    sku: "SKU-KIDS-004",
    stock: 0,
    commissionPercent: 8,
    category: "65fabc1234567890abcd4444",
    tags: ["kids", "fashion"],
    images: ["/sharee.png","/candle.png"],

    sizes: ["4Y", "6Y", "8Y", "10Y"],

    colors: [
      {
        name: "Red",
        hex: "#EF4444",
        images: ["/sharee.png","/candle.png"],
      },
      {
        name: "Gray",
        hex: "#9CA3AF",
        images: ["/sharee.png","/candle.png"],
      },
    ],

    status: "active",
  },

  {
    _id: "5",
    name: "Running Sneakers",
    slug: "running-sneakers",
    description: "Lightweight running shoes for daily use.",
    basePrice: 3490,
    discountPrice: 2990,
    finalPrice: 2990,
    sku: "SKU-SHOES-005",
    stock: 30,
    commissionPercent: 10,
    category: "65fabc1234567890abcd5555",
    tags: ["shoes", "sports"],
    images: ["/sharee.png","/candle.png"],

    sizes: ["39", "40", "41", "42", "43"],

    colors: [
      {
        name: "White",
        hex: "#FFFFFF",
        images: ["/sharee.png","/candle.png"],
      },
      {
        name: "Black",
        hex: "#000000",
        images: ["/sharee.png","/candle.png"],
      },
    ],

    status: "active",
  },

  {
    _id: "6",
    name: "Luxury Sunglasses ",
    slug: "luxury-sunglasses",
    description: "Stylish UV-protected sunglasses.",
    basePrice: 1990,
    discountPrice: 1690,
    finalPrice: 1690,
    sku: "SKU-ACCESS-006",
    stock: 15,
    commissionPercent: 14,
    category: "65fabc1234567890abcd6666",
    tags: ["accessories"],
    images: ["/sharee.png","/candle.png"],

    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: ["/sharee.png","/candle.png"],
      },
      {
        name: "Gold",
        hex: "#D4AF37",
        images: ["/sharee.png","/candle.png"],
      },
    ],

    status: "active",
  },
];

/* Demo Data */
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

export default function CategoryDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  /* Current Category */
  const category = useMemo(
    () => categories.find((c) => c.slug === slug),
    [slug]
  );

  /* Child categories */
  const subcategories = useMemo(() => {
    if (!category) return [];
    return categories
      .filter((c) => c.parent === category._id)
      .sort((a, b) => a.priority - b.priority);
  }, [category]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Category not found
      </div>
    );
  }


    return (
  <div className="min-h-screen bg-gray-50 pb-16">
    <div className="max-w-7xl mx-auto px-4">

      {/* Banner */}
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

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="mb-14">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold">
              Shop by Subcategory
            </h2>
          </div>

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

      {/* Products */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Products in {category.name}
        </h2>
      </div>

      <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm">
        <HomeProductSection products={dummyProducts} />
      </div>
    </div>
  </div>
);

  
}
