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

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = order.total - subtotal;

  const copyTracking = () => {
    navigator.clipboard.writeText(order.trackingId);
    alert("Tracking ID copied!");
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

  const statusColor =
    order.status === "delivered"
      ? "bg-green-100 text-green-600"
      : order.status === "shipped"
      ? "bg-blue-100 text-blue-600"
      : order.status === "processing"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-600";

  return (
    <section className="">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold">
                Order Details
              </h1>
              <p className="text-sm text-gray-500">
                Order ID: <strong>{order.id}</strong>
              </p>
            </div>

            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold capitalize ${statusColor}`}
            >
              {order.status}
            </span>
          </div>

          {/* Tracking */}
          <div className="grid md:grid-cols-3 gap-4 bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4">
            <div>
              <p className="text-xs text-gray-500">Tracking ID</p>
              <p className="font-bold text-orange-600">
                {order.trackingId}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Courier</p>
              <p className="font-semibold">{order.courier}</p>
            </div>

            <div className="flex gap-2 items-end">
              <button
                onClick={copyTracking}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm"
              >
                <Copy size={16} /> Copy
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm">
                <Download size={16} /> Invoice
              </button>
            </div>
          </div>
        </div>

        {/* STATUS TRACKER */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-bold mb-4">Delivery Progress</h2>

          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: "Pending", icon: Clock },
              { label: "Processing", icon: Package },
              { label: "Shipped", icon: Truck },
              { label: "Delivered", icon: CheckCircle },
            ].map((step, i) => {
              const active = i + 1 <= currentStep;
              const Icon = step.icon;

              return (
                <div key={step.label}>
                  <div
                    className={`mx-auto w-10 h-10 flex items-center justify-center rounded-full ${
                      active
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      active ? "text-orange-600" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays size={16} className="text-orange-600" />
            Estimated Delivery:{" "}
            <strong>{order.estimatedDelivery}</strong>
          </div>
        </div>

        {/* ORDER ITEMS */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="font-bold">Ordered Products</h2>

          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 border rounded-xl p-4 bg-gray-50"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={90}
                height={90}
                className="rounded-lg object-cover border"
              />

              <div className="flex-1 space-y-1">
                <h3 className="font-semibold">{item.name}</h3>

                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>

                {item.size && (
                  <p className="text-sm text-gray-500">
                    Size: {item.size}
                  </p>
                )}

                {item.color && (
                  <p className="text-sm text-gray-500">
                    Color: {item.color.name}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Unit Price</p>
                <p className="font-bold text-orange-600">
                  ৳{item.price}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Subtotal: ৳{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* PRICE SUMMARY */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>৳{subtotal}</span>
          </div>

          <div className="flex justify-between text-sm mb-2">
            <span>Delivery Fee</span>
            <span>৳{deliveryFee}</span>
          </div>

          <div className="border-t pt-3 flex justify-between text-xl font-bold">
            <span>Total Paid</span>
            <span className="text-orange-600">
              ৳{order.total}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
