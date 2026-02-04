"use client";

import ProductCard from "@/components/Product/ProductCard";
import { useState } from "react";

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

const PRODUCTS_PER_LOAD = 10;

const HomeProductSection = ({ products }: { products: ProductType[] }) => {
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PRODUCTS_PER_LOAD);
  };

  return (
    <section className="bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Trending Products
            </h2>
            <p className="text-sm text-gray-600">
              Handpicked items to help you discover your next favorite find.
            </p>
          </div>
          <span
            className="text-xs font-semibold text-gray-500"
            aria-live="polite"
          >
            Showing {Math.min(visibleCount, products.length)} of{" "}
            {products.length}
          </span>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.slice(0, visibleCount).map((product) => (
            <ProductCard key={product._id} {...product} />
          ))}
        </div>

        {/* LOAD MORE BUTTON */}
        {visibleCount < products.length && (
          <div className="text-center mt-10">
            <button
              onClick={handleLoadMore}
              type="button"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Load More Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeProductSection;
