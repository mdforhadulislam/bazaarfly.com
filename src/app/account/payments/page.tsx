"use client";

import Link from "next/link";

const payments = [
  {
    id: "PAY-1001",
    orderId: "ORD-1001",
    date: "30 Jan 2026",
    method: "Cash on Delivery",
    amount: 2590,
    status: "paid",
  },
  {
    id: "PAY-1002",
    orderId: "ORD-1002",
    date: "25 Jan 2026",
    method: "Online Payment",
    amount: 1799,
    status: "paid",
  },
];

function statusStyle(status: string) {
  if (status === "paid")
    return "bg-green-100 text-green-600";

  if (status === "pending")
    return "bg-yellow-100 text-yellow-700";

  return "bg-gray-100 text-gray-600";
}

export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">
        Payment History
      </h1>

      <div className="flex flex-col gap-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white border rounded-xl p-5 hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

              <div>
                <p className="font-semibold">
                  Payment ID: {payment.id}
                </p>

                <p className="text-sm text-gray-500">
                  Order: {payment.orderId}
                </p>

                <p className="text-sm text-gray-500">
                  Date: {payment.date}
                </p>

                <p className="text-sm text-gray-500">
                  Method: {payment.method}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded text-xs font-semibold capitalize w-fit ${statusStyle(
                  payment.status
                )}`}
              >
                {payment.status}
              </span>

              <div className="flex flex-col md:items-end gap-2">
                <p className="font-bold text-orange-600">
                  ৳{payment.amount}
                </p>

                <Link
                  href={`/account/payments/${payment.id}`}
                  className="text-sm text-orange-600"
                >
                  View Details →
                </Link>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
