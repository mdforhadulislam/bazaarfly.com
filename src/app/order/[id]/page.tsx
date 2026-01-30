"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Copy,
  CreditCard,
  CalendarDays,
  Download,
} from "lucide-react";
import { useState } from "react";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: { name: string; hex?: string };
}

interface OrderDetails {
  id: string;
  trackingId: string;
  courier: string;
  date: string;
  estimatedDelivery: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  total: number;
  paymentMethod: string;
  customer: {
    name: string;
    phone: string;
  };
  address: string;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order] = useState<OrderDetails>({
    id: orderId || "ORD-1001",
    trackingId: "TRK-BAZARFLY-98273645",
    courier: "Steadfast Courier",
    date: "30 Jan 2026",
    estimatedDelivery: "2 Feb 2026",
    status: "shipped",
    paymentMethod: "Cash on Delivery",
    total: 2590,
    customer: {
      name: "Forhadul Islam",
      phone: "01930631910",
    },
    address: "House 12, Road 5, Uttara, Dhaka, Bangladesh",
    items: [
      {
        id: "1",
        name: "Premium Cotton Shirt",
        image: "/sharee.png",
        price: 1290,
        quantity: 2,
        size: "L",
        color: { name: "Blue", hex: "#2563EB" },
      },
    ],
  });

  const copyTracking = () => {
    navigator.clipboard.writeText(order.trackingId);
  };

  const statusStep = (status: OrderDetails["status"]) => {
    switch (status) {
      case "pending":
        return 1;
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
    }
  };

  const currentStep = statusStep(order.status);

  return (
    <section className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900">
                Order Details
              </h1>
              <p className="text-sm text-gray-500">
                Order ID: <span className="font-semibold">{order.id}</span>
              </p>
            </div>

            <span className="px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold">
              {order.status.toUpperCase()}
            </span>
          </div>

          {/* TRACKING + INVOICE */}
          <div className="grid md:grid-cols-3 gap-4 bg-orange-50 border border-orange-200 rounded-xl p-4">

            <div>
              <p className="text-xs text-gray-500">Tracking ID</p>
              <p className="font-bold text-orange-600">{order.trackingId}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Courier Partner</p>
              <p className="font-semibold">{order.courier}</p>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={copyTracking}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold"
              >
                <Copy size={16} /> Copy Tracking
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-semibold hover:bg-gray-50">
                <Download size={16} /> Invoice PDF
              </button>
            </div>
          </div>
        </div>

        {/* STATUS TRACKER */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Delivery Progress</h2>

          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            {[
              { label: "Pending", icon: Clock },
              { label: "Processing", icon: Package },
              { label: "Shipped", icon: Truck },
              { label: "Delivered", icon: CheckCircle },
            ].map((step, i) => {
              const active = i + 1 <= currentStep;
              const Icon = step.icon;

              return (
                <div key={step.label} className="space-y-2">
                  <div
                    className={`mx-auto w-11 h-11 flex items-center justify-center rounded-full ${
                      active
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <p className={`text-xs font-semibold ${active ? "text-orange-600" : "text-gray-500"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays size={16} className="text-orange-600" />
            Estimated Delivery: <strong>{order.estimatedDelivery}</strong>
          </div>
        </div>

        {/* CUSTOMER + PAYMENT */}
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-3">
            <h2 className="font-bold text-gray-900">Customer Information</h2>

            <p className="flex items-center gap-2 text-sm">
              <User size={16} className="text-orange-600" />
              {order.customer.name}
            </p>

            <p className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-orange-600" />
              {order.customer.phone}
            </p>

            <p className="flex items-center gap-2 text-sm">
              <CreditCard size={16} className="text-orange-600" />
              Payment Method: <strong>{order.paymentMethod}</strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-3">
            <h2 className="font-bold text-gray-900">Delivery Address</h2>

            <p className="flex items-start gap-2 text-sm">
              <MapPin size={16} className="text-orange-600 mt-1" />
              {order.address}
            </p>
          </div>

        </div>

        {/* ORDERED ITEMS */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Ordered Products</h2>

          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 items-center border rounded-xl p-4 bg-gray-50"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-lg object-cover border"
              />

              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {item.name}
                </h3>

                <div className="flex gap-3 text-xs text-gray-600 flex-wrap">
                  <span>Qty: <strong>{item.quantity}</strong></span>

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
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Unit Price</p>
                <p className="font-bold text-orange-600">৳{item.price}</p>

                <p className="text-xs text-gray-500 mt-1">
                  Subtotal: ৳{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* PRICE SUMMARY */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-3">

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>৳2390</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>৳200</span>
          </div>

          <div className="border-t pt-3 flex justify-between text-xl font-black">
            <span>Total Paid</span>
            <span className="text-orange-600">৳{order.total}</span>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Need help? Contact BazarFly Support with your Order ID.
          </p>

        </div>

      </div>
    </section>
  );
}
