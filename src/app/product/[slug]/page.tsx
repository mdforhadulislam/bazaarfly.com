"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Heart, Check, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import RelatedProductSection from "@/components/Product/RelatedProductSection";

// TEMP — replace with API fetch later
const product = {
  _id: "1",
  name: "Premium Men's Casual Shirt",
  slug: "premium-mens-casual-shirt",
  description:
    "High quality cotton casual shirt for men. Comfortable, breathable, and perfect for daily wear. Premium stitching and long-lasting fabric.",
  basePrice: 1590,
  discountPrice: 1290,
  finalPrice: 1290,
  stock: 25,
  images: ["/sharee.png","/sharee.png","/candle.png"],

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
};

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(
    product.images[0] || "/placeholder.jpg"
  );
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const images =
    selectedColor?.images?.length > 0
      ? selectedColor.images
      : product.images;

  return (

    <>
    <section className="bg-white pb-10 pt-5 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14">

        {/* LEFT — IMAGE GALLERY */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {/* MAIN IMAGE */}
          <div className="relative rounded-3xl border bg-gray-50 overflow-hidden shadow-sm group">
            <Image
              src={selectedImage}
              alt={product.name}
              width={700}
              height={700}
              className="w-full h-[520px] object-cover transition group-hover:scale-105"
            />

            {product.discountPrice && (
              <span className="absolute top-4 left-4 bg-orange-600 text-white text-xs px-3 py-1 rounded-full shadow">
                SALE
              </span>
            )}
          </div>

          {/* THUMBNAILS */}
          <div className="flex gap-3 flex-wrap">
            {images.map((img) => (
              <button
                key={img}
                onClick={() => setSelectedImage(img)}
                className={`border rounded-xl overflow-hidden transition ${
                  selectedImage === img
                    ? "border-orange-500 shadow"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Image
                  src={img}
                  alt="thumb"
                  width={90}
                  height={90}
                  className="h-[85px] w-[85px] object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — INFO PANEL */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* TITLE */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            {product.name}
          </h1>

          {/* PRICE */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-orange-600">
              ৳{product.finalPrice}
            </span>

            {product.discountPrice && (
              <span className="text-gray-400 line-through">
                ৳{product.basePrice}
              </span>
            )}
          </div>

          {/* STOCK */}
          <p className="text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600 flex items-center gap-1">
                <Check size={16} /> In Stock ({product.stock})
              </span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </p>

          {/* DESCRIPTION */}
          <p className="text-gray-600 leading-relaxed">
            {product.description}  
          </p>

          {/* COLOR PICKER */}
          {product.colors && (
            <div>
              <p className="text-sm font-semibold mb-1">Color</p>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedImage(color.images[0]);
                    }}
                    className={`h-9 w-9 rounded-full border-2 transition ${
                      selectedColor?.name === color.name
                        ? "border-orange-500 scale-110"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex || "#ddd" }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SIZE PICKER */}
          {product.sizes && (
            <div>
              <p className="text-sm font-semibold mb-1">Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2 rounded-xl border text-sm transition ${
                      selectedSize === size
                        ? "border-orange-500 text-orange-600 font-semibold"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 pt-2">
            <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition">
              Add to Cart
            </button>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 text-xs text-gray-600">
            <div className="flex gap-2 items-center">
              <ShieldCheck size={16} className="text-orange-500" /> Secure Payment
            </div>
            <div className="flex gap-2 items-center">
              <Truck size={16} className="text-orange-500" /> Fast Delivery
            </div>
            <div className="flex gap-2 items-center">
              <RefreshCcw size={16} className="text-orange-500" /> Easy Returns
            </div>
          </div>
        </motion.div>


      </div>
    </section>
<RelatedProductSection products={[product, product, product, product, product, product]} />

</>
  );
}
