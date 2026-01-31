"use client";

import Link from "next/link";

const stats = [
  { id: "orders", label: "Total Orders", value: 24 },
  { id: "pending", label: "Pending Orders", value: 3 },
  { id: "wishlist", label: "Wishlist Items", value: 8 },
  { id: "addresses", label: "Saved Addresses", value: 2 },
];

const recentOrders = [
  { id: "ORD-1001", date: "25 Jan 2026", total: 2490, status: "Delivered" },
  { id: "ORD-1002", date: "26 Jan 2026", total: 1290, status: "Processing" },
  { id: "ORD-1003", date: "27 Jan 2026", total: 2990, status: "Shipped" },
];

export default function AccountPage() {
  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back 👋
        </h1>
        <p className="text-sm mt-1 opacity-90">
          Manage your Bazaarfly account, orders and profile settings here.
        </p>

        <div className="flex gap-3 mt-4">
          <Link
            href="/account/orders"
            className="bg-white text-orange-600 px-4 py-2 rounded-md text-sm font-medium"
          >
            View Orders
          </Link>

          <Link
            href="/account/profile"
            className="bg-white/20 px-4 py-2 rounded-md text-sm"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div
            key={s.id}
            className="border rounded-xl p-5 bg-white hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </section>

      {/* Recent Orders */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>

          <Link
            href="/account/orders"
            className="text-sm text-orange-600"
          >
            View All
          </Link>
        </div>

        <div className="border rounded-xl overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3">{o.id}</td>
                  <td className="px-4 py-3">{o.date}</td>
                  <td className="px-4 py-3">BDT {o.total}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        o.status === "Delivered"
                          ? "bg-green-50 text-green-600"
                          : o.status === "Processing"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/account/orders/${o.id}`}
                      className="text-orange-600"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/account/profile"
            className="border rounded-xl p-6 text-center bg-white hover:shadow-md transition"
          >
            Edit Profile
          </Link>

          <Link
            href="/account/address"
            className="border rounded-xl p-6 text-center bg-white hover:shadow-md transition"
          >
            Manage Addresses
          </Link>

          <Link
            href="/account/orders"
            className="border rounded-xl p-6 text-center bg-white hover:shadow-md transition"
          >
            Track Orders
          </Link>
        </div>
      </section>
    </div>
  );
}
