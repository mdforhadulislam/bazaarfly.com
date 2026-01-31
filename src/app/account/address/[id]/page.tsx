"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function AddressEditPage() {
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    isDefault: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    alert("Address saved (demo)");
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">
        {id === "new" ? "Add Address" : "Edit Address"}
      </h1>

      <div className="bg-white border rounded-xl p-6 space-y-5">

        <div>
          <label className="text-sm text-gray-600">
            Full Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Phone Number
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Address
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            City
          </label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isDefault"
            checked={form.isDefault}
            onChange={handleChange}
          />
          <label className="text-sm">
            Set as default address
          </label>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-orange-600 text-white rounded-md"
        >
          Save Address
        </button>

      </div>
    </div>
  );
}
