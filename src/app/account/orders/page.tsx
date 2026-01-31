"use client";

import Link from "next/link";
import Image from "next/image";

const orders = [
  {
    id: "ORD-1001",
    date: "30 Jan 2026",
    status: "processing",
    total: 2590,
    items: [
      {
        id: "1",
        productName: "Premium Cotton Shirt",
        image: "/sharee.png",
        price: 1290,
        quantity: 2,
      },
    ],
  },
  {
    id: "ORD-1002",
    date: "25 Jan 2026",
    status: "delivered",
    total: 1799,
    items: [
      {
        id: "2",
        productName: "Bowling Premium Slides",
        image: "/sharee.png",
        price: 1799,
        quantity: 1,
      },
    ],
  },
];

function statusStyle(status: string) {
  if (status === "delivered")
    return "bg-green-100 text-green-600";

  if (status === "processing")
    return "bg-yellow-100 text-yellow-700";

  return "bg-blue-100 text-blue-600";
}

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">My Orders</h1>

      <div className="flex flex-col gap-5">
        {orders.map((order) => {
          const itemCount = order.items.reduce(
            (sum, i) => sum + i.quantity,
            0
          );

          const firstItem = order.items[0];

          return (
            <div
              key={order.id}
              className="bg-white border rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

                {/* Product preview */}
                <div className="flex gap-4">
                  <Image
                    src={firstItem.image}
                    alt={firstItem.productName}
                    width={70}
                    height={70}
                    className="rounded-lg border object-cover"
                  />

                  <div>
                    <p className="font-semibold">
                      {firstItem.productName}
                    </p>

                    <p className="text-sm text-gray-500">
                      {itemCount} item(s)
                    </p>

                    <p className="text-sm text-gray-500">
                      Ordered on {order.date}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold capitalize w-fit ${statusStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>

                {/* Price + action */}
                <div className="flex flex-col md:items-end gap-2">
                  <p className="font-bold text-orange-600">
                    ৳{order.total}
                  </p>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-sm text-orange-600 font-medium"
                  >
                    View Details →
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
