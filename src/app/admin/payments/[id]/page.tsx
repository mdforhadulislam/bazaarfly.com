"use client";

import { useParams } from "next/navigation";
import {
  CreditCard,
  User,
  FileText,
  ArrowLeft,
  RotateCcw,
  Image as ImageIcon,
  ExternalLink,
  Download,
} from "lucide-react";
import Link from "next/link";

/* ---------------- DUMMY DATA ---------------- */
const payment = {
  paymentId: "PAY-10001",
  orderNumber: "ORD-100245",
  customer: {
    name: "Sabbir Hossain",
    phone: "01700000001",
    email: "sabbir@example.com",
  },
  paymentSS:
    "https://res.cloudinary.com/demo/image/upload/sample.jpg", // ✅ demo image (replace with real url)
  amount: 2590,
  method: "bKash",
  status: "success",
  transactionId: "BKASH-TXN-889900",
  createdAt: "30 Jan 2026, 11:35 AM",
  gatewayResponse: {
    trxID: "889900",
    payer: "017XXXXXXXX",
    reference: "Order Payment",
  },
};

export default function AdminPaymentDetailsPage() {
  const { id } = useParams();

  const handleRefund = () => {
    const ok = confirm("Refund this payment?");
    if (!ok) return;

    // TODO: POST /api/v1/admin/payments/:id/refund
    alert("Refund initiated (demo)");
  };

  const hasSS = Boolean(payment.paymentSS);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600"
        >
          <ArrowLeft size={16} />
          Back to Payments
        </Link>

        <h1 className="text-2xl font-semibold text-gray-800 mt-2">
          Payment Details
        </h1>
        <p className="text-sm text-gray-500">
          Payment ID: {payment.paymentId}{" "}
          <span className="text-gray-400">•</span> DB ID: {String(id)}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-2">
          <CreditCard size={18} className="text-orange-600" />
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-xl font-semibold">৳ {payment.amount}</p>
          <p className="text-sm text-gray-600">
            Method: <span className="font-semibold">{payment.method}</span>
          </p>
          <p className="text-xs text-gray-500">
            Status:{" "}
            <span
              className={`font-semibold ${
                payment.status === "success"
                  ? "text-green-600"
                  : payment.status === "pending"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {payment.status}
            </span>
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-2">
          <User size={18} className="text-orange-600" />
          <p className="text-sm text-gray-500">Customer</p>
          <p className="font-semibold text-gray-800">{payment.customer.name}</p>
          <p className="text-sm text-gray-500">{payment.customer.phone}</p>
          <p className="text-sm text-gray-500">{payment.customer.email}</p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-2">
          <FileText size={18} className="text-orange-600" />
          <p className="text-sm text-gray-500">Order</p>
          <p className="font-semibold text-gray-800">{payment.orderNumber}</p>
          <p className="text-sm text-gray-500">{payment.createdAt}</p>
          <p className="text-xs text-gray-500">
            Transaction:{" "}
            <span className="font-semibold text-gray-700">
              {payment.transactionId}
            </span>
          </p>
        </div>
      </div>

      {/* Screenshot + Gateway */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Screenshot */}
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-800 inline-flex items-center gap-2">
              <ImageIcon size={18} className="text-orange-600" />
              Payment Screenshot
            </h2>

            {hasSS ? (
              <div className="flex items-center gap-2">
                <a
                  href={payment.paymentSS}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold hover:bg-gray-50"
                >
                  <ExternalLink size={14} />
                  Open
                </a>
                <a
                  href={payment.paymentSS}
                  download
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold hover:bg-gray-50"
                >
                  <Download size={14} />
                  Download
                </a>
              </div>
            ) : null}
          </div>

          {hasSS ? (
            <a
              href={payment.paymentSS}
              target="_blank"
              rel="noreferrer"
              className="block border rounded-lg overflow-hidden hover:shadow-sm transition"
              title="Click to open full image"
            >
              {/* normal img ব্যবহার করা হলো কারণ cloudinary/external image এ next/image config লাগতে পারে */}
              <img
                src={payment.paymentSS}
                alt="Payment Screenshot"
                className="w-full h-[320px] object-contain bg-gray-50"
              />
            </a>
          ) : (
            <div className="h-[320px] flex flex-col items-center justify-center text-center border rounded-lg bg-gray-50">
              <ImageIcon size={32} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-700 mt-2">
                No screenshot uploaded
              </p>
              <p className="text-xs text-gray-500">
                Customer did not provide a payment screenshot.
              </p>
            </div>
          )}
        </div>

        {/* Gateway Info */}
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-800">Gateway Response</h2>

          <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-x-auto border">
{JSON.stringify(payment.gatewayResponse, null, 2)}
          </pre>

          <p className="text-xs text-gray-500">
            Tip: gatewayResponse database এ 그대로 রাখলে future dispute resolve করা সহজ হয়।
          </p>
        </div>
      </div>

      {/* Admin Action */}
      {payment.status === "success" && (
        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-800">Refund Payment</p>
            <p className="text-xs text-gray-500">
              Refund দিলে payment status + wallet/order status sync করতে হবে।
            </p>
          </div>

          <button
            onClick={handleRefund}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50"
          >
            <RotateCcw size={16} />
            Refund Payment
          </button>
        </div>
      )}
    </div>
  );
}
