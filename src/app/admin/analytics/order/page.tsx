"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  BadgeDollarSign,
  TrendingUp,
  ClipboardList,
  Calendar,
  Search,
  X,
  Download,
} from "lucide-react";

type Period = "7d" | "30d" | "90d";
type Status = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

type OrderPoint = {
  label: string;
  orders: number;
  revenue: number;
};

type StatusRow = { status: Status; count: number };
type ProductRow = { name: string; sold: number; revenue: number };

const currency = (n: number) => `৳${Number(n || 0).toLocaleString()}`;

const makeOrders = (period: Period): OrderPoint[] => {
  if (period === "7d") {
    return [
      { label: "Mon", orders: 22, revenue: 48200 },
      { label: "Tue", orders: 28, revenue: 61000 },
      { label: "Wed", orders: 19, revenue: 40100 },
      { label: "Thu", orders: 31, revenue: 70200 },
      { label: "Fri", orders: 36, revenue: 82400 },
      { label: "Sat", orders: 25, revenue: 53700 },
      { label: "Sun", orders: 21, revenue: 46800 },
    ];
  }
  if (period === "30d") {
    return Array.from({ length: 30 }).map((_, i) => ({
      label: `D${i + 1}`,
      orders: 12 + ((i * 3) % 20),
      revenue: 26000 + ((i * 1300) % 29000),
    }));
  }
  return Array.from({ length: 12 }).map((_, i) => ({
    label: `W${i + 1}`,
    orders: 120 + ((i * 7) % 90),
    revenue: 380000 + ((i * 19000) % 230000),
  }));
};

const STATUS_BREAKDOWN: StatusRow[] = [
  { status: "delivered", count: 112 },
  { status: "processing", count: 38 },
  { status: "shipped", count: 26 },
  { status: "pending", count: 19 },
  { status: "cancelled", count: 11 },
];

const TOP_PRODUCTS: ProductRow[] = [
  { name: "Premium Cotton Shirt", sold: 96, revenue: 124800 },
  { name: "Ladies Dress (New)", sold: 71, revenue: 161500 },
  { name: "Wireless Earbuds", sold: 55, revenue: 99000 },
  { name: "Winter Jacket", sold: 42, revenue: 138600 },
  { name: "Sharee (Party)", sold: 33, revenue: 89500 },
];

function MiniBar({ value, max }: { value: number; max: number }) {
  const w = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-orange-600" style={{ width: `${w}%` }} />
    </div>
  );
}

function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-3">
      <div className="w-full max-w-2xl bg-white rounded-2xl border shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border hover:bg-gray-50 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function OrderAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const [q, setQ] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const data = useMemo(() => makeOrders(period), [period]);

  const totals = useMemo(() => {
    const orders = data.reduce((a, b) => a + b.orders, 0);
    const revenue = data.reduce((a, b) => a + b.revenue, 0);
    const aov = orders ? Math.round(revenue / orders) : 0;
    // dummy conversion rate (assume sessions constant)
    const conversionRate = Number((2.9 + (period === "7d" ? 0.4 : period === "30d" ? 0.2 : 0)).toFixed(2));
    return { orders, revenue, aov, conversionRate };
  }, [data, period]);

  const maxOrders = useMemo(() => Math.max(...data.map((d) => d.orders)), [data]);

  const filteredProducts = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return TOP_PRODUCTS;
    return TOP_PRODUCTS.filter((p) => p.name.toLowerCase().includes(s));
  }, [q]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} /> Back
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-900">Order Analytics</h1>
            <p className="text-sm text-gray-600">Orders • Revenue • AOV • Status breakdown</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white text-sm">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="outline-none bg-transparent font-semibold text-gray-800"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <Link
            href="/admin/analytics/traffic"
            className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            Go to Traffic Analytics
          </Link>

          <button
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Orders</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{totals.orders.toLocaleString()}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <ShoppingCart size={16} className="text-gray-400" />
            Total orders
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{currency(totals.revenue)}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <BadgeDollarSign size={16} className="text-gray-400" />
            Gross revenue
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">AOV</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{currency(totals.aov)}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <ClipboardList size={16} className="text-gray-400" />
            Avg order value
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Conversion Rate</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{totals.conversionRate}%</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <TrendingUp size={16} className="text-gray-400" />
            Dummy estimate
          </div>
        </div>
      </div>

      {/* Trend + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5 lg:col-span-2 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Orders Trend</p>
            <p className="text-xs text-gray-500">Simple bars (dummy)</p>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {data.slice(-7).map((d) => (
              <div key={d.label} className="space-y-2">
                <div className="h-28 flex items-end">
                  <div
                    className="w-full bg-orange-600 rounded-t-lg"
                    style={{ height: `${Math.max(6, (d.orders / maxOrders) * 100)}%` }}
                    title={`Orders: ${d.orders}\nRevenue: ${currency(d.revenue)}`}
                  />
                </div>
                <p className="text-[11px] text-gray-600 text-center">{d.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">Revenue (selected period)</p>
              <p className="text-lg font-bold text-gray-900">{currency(totals.revenue)}</p>
            </div>
            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">AOV</p>
              <p className="text-lg font-bold text-gray-900">{currency(totals.aov)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Status Breakdown</p>
            <p className="text-xs text-gray-500">Orders by status</p>
          </div>

          <div className="space-y-3">
            {STATUS_BREAKDOWN.map((x) => (
              <div key={x.status} className="p-4 rounded-2xl border">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{x.status}</p>
                  <p className="text-sm font-bold text-gray-900">{x.count}</p>
                </div>
                <div className="mt-2">
                  <MiniBar value={x.count} max={STATUS_BREAKDOWN[0].count} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white border rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">Top Products</p>
            <p className="text-xs text-gray-500">Best sellers (dummy)</p>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search product..."
              className="pl-9 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Product</th>
                <th className="text-right px-4 py-3 font-semibold">Sold</th>
                <th className="text-right px-4 py-3 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.name} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{p.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {p.sold.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {currency(p.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <Modal title="Export Report" open={exportOpen} onClose={() => setExportOpen(false)}>
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">Export Options</p>
            <p className="text-xs text-gray-600 mt-1">
              এখন dummy modal. পরে API connect করে CSV / PDF export implement করতে পারবেন।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="px-4 py-3 rounded-2xl border text-sm font-semibold hover:bg-gray-50 transition">
              Export CSV (Dummy)
            </button>
            <button className="px-4 py-3 rounded-2xl border text-sm font-semibold hover:bg-gray-50 transition">
              Export PDF (Dummy)
            </button>
          </div>

          <div className="text-right">
            <button
              onClick={() => setExportOpen(false)}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
