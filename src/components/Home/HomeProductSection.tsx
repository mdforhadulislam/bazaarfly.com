"use client";

import { motion } from "framer-motion";
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
  colors?: {
    name: string;
    hex?: string;
    images: string[];
  }[];
}

const HomeProductSection = ({ products }: { products: ProductType[] }) => {
  return (
    <section className="bg-gray-50 py-16 px-4">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <p className="text-orange-600 text-sm font-semibold">
              Handpicked For You
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
          </div>

          <button className="text-sm font-semibold text-orange-600 hover:underline">
            View All
          </button>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {products.map((product) => (
            <ProductCard key={product._id} {...product} />
          ))}
        </div>

      </div>

    </section>
  );
};

export default HomeProductSection;
