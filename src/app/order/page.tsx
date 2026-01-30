"use client";

import Image from "next/image";
import { Package, Truck, CheckCircle, Clock, Eye, ShoppingBag } from "lucide-react";
import { useState } from "react";

interface OrderItem {
  id: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  total: number;
  items: OrderItem[];
}

export default function OrderPage() {
  const [orders] = useState<Order[]>([
    {
      id: "ORD-1001",
      date: "30 Jan 2026",
      status: "processing",
      total: 2590,
      items: [
        {
          id: "1",
          productName: "Premium Cotton Shirt",
          image: "/sharee.png",
          price: 1290,
          quantity: 2,
        },
      ],
    },
    {
      id: "ORD-1002",
      date: "25 Jan 2026",
      status: "delivered",
      total: 1799,
      items: [
        {
          id: "2",
          productName: "Bowling Premium Slides",
          image: "/sharee.png",
          price: 1799,
          quantity: 1,
        },
      ],
    },
  ]);

  const statusStyle = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <section className="bg-[#fafafa] min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* PAGE HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shadow">
            <Package className="text-orange-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            My Orders
          </h1>
        </div>

        {/* EMPTY STATE */}
        {orders.length === 0 && (
          <div className="bg-white rounded-3xl border shadow-sm p-14 text-center">
            <ShoppingBag size={60} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-5 text-lg">You have no orders yet</p>
            <button className="px-7 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition shadow">
              Start Shopping
            </button>
          </div>
        )}

        {/* ORDER LIST */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl shadow-sm border hover:shadow-lg transition overflow-hidden"
            >

              {/* ORDER HEADER */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-6 bg-gray-50">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-bold text-gray-900">{order.id}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="font-semibold">{order.date}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>

                  <span className="text-orange-600 font-bold text-lg">
                    ৳{order.total}
                  </span>
                </div>
              </div>

              {/* ITEMS */}
              <div className="p-6 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-center bg-gray-50 rounded-2xl p-4 border hover:bg-orange-50/40 transition"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border bg-white">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover hover:scale-110 transition"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        ৳{item.price} × {item.quantity}
                      </p>
                    </div>

                    <p className="font-extrabold text-orange-600">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="flex justify-between items-center px-6 py-4 border-t bg-white">

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {order.status === "pending" && <Clock size={16} />}
                  {order.status === "processing" && <Truck size={16} />}
                  {order.status === "shipped" && <Truck size={16} />}
                  {order.status === "delivered" && <CheckCircle size={16} />}
                  <span>
                    Status: <strong className="capitalize">{order.status}</strong>
                  </span>
                </div>

                <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow transition">
                  <Eye size={16} /> View Details
                </button>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
