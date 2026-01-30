"use client";

import CheckoutLayout from "@/components/Layout/CheckoutLayout";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: { name: string; hex?: string; image?: string };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Bowling Premium Cross Fury Beige Slides for Men",
      price: 1799,
      image: "/sharee.png",
      quantity: 1,
      size: "41",
      color: { name: "Beige", hex: "#E5D3B3" },
    },
  ]);

  // UPDATE QUANTITY
  const updateQuantity = (id: string, qty: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, qty) }
          : item
      )
    );
  };

  // REMOVE ITEM
  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CheckoutLayout currentStep={1}>
      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT CART */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">

          {/* HEADER */}
          <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-gray-500 border-b bg-gray-50">
            <span className="col-span-8 text-left pl-6">Product</span> 
            <span className="col-span-3 text-right">Actions</span>
          </div>

          {/* ITEMS */}
          {cartItems.map((item) => (
            <div
              key={`${item.id}-${item.size}-${item.color?.name}`}
              className="px-4 py-4 border-b hover:bg-orange-50/40 transition"
            >
              <div className="grid grid-cols-12 gap-4 items-center">

                {/* IMAGE */}
                <div className="col-span-3 sm:col-span-2">
                  <Image
                    src={item.color?.image || item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-[110px] h-[110px] rounded-xl object-cover border bg-gray-50"
                  />
                </div>

                {/* DETAILS */}
                <div className="col-span-9 sm:col-span-10 space-y-1">

                  <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">
                    {item.name}
                  </h3>

                  {/* VARIANTS */}
                  <div className="flex gap-2 text-xs text-gray-500 flex-wrap">
                    {item.size && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100">
                        Size: {item.size}
                      </span>
                    )}

                    {item.color && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100">
                        <span
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: item.color.hex || "#ddd" }}
                        />
                        {item.color.name}
                      </span>
                    )}
                  </div>

                  {/* PRICE + ACTIONS */}
                  <div className="flex justify-between items-center mt-3">

                    {/* PRICE */}
                    <p className="font-bold text-orange-600 text-lg">
                      ৳{item.price}
                    </p>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-3">

                      {/* QTY */}
                      <div className="flex items-center border rounded-full px-2 bg-white shadow-sm">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 hover:text-orange-600"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="px-3 text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:text-orange-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* REMOVE */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SUMMARY */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 h-fit space-y-5 sticky top-24">

          <h2 className="font-bold text-lg text-gray-900">
            Order Summary
          </h2>

          <div className="flex justify-between text-sm">
            <span>Total Product Price</span>
            <span className="font-semibold">৳{subtotal}</span>
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-extrabold">
            <span>Total</span>
            <span className="text-orange-600">৳{subtotal}</span>
          </div>

          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition">
            Checkout
          </button>

          <p className="text-xs text-gray-400 text-center">
            Taxes and shipping calculated at checkout
          </p>

        </div>

      </div>
    </CheckoutLayout>
  );
}
