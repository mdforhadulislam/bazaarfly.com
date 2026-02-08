"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick,
  ShoppingCart,
  ArrowRight,
  Calendar,
} from "lucide-react";

type Period = "7d" | "30d" | "90d";

type TrendPoint = {
  day: string;
  visits: number;
  orders: number;
  revenue: number;
};

const DUMMY_TREND_7D: TrendPoint[] = [
  { day: "Mon", visits: 820, orders: 24, revenue: 51200 },
  { day: "Tue", visits: 910, orders: 28, revenue: 61000 },
  { day: "Wed", visits: 760, orders: 21, revenue: 44500 },
  { day: "Thu", visits: 980, orders: 31, revenue: 70200 },
  { day: "Fri", visits: 1100, orders: 35, revenue: 78400 },
  { day: "Sat", visits: 920, orders: 26, revenue: 55800 },
  { day: "Sun", visits: 870, orders: 23, revenue: 49200 },
];

const DUMMY_TREND_30D: TrendPoint[] = Array.from({ length: 30 }).map((_, i) => ({
  day: `D${i + 1}`,
  visits: 650 + ((i * 37) % 420),
  orders: 14 + ((i * 5) % 18),
  revenue: 28000 + ((i * 1900) % 26000),
}));

const DUMMY_TREND_90D: TrendPoint[] = Array.from({ length: 30 }).map((_, i) => ({
  day: `W${i + 1}`,
  visits: 5200 + ((i * 430) % 2600),
  orders: 120 + ((i * 11) % 80),
  revenue: 380000 + ((i * 19000) % 220000),
}));

const currency = (n: number) => `৳${Number(n || 0).toLocaleString()}`;

function MiniBar({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const w = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-orange-600" style={{ width: `${w}%` }} />
    </div>
  );
}

export default function AnalyticsOverviewPage() {
  const [period, setPeriod] = useState<Period>("7d");

  const data = useMemo(() => {
    if (period === "7d") return DUMMY_TREND_7D;
    if (period === "30d") return DUMMY_TREND_30D;
    return DUMMY_TREND_90D;
  }, [period]);

  const totals = useMemo(() => {
    const visits = data.reduce((a, b) => a + b.visits, 0);
    const orders = data.reduce((a, b) => a + b.orders, 0);
    const revenue = data.reduce((a, b) => a + b.revenue, 0);
    const conv = visits ? Number(((orders / visits) * 100).toFixed(2)) : 0;
    return { visits, orders, revenue, conv };
  }, [data]);

  const maxVisits = useMemo(() => Math.max(...data.map((d) => d.visits)), [data]);
  const maxOrders = useMemo(() => Math.max(...data.map((d) => d.orders)), [data]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-orange-50 border">
            <BarChart3 className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600">
              Overview of traffic + order performance (dummy data).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
          >
            Traffic <ArrowRight size={16} />
          </Link>
          <Link
            href="/admin/analytics/order"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            Orders <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Visits</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {totals.visits.toLocaleString()}
          </p>
          <div className="mt-3">
            <MiniBar value={totals.visits} max={totals.visits} />
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Orders</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {totals.orders.toLocaleString()}
          </p>
          <div className="mt-3">
            <MiniBar value={totals.orders} max={Math.max(1, totals.orders)} />
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{currency(totals.revenue)}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <TrendingUp size={16} className="text-gray-400" />
            Based on selected period
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Conversion Rate</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{totals.conv}%</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <MousePointerClick size={16} className="text-gray-400" />
            Orders / Visits
          </div>
        </div>
      </div>

      {/* Trend chart (simple bars) */}
      <div className="bg-white border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Trend</p>
            <p className="text-xs text-gray-500">Visits & Orders (simple bar chart)</p>
          </div>

          <div className="inline-flex items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-600" /> Visits
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-700" /> Orders
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {data.slice(-7).map((d) => (
            <div key={d.day} className="space-y-2">
              <div className="h-28 flex items-end gap-1">
                <div
                  className="w-1/2 bg-orange-600 rounded-t-lg"
                  style={{ height: `${Math.max(6, (d.visits / maxVisits) * 100)}%` }}
                  title={`Visits: ${d.visits}`}
                />
                <div
                  className="w-1/2 bg-gray-800 rounded-t-lg"
                  style={{ height: `${Math.max(6, (d.orders / maxOrders) * 100)}%` }}
                  title={`Orders: ${d.orders}`}
                />
              </div>
              <p className="text-[11px] text-gray-600 text-center">{d.day}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Link
            href="/admin/analytics/traffic"
            className="bg-orange-50 border rounded-2xl p-4 flex items-center justify-between hover:bg-orange-100 transition"
          >
            <div className="flex items-center gap-2">
              <Users size={18} className="text-orange-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Traffic Report</p>
                <p className="text-xs text-gray-600">Users • Sessions • Sources</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-gray-500" />
          </Link>

          <Link
            href="/admin/analytics/order"
            className="bg-white border rounded-2xl p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-gray-700" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Order Report</p>
                <p className="text-xs text-gray-600">Revenue • AOV • Status</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-gray-500" />
          </Link>

          <div className="bg-white border rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-900">Quick Notes</p>
            <p className="text-xs text-gray-600 mt-1">
              API connect করলে এই page real analytics দেখাবে।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
