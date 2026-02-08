"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Package,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";

type Stat = {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ size?: number }>;
};

type OrderRow = {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  date: string;
};

type LowStockRow = {
  id: string;
  name: string;
  sku: string;
  stock: number;
};

const stats: Stat[] = [
  {
    label: "Total Users",
    value: "1,248",
    sub: "+18 today",
    icon: Users,
  },
  {
    label: "Total Orders",
    value: "3,492",
    sub: "+54 this week",
    icon: ShoppingBag,
  },
  {
    label: "Total Revenue",
    value: "৳ 1,245,600",
    sub: "+৳ 32,120 this week",
    icon: CreditCard,
  },
  {
    label: "Products",
    value: "862",
    sub: "12 low stock",
    icon: Package,
  },
];

const orderStatusSummary = [
  { label: "Pending", value: 24, icon: Clock3 },
  { label: "Processing", value: 31, icon: TrendingUp },
  { label: "Shipped", value: 18, icon: Truck },
  { label: "Delivered", value: 57, icon: CheckCircle2 },
];

const recentOrders: OrderRow[] = [
  {
    id: "1",
    orderNumber: "ORD-100245",
    customer: "Sabbir Hossain",
    total: 2590,
    status: "processing",
    date: "Today, 11:30 AM",
  },
  {
    id: "2",
    orderNumber: "ORD-100244",
    customer: "Nusrat Jahan",
    total: 1450,
    status: "pending",
    date: "Today, 10:05 AM",
  },
  {
    id: "3",
    orderNumber: "ORD-100243",
    customer: "Rafi Ahmed",
    total: 3990,
    status: "shipped",
    date: "Yesterday, 08:40 PM",
  },
  {
    id: "4",
    orderNumber: "ORD-100242",
    customer: "Tanvir Araf",
    total: 990,
    status: "delivered",
    date: "Yesterday, 06:12 PM",
  },
];

const lowStock: LowStockRow[] = [
  { id: "p1", name: "Premium Cotton Shirt", sku: "SHIRT-001", stock: 4 },
  { id: "p2", name: "Women Kurti (Classic)", sku: "KURTI-112", stock: 6 },
  { id: "p3", name: "Wireless Earbuds", sku: "EB-778", stock: 3 },
  { id: "p4", name: "Sports Shoes (Black)", sku: "SHOE-090", stock: 5 },
];

const activities = [
  { title: "New order placed", time: "2 min ago" },
  { title: "Payment completed", time: "10 min ago" },
  { title: "New user registered", time: "1 hour ago" },
  { title: "Product stock updated", time: "2 hours ago" },
];

function StatusBadge({ status }: { status: OrderRow["status"] }) {
  const map: Record<OrderRow["status"], string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-orange-100 text-orange-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}
    >
      {status}
    </span>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Overview of Bazaarfly platform
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="px-3 py-2 rounded-md text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 transition"
          >
            + Add Product
          </Link>

          <Link
            href="/admin/orders"
            className="px-3 py-2 rounded-md text-sm font-semibold border hover:bg-gray-50 transition flex items-center gap-2"
          >
            View Orders <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                <Icon size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-xl font-semibold text-gray-800">
                  {item.value}
                </p>
                {item.sub ? (
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {orderStatusSummary.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{s.label}</p>
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-800 mt-2">
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag size={18} /> Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-orange-600 hover:underline"
            >
              See all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-b-0">
                    <td className="py-3 pr-3 font-semibold text-gray-800">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 pr-3 text-gray-700">{o.customer}</td>
                    <td className="py-3 pr-3 font-semibold">
                      ৳ {o.total.toLocaleString()}
                    </td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 pr-3 text-gray-500">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side cards */}
        <div className="space-y-6">
          {/* Low stock */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-600" />
                Low Stock
              </h2>
              <Link
                href="/admin/products"
                className="text-sm font-semibold text-orange-600 hover:underline"
              >
                Manage
              </Link>
            </div>

            <ul className="space-y-3">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                  </div>

                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <ul className="space-y-3 text-sm">
              {activities.map((a, idx) => (
                <li key={idx} className="flex justify-between gap-3">
                  <span className="text-gray-700">{a.title}</span>
                  <span className="text-gray-400 whitespace-nowrap">
                    {a.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Revenue overview block (optional placeholder) */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={18} /> Revenue Overview
          </h2>
          <Link
            href="/admin/analytics"
            className="text-sm font-semibold text-orange-600 hover:underline"
          >
            View analytics
          </Link>
        </div>

        <div className="mt-4 h-56 flex items-center justify-center text-gray-400 text-sm border rounded-md">
          Revenue chart will be here (API + chart later)
        </div>
      </div>
    </div>
  );
}
