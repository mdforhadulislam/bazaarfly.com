"use client";

import CheckoutLayout from "@/components/Layout/CheckoutLayout";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


export default function CartPage() {
  const { items, totalQty, subTotal, updateQty, removeItem, clear } = useCart();

  if (!items.length) {
    return (
      <CheckoutLayout currentStep={1}>
        <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
            <ShoppingBag className="text-orange-600" />
          </div>

          <h2 className="mt-4 text-xl font-extrabold text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Add some products to continue shopping.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold"
            >
              Continue Shopping
            </Link>

            <button
              onClick={clear}
              className="px-5 py-3 rounded-xl border font-semibold hover:bg-gray-50"
            >
              Clear Cart Data
            </button>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout currentStep={1}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT CART */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div>
              <p className="text-sm font-bold text-gray-900">Shopping Cart</p>
              <p className="text-xs text-gray-500">
                {totalQty} item{totalQty > 1 ? "s" : ""} in cart
              </p>
            </div>

            <button
              onClick={clear}
              className="text-xs font-semibold px-3 py-2 rounded-lg border hover:bg-white"
            >
              Clear
            </button>
          </div>

          {/* ITEMS */}
          {items.map((item) => {
            const lineTotal = item.unitPrice * item.qty;
            const size = item.variant?.size;
            const color = item.variant?.color;

            return (
              <div
                key={item.key}
                className="px-4 py-4 border-b hover:bg-orange-50/40 transition"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* IMAGE */}
                  <div className="col-span-3 sm:col-span-2">
                    <div className="w-[110px] h-[110px] rounded-xl overflow-hidden border bg-gray-50">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        width={110}
                        height={110}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="col-span-9 sm:col-span-10 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={item.slug ? `/product/${item.slug}` : "#"}
                          className="font-semibold text-gray-900 leading-tight line-clamp-2 hover:text-orange-600 transition"
                        >
                          {item.name}
                        </Link>

                        {/* VARIANTS */}
                        <div className="mt-2 flex gap-2 text-xs text-gray-500 flex-wrap">
                          {size && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100">
                              Size: {size}
                            </span>
                          )}

                          {color?.name && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100">
                              <span
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: color.hex || "#ddd" }}
                              />
                              {color.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-gray-400 hover:text-red-500 transition"
                        aria-label="Remove item"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* PRICE + ACTIONS */}
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-end gap-3">
                        <p className="font-extrabold text-orange-600 text-lg">
                          ৳{item.unitPrice}
                        </p>
                        <p className="text-xs text-gray-400">
                          Line: ৳{lineTotal}
                        </p>
                      </div>

                      {/* QTY */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-full px-2 bg-white shadow-sm">
                          <button
                            onClick={() => updateQty(item.key, item.qty - 1)}
                            className="p-1 hover:text-orange-600"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="px-3 text-sm font-semibold">
                            {item.qty}
                          </span>

                          <button
                            onClick={() => updateQty(item.key, item.qty + 1)}
                            className="p-1 hover:text-orange-600"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT SUMMARY */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 h-fit space-y-5 sticky top-24">
          <h2 className="font-bold text-lg text-gray-900">Order Summary</h2>

          <div className="flex justify-between text-sm">
            <span>Total Items</span>
            <span className="font-semibold">{totalQty}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">৳{subTotal}</span>
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-extrabold">
            <span>Total</span>
            <span className="text-orange-600">৳{subTotal}</span>
          </div>

          <Link
            href="/checkout"
            className="block text-center w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
          >
            Checkout
          </Link>

          <p className="text-xs text-gray-400 text-center">
            Taxes and shipping calculated at checkout
          </p>
        </div>
      </div>
    </CheckoutLayout>
  );
}
