"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

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

/* Demo data */
const categories: Category[] = [
  {
    _id: "1",
    name: "Fashion",
    slug: "fashion",
    banner: "/categories/fashion-banner.jpg",
    level: 0,
    parent: null,
    isActive: true,
    priority: 1,
  },
  {
    _id: "2",
    name: "Electronics",
    slug: "electronics",
    banner: "/categories/electronics-banner.jpg",
    level: 0,
    parent: null,
    isActive: true,
    priority: 2,
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

  {
    _id: "21",
    name: "Mobiles",
    slug: "mobiles",
    image: "/categories/mobile.jpg",
    parent: "2",
    level: 1,
    isActive: true,
    priority: 1,
  },
  {
    _id: "22",
    name: "Laptops",
    slug: "laptops",
    image: "/categories/laptop.jpg",
    parent: "2",
    level: 1,
    isActive: true,
    priority: 2,
  },
];

export default function CategoryPage() {
  const [search, setSearch] = useState("");

  const mainCategories = useMemo(() => {
    return categories
      .filter((c) => c.level === 0 && c.isActive)
      .sort((a, b) => a.priority - b.priority);
  }, []);

  const getSubcategories = (parentId: string) => {
    return categories
      .filter(
        (c) =>
          c.parent === parentId &&
          c.isActive &&
          c.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.priority - b.priority);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header + Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <h1 className="text-2xl font-bold">All Categories</h1>

          <div className="relative w-full md:w-80">
            <input
              placeholder="Search subcategory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-full px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Category Sections */}
        <div className="space-y-14">
          {mainCategories.map((mainCat) => {
            const subcats = getSubcategories(mainCat._id);
            if (!subcats.length) return null;

            return (
              <div key={mainCat._id}>
                {/* Title */}
                <h2 className="text-xl font-semibold mb-4">
                  {mainCat.name}
                </h2>

                {/* Banner */}
                {mainCat.banner && (
                  <div className="relative w-full h-44 mb-6 rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={mainCat.banner}
                      alt={mainCat.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Subcategories */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
                  {subcats.map((cat) => (
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
