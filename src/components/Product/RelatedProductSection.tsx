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

const PRODUCTS_PER_LOAD = 5;

const RelatedProductSection = ({ products }: { products: ProductType[] }) => {
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PRODUCTS_PER_LOAD);
  };

  if (!products?.length) return null;

  return (
    <section className="bg-white py-10 px-4 border-t">
      <div className="max-w-7xl mx-auto">

        {/* TITLE */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Related Products
          </h2>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0">
          {products.slice(0, visibleCount).map((product) => (
            <ProductCard key={product._id} {...product} />
          ))}
        </div>

        {/* LOAD MORE */}
        {visibleCount < products.length && (
          <div className="text-center mt-10">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Load More Related Products
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default RelatedProductSection;
