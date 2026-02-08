"use client";

import CheckoutLayout from "@/components/Layout/CheckoutLayout";
import { Briefcase, Home, MapPin, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type AddressDoc = {
  _id: string;
  label?: string;
  address: string;
  city: string;
  postalCode?: string;
  area?: "dhaka" | "outside";
  isDefault?: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const phone = user?.phoneNumber || "";

  // ✅ CartContext shape
  const { items: cartItems, subTotal } = useCart();

  const [loading, setLoading] = useState(false);
  const [addrLoading, setAddrLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<AddressDoc[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressDoc | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const [coupon, setCoupon] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: "Home" as "Home" | "Office",
    area: "dhaka" as "dhaka" | "outside",
    address: "",
    city: "",
    postalCode: "",
    isDefault: false,
  });

  const subtotal = Number(subTotal || 0);

  const deliveryCharge = useMemo(() => {
    if (!selectedAddress) return 0;
    return selectedAddress.area === "dhaka" ? 80 : 120;
  }, [selectedAddress]);

  const discount = coupon.trim().toUpperCase() === "SAVE100" ? 100 : 0;
  const total = Math.max(0, subtotal + deliveryCharge - discount);

  // ✅ Load address
  const loadAddresses = async () => {
    try {
      setErr(null);

      if (!phone) {
        setAddresses([]);
        setSelectedAddress(null);
        setSelectedAddressId("");
        return;
      }

      setAddrLoading(true);

      const res = await fetch(`/api/account/${phone}/address`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load addresses");

      const list: AddressDoc[] = Array.isArray(json?.data) ? json.data : [];
      setAddresses(list);

      const def = list.find((a) => a.isDefault) || list[0] || null;
      setSelectedAddress(def);
      setSelectedAddressId(def?._id || "");
    } catch (e: any) {
      setErr(e?.message || "Failed to load addresses");
    } finally {
      setAddrLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, phone]);

  // ✅ Save new address
  const handleSaveAddress = async () => {
    try {
      setErr(null);

      if (!phone) throw new Error("User not found. Please login again.");
      if (!newAddress.address.trim()) throw new Error("Address is required");
      if (!newAddress.city.trim()) throw new Error("City is required");
      if (!newAddress.postalCode.trim()) throw new Error("Postal code is required");

      setLoading(true);

      const res = await fetch(`/api/account/${phone}/address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newAddress.label,
          address: newAddress.address,
          area: newAddress.area,
          city: newAddress.city,
          postalCode: newAddress.postalCode,
          isDefault: newAddress.isDefault,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to save address");

      const created: AddressDoc = json?.data;

      setAddresses((prev) => {
        const normalized = newAddress.isDefault
          ? prev.map((a) => ({ ...a, isDefault: false }))
          : prev;
        return [created, ...normalized];
      });

      setSelectedAddress(created);
      setSelectedAddressId(created._id);

      setNewAddress({
        label: "Home",
        area: "dhaka",
        address: "",
        city: "",
        postalCode: "",
        isDefault: false,
      });

      setShowModal(false);
    } catch (e: any) {
      setErr(e?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: build order items from CartContext shape
  const buildOrderItems = () => {
    return (cartItems || [])
      .map((it) => ({
        product: it.productId,     // ✅ correct
        quantity: it.qty,          // ✅ correct
      }))
      .filter((x) => !!x.product && x.quantity > 0);
  };

  // ✅ Proceed -> create order -> go payment page
  const handleProceedToPayment = async () => {
    try {
      setErr(null);

      if (!selectedAddressId) throw new Error("Please select an address.");
      if (!phone) throw new Error("Please login again.");

      const items = buildOrderItems();
      if (items.length === 0) throw new Error("Your cart is empty.");

      setLoading(true);

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          addressId: selectedAddressId,
          shippingCost: deliveryCharge,
          note: coupon ? `Coupon: ${coupon}` : "",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Order create failed");

      const order = json?.data;
      if (!order?._id) throw new Error("Order created but missing orderId.");

      // ✅ redirect payment page with orderId
      router.push(`/payment?orderId=${order._id}`);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const labelIcon = (label?: string) => {
    const x = String(label || "").toLowerCase();
    if (x.includes("office")) return <Briefcase size={14} />;
    return <Home size={14} />;
  };

  return (
    <CheckoutLayout currentStep={2}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Select Delivery Address</h2>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold"
              >
                <Plus size={16} /> Add Address
              </button>
            </div>

            {err && (
              <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
                {err}
              </div>
            )}

            {addrLoading ? (
              <div className="text-sm text-gray-500">Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="text-sm text-gray-500">No address found. Please add an address to continue.</div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start justify-between p-4 border rounded-xl cursor-pointer transition ${
                      selectedAddressId === addr._id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={selectedAddressId === addr._id}
                        onChange={() => {
                          setSelectedAddress(addr);
                          setSelectedAddressId(addr._id);
                        }}
                        className="accent-orange-600 mt-1"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{addr.label || "Address"}</p>
                          {addr.isDefault && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin size={14} /> {addr.address}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {addr.city}
                          {addr.postalCode ? `, ${addr.postalCode}` : ""}
                          {addr.area ? ` • ${addr.area}` : ""}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold flex items-center gap-1">
                      {labelIcon(addr.label)}
                      {addr.label || "Home"}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit space-y-5 sticky top-24">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Coupon Code</label>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter coupon"
                className="flex-1 border rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={() => setCoupon((c) => c)}
                className="px-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700"
              >
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

          <button
            onClick={handleProceedToPayment}
            disabled={!selectedAddressId || loading || subtotal <= 0}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>

          {subtotal <= 0 && (
            <p className="text-xs text-red-500">Cart is empty. Please add products to continue.</p>
          )}
        </div>

        {/* ADD ADDRESS MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Add New Address</h3>
                <button onClick={() => setShowModal(false)} aria-label="Close">
                  <X />
                </button>
              </div>

              <input
                placeholder="Label (Home/Office)"
                value={newAddress.label}
                onChange={(e) =>
                  setNewAddress((p) => ({
                    ...p,
                    label: (e.target.value as any) || "Home",
                  }))
                }
                className="w-full border rounded-xl p-3 text-sm"
              />

              <textarea
                placeholder="Full Address"
                rows={3}
                value={newAddress.address}
                onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))}
                className="w-full border rounded-xl p-3 text-sm"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                  className="w-full border rounded-xl p-3 text-sm"
                />

                <input
                  placeholder="Postal Code"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress((p) => ({ ...p, postalCode: e.target.value }))}
                  className="w-full border rounded-xl p-3 text-sm"
                />
              </div>

              <select
                value={newAddress.area}
                onChange={(e) =>
                  setNewAddress((p) => ({
                    ...p,
                    area: e.target.value as "dhaka" | "outside",
                  }))
                }
                className="w-full border rounded-xl p-3 text-sm"
              >
                <option value="dhaka">Dhaka</option>
                <option value="outside">Outside Dhaka</option>
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress((p) => ({ ...p, isDefault: e.target.checked }))}
                />
                Set as default address
              </label>

              <button
                onClick={handleSaveAddress}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold"
              >
                {loading ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        )}
      </div>
    </CheckoutLayout>
  );
}
