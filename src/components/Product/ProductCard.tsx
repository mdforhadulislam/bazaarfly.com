"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice: number;
  discountPrice?: number;
  finalPrice: number;
  stock: number;
}

const ProductCard = ({
  name,
  slug,
  images,
  basePrice,
  discountPrice,
  finalPrice,
  stock,
}: ProductCardProps) => {
  const mainImage = images?.[0] || "/placeholder.jpg";
  const isOutOfStock = stock === 0;

  return (
    <div className="border border-gray-100 rounded-2xl bg-white p-2 shadow-sm">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group bg-transparent"
      >
        {/* IMAGE */}
        <Link href={`/product/${slug}`} aria-label={`View ${name}`}>
          <div className="relative overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={mainImage}
              alt={name}
              width={500}
              height={500}
              className="w-full h-[250px] object-cover transition duration-700 group-hover:scale-110"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition" />

            {/* STOCK */}
            {isOutOfStock && (
              <span className="absolute top-3 left-3 bg-black/80 text-white text-[10px] px-2 py-1 rounded-full">
                Out of Stock
              </span>
            )}

            {/* SALE */}
            {discountPrice && discountPrice < basePrice && (
              <span className="absolute top-3 right-3 bg-orange-600 text-white text-[10px] px-2 py-1 rounded-full">
                SALE
              </span>
            )}
          </div>
        </Link>

        {/* CONTENT */}
        <div className="pt-4 space-y-2 px-2 pb-1">
          {/* NAME */}
          <Link href={`/product/${slug}`}>
            <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-orange-600 transition">
              {name}
            </h3>
          </Link>

          {/* PRICE */}
          <div className="flex items-center gap-2">
            <span className="text-orange-600 font-bold text-base">
              ৳{finalPrice}
            </span>

            {discountPrice && discountPrice < basePrice && (
              <span className="text-gray-400 text-xs line-through">
                ৳{basePrice}
              </span>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between items-center pt-2">
            <Link
              href={`/product/${slug}`}
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              View Details
            </Link>

            <button
              type="button"
              disabled={isOutOfStock}
              aria-disabled={isOutOfStock}
              aria-label={
                isOutOfStock
                  ? `${name} is out of stock`
                  : `Add ${name} to cart`
              }
              className="p-2 border rounded-full hover:bg-orange-50 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductCard;
