"use client";

import { useParams } from "next/navigation";
import {
  CreditCard,
  CalendarDays,
  Receipt,
  Download,
} from "lucide-react";
import { useState } from "react";

export default function PaymentDetailsPage() {
  const params = useParams();
  const paymentId = params.id as string;

  const [payment] = useState({
    id: paymentId,
    orderId: "ORD-1001",
    date: "30 Jan 2026",
    method: "Cash on Delivery",
    status: "paid",
    amount: 2590,
    transactionId: "TXN-98273645",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-2">
          Payment Details
        </h1>

        <p className="text-sm text-gray-500">
          Payment ID: {payment.id}
        </p>
      </div>

      {/* Payment Info */}
      <div className="bg-white border rounded-xl p-6 space-y-3 shadow-sm">

        <p className="flex items-center gap-2 text-sm">
          <Receipt size={16} className="text-orange-600" />
          Order ID: <strong>{payment.orderId}</strong>
        </p>

        <p className="flex items-center gap-2 text-sm">
          <CalendarDays size={16} className="text-orange-600" />
          Payment Date: <strong>{payment.date}</strong>
        </p>

        <p className="flex items-center gap-2 text-sm">
          <CreditCard size={16} className="text-orange-600" />
          Method: <strong>{payment.method}</strong>
        </p>

        <p className="flex items-center gap-2 text-sm">
          Transaction ID: <strong>{payment.transactionId}</strong>
        </p>

        <div className="border-t pt-3 flex justify-between font-semibold">
          <span>Total Paid</span>
          <span className="text-orange-600">
            ৳{payment.amount}
          </span>
        </div>

      </div>

      {/* Invoice */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg">
          <Download size={16} /> Download Invoice
        </button>
      </div>
    </div>
  );
}
