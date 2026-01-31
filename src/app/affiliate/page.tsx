"use client";

import Link from "next/link";
import {
  Wallet,
  MousePointerClick,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

export default function AffiliateDashboard() {
  const stats = [
    {
      label: "Total Earnings",
      value: "৳25,450",
      icon: Wallet,
    },
    {
      label: "Pending Earnings",
      value: "৳4,200",
      icon: TrendingUp,
    },
    {
      label: "Total Clicks",
      value: "1,245",
      icon: MousePointerClick,
    },
    {
      label: "Conversions",
      value: "87 Orders",
      icon: ShoppingCart,
    },
  ];

  const recentCommissions = [
    {
      orderId: "ORD-1023",
      product: "Men Casual Shirt",
      commission: 120,
      date: "2 hours ago",
      status: "approved",
    },
    {
      orderId: "ORD-1018",
      product: "Running Sneakers",
      commission: 200,
      date: "Yesterday",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          Affiliate Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Monitor your earnings and affiliate performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <div
              key={s.label}
              className="border rounded-xl p-5 flex gap-3 items-center bg-white hover:shadow-sm transition"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Icon size={18} />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {s.label}
                </p>
                <p className="font-bold text-lg">
                  {s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-3">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/affiliate/links"
            className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm"
          >
            Generate Affiliate Link
          </Link>

          <Link
            href="/affiliate/wallet"
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            View Wallet
          </Link>

          <Link
            href="/affiliate/withdraw"
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
          >
            Withdraw Earnings
          </Link>
        </div>
      </div>

      {/* Recent Commissions */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">
            Recent Commissions
          </h2>

          <Link
            href="/affiliate/commissions"
            className="text-sm text-orange-600"
          >
            View All →
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {recentCommissions.map((c) => (
            <div
              key={c.orderId}
              className="flex flex-col md:flex-row md:justify-between md:items-center border rounded-lg p-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-sm">
                  {c.product}
                </p>
                <p className="text-xs text-gray-500">
                  Order: {c.orderId}
                </p>
                <p className="text-xs text-gray-500">
                  {c.date}
                </p>
              </div>

              <div className="flex gap-3 items-center mt-2 md:mt-0">
                <span className="font-semibold text-orange-600">
                  ৳{c.commission}
                </span>

                <span
                  className={`text-xs px-2 py-1 rounded capitalize ${
                    c.status === "approved"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
