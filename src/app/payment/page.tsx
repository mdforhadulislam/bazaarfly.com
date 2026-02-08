"use client";

import CheckoutLayout from "@/components/Layout/CheckoutLayout";
import { CreditCard, Wallet, Truck, ShieldCheck, CheckCircle, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type PaymentInit = {
  orderId: string;
  orderNumber?: string;
  amount: number;
  subtotal?: number;
  shippingCost?: number;
  coupon?: string;
  selectedAddress?: any;
  createdAt: number;
};

export default function PaymentPage() {
  const [method, setMethod] = useState<"cod" | "online">("cod");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [init, setInit] = useState<PaymentInit | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ read init data from checkout
  useEffect(() => {
    const raw = sessionStorage.getItem("bf_payment_init");
    if (!raw) return;
    try {
      setInit(JSON.parse(raw));
    } catch {
      setInit(null);
    }
  }, []);

  const subtotal = init?.subtotal ?? 1799;
  const deliveryCharge = init?.shippingCost ?? 80;
  const total = useMemo(() => init?.amount ?? subtotal + deliveryCharge, [init, subtotal, deliveryCharge]);

  const handleFileChange = (file: File) => {
    setPaymentProof(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeProof = () => {
    setPaymentProof(null);
    setPreview(null);
  };

  const handleConfirm = async () => {
    try {
      setErr(null);

      if (!init?.orderId) throw new Error("Order not found. Please go back to checkout.");
      if (method === "online" && !paymentProof) throw new Error("Payment screenshot required.");

      setLoading(true);

      // NOTE: right now your API accepts { method, transactionId, gatewayResponse }
      // screenshot upload API তুমি এখনো দাও নি, তাই আমরা আপাতত gatewayResponse এ meta দিয়ে পাঠাচ্ছি।
      const res = await fetch(`/api/order/${init.orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: method === "cod" ? "cash_on_delivery" : "online",
          transactionId: null,
          gatewayResponse: {
            hasProof: !!paymentProof,
            proofName: paymentProof?.name || null,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Payment failed");

      // success store + redirect
      sessionStorage.setItem(
        "bf_payment_success",
        JSON.stringify({
          orderId: init.orderId,
          payment: json?.data,
          paidAt: Date.now(),
        })
      );

      window.location.href = "/account/orders";
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckoutLayout currentStep={3}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT — PAYMENT METHODS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Choose Payment Method</h2>

            {err && (
              <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
                {err}
              </div>
            )}

            {/* CASH ON DELIVERY */}
            <label
              onClick={() => setMethod("cod")}
              className={`flex items-center justify-between p-5 border rounded-xl cursor-pointer transition ${
                method === "cod" ? "border-orange-600 bg-orange-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className="text-orange-600" />
                <div>
                  <p className="font-semibold">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay when your product arrives</p>
                </div>
              </div>

              {method === "cod" && <CheckCircle className="text-orange-600" />}
            </label>

            {/* ONLINE PAYMENT */}
            <label
              onClick={() => setMethod("online")}
              className={`flex items-center justify-between p-5 border rounded-xl cursor-pointer transition ${
                method === "online" ? "border-orange-600 bg-orange-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="text-orange-600" />
                <div>
                  <p className="font-semibold">Online Payment</p>
                  <p className="text-xs text-gray-500">Pay via Bkash, Rocket, Nagad, or Card</p>
                </div>
              </div>

              {method === "online" && <CheckCircle className="text-orange-600" />}
            </label>

            {/* PAYMENT PROOF UPLOAD (ONLINE) */}
            {method === "online" && (
              <div className="border rounded-xl p-5 bg-orange-50 space-y-4">
                <h3 className="font-semibold text-sm text-gray-900">Upload Payment Screenshot</h3>

                {!preview ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-white transition">
                    <Upload className="text-orange-600 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload payment proof (PNG, JPG)</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                      }}
                    />
                  </label>
                ) : (
                  <div className="relative w-full max-w-sm">
                    <Image
                      src={preview}
                      alt="Payment Proof"
                      width={400}
                      height={240}
                      className="rounded-xl border object-cover"
                    />
                    <button
                      onClick={removeProof}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                      aria-label="Remove"
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {!paymentProof && (
                  <p className="text-xs text-red-500">Payment screenshot required to confirm order</p>
                )}
              </div>
            )}

            {/* TRUST BADGES */}
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 pt-4">
              <div className="flex gap-2 items-center">
                <ShieldCheck size={16} className="text-orange-600" /> Secure Payment
              </div>
              <div className="flex gap-2 items-center">
                <Wallet size={16} className="text-orange-600" /> Verified Gateway
              </div>
              <div className="flex gap-2 items-center">
                <Truck size={16} className="text-orange-600" /> Fast Delivery
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit space-y-5 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">৳{subtotal}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery Charge</span>
            <span className="font-semibold">৳{deliveryCharge}</span>
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-extrabold">
            <span>Total</span>
            <span className="text-orange-600">৳{total}</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading || (method === "online" && !paymentProof)}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition"
          >
            {loading ? "Confirming..." : "Confirm Order"}
          </button>

          <p className="text-xs text-gray-400 text-center">Your payment is secure and encrypted</p>
        </div>
      </div>
    </CheckoutLayout>
  );
}
