"use client";

import Link from "next/link";

type AffiliateOrder = {
  id: string;
  orderId: string;
  product: string;
  customer: string;
  total: number;
  commission: number;
  status: "processing" | "delivered" | "cancelled";
  date: string;
};

const orders: AffiliateOrder[] = [
  {
    id: "AFF-ORD-1",
    orderId: "ORD-1023",
    product: "Men Casual Shirt",
    customer: "Rahim Uddin",
    total: 2590,
    commission: 120,
    status: "delivered",
    date: "30 Jan 2026",
  },
  {
    id: "AFF-ORD-2",
    orderId: "ORD-1018",
    product: "Running Sneakers",
    customer: "Karim Ahmed",
    total: 3490,
    commission: 200,
    status: "processing",
    date: "29 Jan 2026",
  },
];

function statusStyle(status: AffiliateOrder["status"]) {
  if (status === "delivered")
    return "bg-green-100 text-green-600";

  if (status === "processing")
    return "bg-yellow-100 text-yellow-700";

  return "bg-red-100 text-red-600";
}

export default function AffiliateOrdersPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          Affiliate Orders
        </h1>
        <p className="text-sm text-gray-500">
          Orders placed through your affiliate links.
        </p>
      </div>

      {/* Orders List */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="divide-y">

          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold text-sm">
                  {order.product}
                </p>

                <p className="text-xs text-gray-500">
                  Customer: {order.customer}
                </p>

                <p className="text-xs text-gray-500">
                  Order: {order.orderId}
                </p>

                <p className="text-xs text-gray-500">
                  {order.date}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">

                <span className="text-sm">
                  Total:{" "}
                  <strong>৳{order.total}</strong>
                </span>

                <span className="font-semibold text-orange-600">
                  Commission: ৳{order.commission}
                </span>

                <span
                  className={`px-2 py-1 rounded text-xs capitalize ${statusStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>

                <Link
                  href={`/account/orders/${order.orderId}`}
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
