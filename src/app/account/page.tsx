"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext"; // ✅ path adjust if needed

type OrderRow = {
  _id?: string;
  orderNumber?: string;
  createdAt?: string;
  totalAmount?: number;
  status?: string;
};

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();

  const phone = user?.phoneNumber || "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [stats, setStats] = useState([
    { id: "orders", label: "Total Orders", value: 0 },
    { id: "pending", label: "Pending Orders", value: 0 },
    { id: "wishlist", label: "Wishlist Items", value: 0 }, // placeholder
    { id: "addresses", label: "Saved Addresses", value: 0 },
  ]);

  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  useEffect(() => {
    const run = async () => {
      try {
        setErr(null);

        if (authLoading) return;

        if (!phone) {
          setRecentOrders([]);
          setStats((s) => s.map((x) => ({ ...x, value: x.id === "wishlist" ? x.value : 0 })));
          return;
        }

        setLoading(true);

        // Orders
        const ordersRes = await fetch(`/api/account/${phone}/order?page=1&limit=5`, {
          cache: "no-store",
        });
        const ordersJson = await ordersRes.json();
        if (!ordersRes.ok) throw new Error(ordersJson?.message || "Failed to load orders");

        const orders: OrderRow[] = ordersJson?.data?.orders || [];
        const totalOrders = ordersJson?.data?.pagination?.total ?? orders.length;

        const pendingCount = orders.filter((o) => {
          const s = String(o.status || "").toLowerCase();
          return ["pending", "confirmed", "processing"].includes(s);
        }).length;

        // Addresses
        const addrRes = await fetch(`/api/account/${phone}/address`, { cache: "no-store" });
        const addrJson = await addrRes.json();
        const addressCount = addrRes.ok && Array.isArray(addrJson?.data) ? addrJson.data.length : 0;

        setRecentOrders(orders);

        setStats([
          { id: "orders", label: "Total Orders", value: Number(totalOrders) || 0 },
          { id: "pending", label: "Pending Orders", value: Number(pendingCount) || 0 },
          { id: "wishlist", label: "Wishlist Items", value: 0 }, // connect later
          { id: "addresses", label: "Saved Addresses", value: Number(addressCount) || 0 },
        ]);
      } catch (e: any) {
        setErr(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [authLoading, phone]);

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back 👋 {user?.name ? `, ${user.name}` : ""}
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

      {err && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-700 rounded-lg p-4 text-sm">
          {err}
        </div>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.id} className="border rounded-xl p-5 bg-white hover:shadow-md transition">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{loading ? "…" : s.value}</p>
          </div>
        ))}
      </section>

      {/* Recent Orders */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>

          <Link href="/account/orders" className="text-sm text-orange-600">
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
              {!loading && recentOrders.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                    No orders found
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => {
                  const status = String(o.status || "").toLowerCase();
                  const pill =
                    status === "delivered"
                      ? "bg-green-50 text-green-600"
                      : ["processing", "confirmed", "pending"].includes(status)
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-blue-50 text-blue-700";

                  const id = o._id || o.orderNumber || "";

                  return (
                    <tr key={id} className="border-t">
                      <td className="px-4 py-3">{o.orderNumber || id}</td>
                      <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3">BDT {Number(o.totalAmount || 0)}</td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${pill}`}>
                          {o.status || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link href={`/account/orders/${id}`} className="text-orange-600">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

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
