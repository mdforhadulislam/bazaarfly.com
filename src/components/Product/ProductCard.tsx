"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useMemo, useState } from "react";

interface ProductCardProps {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice: number;
  discountPrice?: number;
  finalPrice: number;
  stock: number;

  // optional (if you have)
  colors?: { name: string; hex?: string; images: string[] }[];
  weight?: number;
}

function formatBDT(amount: number) {
  try {
    return new Intl.NumberFormat("bn-BD").format(amount);
  } catch {
    return String(amount);
  }
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
  weight,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const mainImage = images?.[0] || "/placeholder.jpg";

  // ✅ if product has colors, pick first color as default (optional)
  const defaultVariant = useMemo(() => {
    if (!colors?.length) return undefined;
    const c = colors[0];
    return {
      color: {
        name: c.name,
        hex: c.hex,
        image: c.images?.[0],
      },
    } as const;
  }, [colors]);

  const onAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // ✅ stop Link navigation
    e.stopPropagation();

    if (stock <= 0) return;

    // ✅ CartContext expects product object like this
    addItem(
      {
        _id,
        name,
        slug,
        basePrice,
        discountPrice,
        images,
        colors,
        weight,
      },
      defaultVariant,
      1
    );

    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  };

  return (
    <div className="border p-1">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group bg-transparent"
      >
        {/* IMAGE */}
        <Link href={`/product/${slug}`}>
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
            {stock <= 0 && (
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
              ৳{formatBDT(finalPrice)}
            </span>

            {discountPrice && discountPrice < basePrice && (
              <span className="text-gray-400 text-xs line-through">
                ৳{formatBDT(basePrice)}
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
              onClick={onAddToCart}
              disabled={stock <= 0}
              className={`p-2 border rounded-full transition ${
                stock <= 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-orange-50"
              }`}
              aria-label="Add to cart"
              title={stock <= 0 ? "Out of stock" : "Add to cart"}
            >
              {added ? <Check size={20} /> : <ShoppingCart size={20} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductCard;
