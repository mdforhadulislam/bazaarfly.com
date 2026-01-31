"use client";

import {
  TrendingUp,
  MousePointerClick,
  ShoppingCart,
  Wallet,
} from "lucide-react";

export default function AffiliateAnalyticsPage() {
  const stats = [
    {
      label: "Total Clicks",
      value: "1,245",
      icon: MousePointerClick,
      growth: "+12%",
    },
    {
      label: "Conversions",
      value: "87 Orders",
      icon: ShoppingCart,
      growth: "+6%",
    },
    {
      label: "Conversion Rate",
      value: "6.9%",
      icon: TrendingUp,
      growth: "+1.2%",
    },
    {
      label: "Total Revenue",
      value: "৳25,450",
      icon: Wallet,
      growth: "+18%",
    },
  ];

  const topProducts = [
    {
      name: "Men Casual Shirt",
      clicks: 320,
      orders: 25,
      earnings: 3200,
    },
    {
      name: "Running Sneakers",
      clicks: 210,
      orders: 18,
      earnings: 2500,
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold">
            Analytics Overview
          </h1>
          <p className="text-sm text-gray-500">
            Monitor affiliate performance and traffic insights.
          </p>
        </div>

        {/* Date filter placeholder */}
        <select className="border px-3 py-2 rounded-md text-sm">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <div
              key={s.label}
              className="bg-white border rounded-xl p-5 hover:shadow-sm transition"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Icon size={18} />
                </div>

                <span className="text-xs text-green-600 font-medium">
                  {s.growth}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-3">
                {s.label}
              </p>
              <p className="font-bold text-lg">
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">
            Traffic & Earnings Chart
          </h2>
        </div>

        <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
          Analytics chart will appear here
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">
          Top Performing Products
        </h2>

        <div className="flex flex-col gap-3">
          {topProducts.map((p, i) => (
            <div
              key={p.name}
              className="flex flex-col md:flex-row md:justify-between md:items-center border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex gap-3 items-start">
                <span className="text-sm font-semibold text-orange-600">
                  #{i + 1}
                </span>

                <div>
                  <p className="font-medium text-sm">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Clicks: {p.clicks} • Orders: {p.orders}
                  </p>
                </div>
              </div>

              <div className="mt-2 md:mt-0 font-semibold text-orange-600">
                ৳{p.earnings}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
