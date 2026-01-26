"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
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
  colors?: {
    name: string;
    hex?: string;
    images: string[];
  }[];
}

const ProductCard = ({
  _id,
  name,
  slug,
  images,
  basePrice,
  discountPrice,
  finalPrice,
  stock,
  colors,
}: ProductCardProps) => {
  const mainImage = colors?.[0]?.images?.[0] || images?.[0] || "/placeholder.jpg";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-white border rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden group"
    >
      <Link href={`/product/${slug}`}>
        <div className="relative">

          {/* STOCK STATUS */}
          {stock === 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
              Out of Stock
            </span>
          )}

          {/* DISCOUNT BADGE */}
          {discountPrice && discountPrice < basePrice && (
            <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded z-10">
              SALE
            </span>
          )}

          {/* IMAGE */}
          <Image
            src={mainImage}
            alt={name}
            width={500}
            height={500}
            className="w-full h-[220px] object-cover transition group-hover:scale-105"
          />
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-4 space-y-2">

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {name}
        </h3>

        {/* PRICE */}
        <div className="flex items-center gap-2">
          <span className="text-orange-600 font-bold text-lg">
            ৳{finalPrice}
          </span>

          {discountPrice && discountPrice < basePrice && (
            <span className="text-gray-400 text-sm line-through">
              ৳{basePrice}
            </span>
          )}
        </div>

        {/* COLOR VARIANTS */}
        {colors && colors.length > 0 && (
          <div className="flex gap-2 pt-1">
            {colors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: color.hex || "#ddd" }}
                title={color.name}
              />
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between items-center pt-3">

          <button className="text-xs font-semibold text-orange-600 hover:underline">
            View Details
          </button>

          <div className="flex gap-2">
            <button className="p-2 border rounded-full hover:bg-orange-50 transition">
              <Heart size={16} />
            </button>

            <button className="p-2 border rounded-full hover:bg-orange-50 transition">
              <ShoppingCart size={16} />
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default ProductCard;
