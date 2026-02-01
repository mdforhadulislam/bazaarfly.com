"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Package,
  Truck,
  CreditCard,
  User,
  MapPin,
  Save,
  AlertTriangle,
} from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  orderNumber: string;
  status: OrderStatus;
  trackingId?: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: "paid" | "unpaid";
  paymentMethod: string;
  customer: { name: string; phone: string; email: string };
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
}

const order: OrderDetails = {
  orderNumber: "ORD-100245",
  status: "processing",
  subtotal: 2200,
  shippingCost: 390,
  totalAmount: 2590,
  paymentStatus: "paid",
  paymentMethod: "bKash",
  customer: {
    name: "Sabbir Hossain",
    phone: "01700000001",
    email: "sabbir@example.com",
  },
  shippingAddress: "House 12, Road 3, Mirpur, Dhaka",
  items: [
    { name: "Premium Cotton Shirt", quantity: 2, price: 1290 },
    { name: "Leather Wallet", quantity: 1, price: 390 },
  ],
  createdAt: "30 Jan 2026, 11:30 AM",
};

const statusColor: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-orange-100 text-orange-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrderDetailsPage() {
  const { id } = useParams();

  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [trackingId, setTrackingId] = useState(order.trackingId || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    // TODO: PATCH /api/v1/admin/orders/:id
    console.log({ id, status, trackingId });

    setTimeout(() => {
      setLoading(false);
      alert("Order updated successfully (demo)");
    }, 800);
  };

  const handleCancel = () => {
    const ok = confirm("Cancel this order? This action cannot be undone.");
    if (!ok) return;

    // TODO: PATCH /api/v1/admin/orders/:id/cancel
    alert("Order cancelled (demo)");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Order Details</h1>
          <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <Link
              href={`/admin/orders/${id}/shipping`}
              className="px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
            >
              Shipping
            </Link>
            <Link
              href={`/admin/orders/${id}/invoice`}
              className="px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
            >
              Invoice
            </Link>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[status]}`}>
          {status}
        </span>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <User size={18} className="text-orange-600" />
            Customer
          </div>
          <p className="font-semibold text-gray-800">{order.customer.name}</p>
          <p className="text-sm text-gray-500">{order.customer.phone}</p>
          <p className="text-sm text-gray-500">{order.customer.email}</p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <MapPin size={18} className="text-orange-600" />
            Shipping Address
          </div>
          <p className="text-sm text-gray-700">{order.shippingAddress}</p>
          <p className="text-xs text-gray-400">Placed on {order.createdAt}</p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <CreditCard size={18} className="text-orange-600" />
            Payment
          </div>
          <p className="text-sm">
            Status:{" "}
            <span className={`font-semibold ${order.paymentStatus === "paid" ? "text-green-600" : "text-red-600"}`}>
              {order.paymentStatus}
            </span>
          </p>
          <p className="text-sm">Method: {order.paymentMethod}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 font-semibold border-b flex items-center gap-2">
          <Package size={18} />
          Items
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">৳ {item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Breakdown + Update */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-2 lg:col-span-1">
          <h3 className="font-semibold text-gray-800">Price Breakdown</h3>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>৳ {order.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>৳ {order.shippingCost}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>৳ {order.totalAmount}</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <Truck size={18} className="text-orange-600" />
            Update Order
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Tracking ID</label>
              <input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking number"
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-50"
            >
              <Save size={16} />
              Save Changes
            </button>

            {status !== "cancelled" ? (
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50"
              >
                <AlertTriangle size={16} />
                Cancel Order
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
