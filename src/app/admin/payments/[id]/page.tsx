"use client";

import { useParams } from "next/navigation";
import {
  CreditCard,
  User,
  FileText,
  ArrowLeft,
  RotateCcw,
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

  return (
    <div className="space-y-6 max-w-4xl">
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
          Payment ID: {payment.paymentId}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-2">
          <CreditCard size={18} className="text-orange-600" />
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-xl font-semibold">৳ {payment.amount}</p>
          <p className="text-sm">{payment.method}</p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-2">
          <User size={18} className="text-orange-600" />
          <p className="text-sm text-gray-500">Customer</p>
          <p className="font-semibold">{payment.customer.name}</p>
          <p className="text-sm text-gray-500">{payment.customer.phone}</p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-2">
          <FileText size={18} className="text-orange-600" />
          <p className="text-sm text-gray-500">Order</p>
          <p className="font-semibold">{payment.orderNumber}</p>
          <p className="text-sm text-gray-500">{payment.createdAt}</p>
        </div>
      </div>

      {/* Gateway Info */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-800">Gateway Response</h2>

        <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-x-auto">
{JSON.stringify(payment.gatewayResponse, null, 2)}
        </pre>
      </div>

      {/* Admin Action */}
      {payment.status === "success" && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
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
