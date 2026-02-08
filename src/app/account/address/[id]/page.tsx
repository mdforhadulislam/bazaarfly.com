"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // ✅ adjust if needed

type AddressDoc = {
  _id: string;
  label?: string;
  address: string;
  area?: string;
  city: string;
  postalCode?: string;
  isDefault?: boolean;
};

export default function AddressEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const phone = user?.phoneNumber || "";
  const id = (params.id as string) || "new";

  const isNew = useMemo(() => id === "new", [id]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    label: "",
    address: "",
    city: "",
    postalCode: "",
    area: "dhaka",
    isDefault: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const loadSingle = async () => {
    try {
      setErr(null);

      if (!phone) return;

      setLoading(true);
      const res = await fetch(
        `/api/account/${phone}/address?id=${encodeURIComponent(id)}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load address");

      const a: AddressDoc = json?.data;

      setForm({
        label: a?.label || "",
        address: a?.address || "",
        city: a?.city || "",
        postalCode: a?.postalCode || "",
        area: (a?.area as any) || "dhaka",
        isDefault: !!a?.isDefault,
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to load address");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      if (authLoading) return;

      if (isNew) {
        setLoading(false);
        return;
      }

      await loadSingle();
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, phone, id]);

  const handleSave = async () => {
    try {
      setErr(null);

      if (!phone) throw new Error("User phone not found");

      // basic validation
      const errors: string[] = [];
      if (!form.address.trim()) errors.push("Address is required");
      if (!form.city.trim()) errors.push("City is required");
      if (!form.postalCode.trim()) errors.push("Postal code is required");
      if (!form.area) errors.push("Area is required");

      if (errors.length) throw new Error(errors[0]);

      setLoading(true);

      if (isNew) {
        // CREATE
        const res = await fetch(`/api/account/${phone}/address`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: form.label || "Home",
            address: form.address,
            area: form.area,
            city: form.city,
            postalCode: form.postalCode,
            isDefault: form.isDefault,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Create failed");

        router.push("/account/address");
        return;
      }

      // UPDATE (PATCH)
      const res = await fetch(`/api/account/${phone}/address`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          updates: {
            label: form.label,
            address: form.address,
            area: form.area,
            city: form.city,
            postalCode: form.postalCode,
            isDefault: form.isDefault,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Update failed");

      router.push("/account/address");
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">
        {isNew ? "Add Address" : "Edit Address"}
      </h1>

      {err && (
        <div className="mb-5 border border-red-200 bg-red-50 text-red-700 rounded-lg p-4 text-sm">
          {err}
        </div>
      )}

      <div className="bg-white border rounded-xl p-6 space-y-5">
        <div>
          <label className="text-sm text-gray-600">Label</label>
          <input
            name="label"
            value={form.label}
            onChange={handleChange}
            placeholder="Home / Office"
            className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Postal Code</label>
            <input
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Area</label>
          <select
            name="area"
            value={form.area}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 mt-1 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
          >
            <option value="dhaka">Dhaka</option>
            <option value="outside">Outside Dhaka</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isDefault"
            checked={form.isDefault}
            onChange={handleChange}
          />
          <label className="text-sm">Set as default address</label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-md disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Address"}
          </button>

          <button
            onClick={() => router.push("/account/address")}
            className="px-6 py-2 border rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
