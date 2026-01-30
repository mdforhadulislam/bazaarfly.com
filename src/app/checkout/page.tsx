"use client";

import CheckoutLayout from "@/components/Layout/CheckoutLayout";
import { Briefcase, Home, MapPin, Phone, Plus, X } from "lucide-react";
import { useState } from "react";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  label: "Home" | "Office";
  area: "dhaka" | "outside";
}

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "Forhadul Islam",
      phone: "01930631910",
      address: "Uttara, Dhaka",
      label: "Home",
      area: "dhaka",
    },
  ]);

  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [coupon, setCoupon] = useState("");
  const [showModal, setShowModal] = useState(false);

  // NEW ADDRESS FORM STATE
  const [newAddress, setNewAddress] = useState<Address>({
    id: "",
    name: "",
    phone: "",
    address: "",
    label: "Home",
    area: "dhaka",
  });

  const subtotal = 1799;
  const deliveryCharge = selectedAddress.area === "dhaka" ? 80 : 120;
  const discount = coupon === "SAVE100" ? 100 : 0;
  const total = subtotal + deliveryCharge - discount;

  // SAVE NEW ADDRESS
  const handleSaveAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address) return;

    const saved = {
      ...newAddress,
      id: Date.now().toString(),
    };

    setAddresses((prev) => [...prev, saved]);
    setSelectedAddress(saved);

    // Reset form
    setNewAddress({
      id: "",
      name: "",
      phone: "",
      address: "",
      label: "Home",
      area: "dhaka",
    });

    setShowModal(false);
  };

  return (
    <CheckoutLayout currentStep={2}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* ADDRESS LIST */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Select Delivery Address
              </h2>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold"
              >
                <Plus size={16} /> Add Address
              </button>
            </div>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start justify-between p-4 border rounded-xl cursor-pointer transition ${
                    selectedAddress.id === addr.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedAddress.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                      className="accent-orange-600 mt-1"
                    />

                    <div>
                      <p className="font-semibold">{addr.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Phone size={14} /> {addr.phone}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {addr.address}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold flex items-center gap-1">
                    {addr.label === "Home" ? (
                      <Home size={14} />
                    ) : (
                      <Briefcase size={14} />
                    )}
                    {addr.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit space-y-5 sticky top-24">
          {/* COUPON */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Coupon Code</label>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter coupon"
                className="flex-1 border rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="px-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700">
                Apply
              </button>
            </div>
          </div>

          <h2 className="font-bold text-lg text-gray-900">Order Summary</h2>

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">৳{subtotal}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery Charge</span>
            <span className="font-semibold">৳{deliveryCharge}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-৳{discount}</span>
            </div>
          )}

          <div className="border-t pt-4 flex justify-between text-lg font-extrabold">
            <span>Total</span>
            <span className="text-orange-600">৳{total}</span>
          </div>

          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition">
            Proceed to Payment
          </button>
        </div>

        {/* ADD ADDRESS MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Add New Address</h3>
                <button onClick={() => setShowModal(false)}>
                  <X />
                </button>
              </div>

              <input
                placeholder="Full Name"
                value={newAddress.name}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, name: e.target.value })
                }
                className="w-full border rounded-xl p-3 text-sm"
              />

              <input
                placeholder="Phone Number"
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, phone: e.target.value })
                }
                className="w-full border rounded-xl p-3 text-sm"
              />

              <textarea
                placeholder="Full Address"
                rows={3}
                value={newAddress.address}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, address: e.target.value })
                }
                className="w-full border rounded-xl p-3 text-sm"
              />

              {/* AREA */}
              <select
                value={newAddress.area}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    area: e.target.value as "dhaka" | "outside",
                  })
                }
                className="w-full border rounded-xl p-3 text-sm"
              >
                <option value="dhaka">Dhaka</option>
                <option value="outside">Outside Dhaka</option>
              </select>

              {/* LABEL */}
              <div className="flex gap-3">
                {["Home", "Office"].map((label) => (
                  <button
                    key={label}
                    onClick={() =>
                      setNewAddress({
                        ...newAddress,
                        label: label as "Home" | "Office",
                      })
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                      newAddress.label === label
                        ? "border-orange-600 bg-orange-50 text-orange-600"
                        : "border-gray-200"
                    }`}
                  >
                    {label === "Home" ? (
                      <Home size={16} />
                    ) : (
                      <Briefcase size={16} />
                    )}
                    {label}
                  </button>
                ))}
              </div>

              {/* SAVE */}
              <button
                onClick={handleSaveAddress}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold"
              >
                Save Address
              </button>
            </div>
          </div>
        )}
      </div>
    </CheckoutLayout>
  );
}
