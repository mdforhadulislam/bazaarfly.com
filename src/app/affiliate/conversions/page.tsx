"use client";

import Link from "next/link";

type Conversion = {
  id: string;
  orderId: string;
  product: string;
  customer: string;
  commission: number;
  status: "processing" | "completed" | "cancelled";
  date: string;
};

const conversions: Conversion[] = [
  {
    id: "CONV-1001",
    orderId: "ORD-1023",
    product: "Men Casual Shirt",
    customer: "Rahim Uddin",
    commission: 120,
    status: "completed",
    date: "30 Jan 2026",
  },
  {
    id: "CONV-1002",
    orderId: "ORD-1018",
    product: "Running Sneakers",
    customer: "Karim Ahmed",
    commission: 200,
    status: "processing",
    date: "29 Jan 2026",
  },
];

function statusStyle(status: Conversion["status"]) {
  if (status === "completed")
    return "bg-green-100 text-green-600";

  if (status === "processing")
    return "bg-yellow-100 text-yellow-700";

  return "bg-red-100 text-red-600";
}

export default function AffiliateConversionsPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          Conversion Orders
        </h1>
        <p className="text-sm text-gray-500">
          Orders generated from your affiliate links.
        </p>
      </div>

      {/* Conversion list */}
      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="divide-y">
          {conversions.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold text-sm">
                  {item.product}
                </p>

                <p className="text-xs text-gray-500">
                  Customer: {item.customer}
                </p>

                <p className="text-xs text-gray-500">
                  Order: {item.orderId}
                </p>

                <p className="text-xs text-gray-500">
                  {item.date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold text-orange-600">
                  ৳{item.commission}
                </span>

                <span
                  className={`px-2 py-1 rounded text-xs capitalize ${statusStyle(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>

                <Link
                  href={`/account/orders/${item.orderId}`}
                  className="text-xs text-orange-600"
                >
                  View Order
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
