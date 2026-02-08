"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext"; // ✅ adjust if your path differs

type Address = {
  _id: string;
  label?: string;
  address: string;
  area?: string; // dhaka/outside
  city: string;
  postalCode?: string;
  isDefault?: boolean;
  createdAt?: string;
};

export default function AddressPage() {
  const { user, loading: authLoading } = useAuth();
  const phone = user?.phoneNumber || "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const load = async () => {
    try {
      setErr(null);
      if (!phone) {
        setAddresses([]);
        return;
      }
      setLoading(true);

      const res = await fetch(`/api/account/${phone}/address`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load addresses");

      setAddresses(Array.isArray(json?.data) ? json.data : []);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, phone]);

  const handleDelete = async (id: string) => {
    if (!phone) return;
    const ok = confirm("Delete this address?");
    if (!ok) return;

    try {
      setErr(null);
      const res = await fetch(`/api/account/${phone}/address?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Delete failed");

      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">My Addresses</h1>

        <Link
          href="/account/address/new"
          className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm"
        >
          Add Address
        </Link>
      </div>

      {err && (
        <div className="mb-5 border border-red-200 bg-red-50 text-red-700 rounded-lg p-4 text-sm">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : addresses.length === 0 ? (
        <div className="text-sm text-gray-500">No address found.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="bg-white border rounded-xl p-5 hover:shadow-sm transition"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-3">
                <div>
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold">
                      {addr.label || "Address"}
                    </p>

                    {!!addr.isDefault && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500">
                    {addr.address}
                  </p>

                  <p className="text-sm text-gray-500">
                    {addr.city}
                    {addr.postalCode ? `, ${addr.postalCode}` : ""}
                    {addr.area ? ` • ${addr.area}` : ""}
                  </p>
                </div>

                <div className="flex gap-3 md:items-end">
                  <Link
                    href={`/account/address/${addr._id}`}
                    className="text-sm text-orange-600"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
