"use client";

import Link from "next/link";

type Commission = {
  id: string;
  orderId: string;
  product: string;
  commission: number;
  status: "pending" | "approved" | "paid";
  date: string;
};

const commissions: Commission[] = [
  {
    id: "COM-1001",
    orderId: "ORD-1023",
    product: "Men Casual Shirt",
    commission: 120,
    status: "approved",
    date: "30 Jan 2026",
  },
  {
    id: "COM-1002",
    orderId: "ORD-1018",
    product: "Running Sneakers",
    commission: 200,
    status: "pending",
    date: "28 Jan 2026",
  },
  {
    id: "COM-1003",
    orderId: "ORD-1010",
    product: "Smart Watch",
    commission: 350,
    status: "paid",
    date: "25 Jan 2026",
  },
];

function statusStyle(status: Commission["status"]) {
  if (status === "approved")
    return "bg-blue-100 text-blue-600";

  if (status === "paid")
    return "bg-green-100 text-green-600";

  return "bg-yellow-100 text-yellow-700";
}

export default function AffiliateCommissionsPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          Commission History
        </h1>
        <p className="text-sm text-gray-500">
          Track commissions earned from your referrals.
        </p>
      </div>

      {/* Commission List */}
      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="divide-y">
          {commissions.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold text-sm">
                  {item.product}
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
