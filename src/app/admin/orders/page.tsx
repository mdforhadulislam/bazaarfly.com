"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Truck,
  CheckCircle2,
  Clock3,
  Package,
} from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

type OrderRow = {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  itemsCount: number;
  totalAmount: number;
  paymentStatus: "paid" | "unpaid";
  status: OrderStatus;
  createdAt: string;
};

const dummyOrders: OrderRow[] = [
  {
    _id: "o1",
    orderNumber: "ORD-100245",
    customerName: "Sabbir Hossain",
    customerPhone: "01700000001",
    itemsCount: 3,
    totalAmount: 2590,
    paymentStatus: "paid",
    status: "processing",
    createdAt: "Today, 11:30 AM",
  },
  {
    _id: "o2",
    orderNumber: "ORD-100244",
    customerName: "Nusrat Jahan",
    customerPhone: "01700000002",
    itemsCount: 1,
    totalAmount: 1450,
    paymentStatus: "unpaid",
    status: "pending",
    createdAt: "Today, 10:05 AM",
  },
  {
    _id: "o3",
    orderNumber: "ORD-100243",
    customerName: "Rafi Ahmed",
    customerPhone: "01700000003",
    itemsCount: 2,
    totalAmount: 3990,
    paymentStatus: "paid",
    status: "shipped",
    createdAt: "Yesterday, 08:40 PM",
  },
  {
    _id: "o4",
    orderNumber: "ORD-100242",
    customerName: "Tanvir Araf",
    customerPhone: "01700000004",
    itemsCount: 1,
    totalAmount: 990,
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "Yesterday, 06:12 PM",
  },
  {
    _id: "o5",
    orderNumber: "ORD-100241",
    customerName: "Mehedi Hasan",
    customerPhone: "01700000005",
    itemsCount: 5,
    totalAmount: 7990,
    paymentStatus: "unpaid",
    status: "cancelled",
    createdAt: "Jan 28, 2026",
  },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-orange-100 text-orange-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const iconMap: Record<OrderStatus, any> = {
    pending: Clock3,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle2,
    cancelled: Trash2,
  };

  const Icon = iconMap[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      <Icon size={14} />
      {status}
    </span>
  );
}

function PayBadge({ status }: { status: "paid" | "unpaid" }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        status === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [paymentStatus, setPaymentStatus] = useState<"" | "paid" | "unpaid">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const orders = dummyOrders;

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return orders
      .filter((o) => (status ? o.status === status : true))
      .filter((o) => (paymentStatus ? o.paymentStatus === paymentStatus : true))
      .filter((o) => {
        if (!s) return true;
        return (
          o.orderNumber.toLowerCase().includes(s) ||
          o.customerName.toLowerCase().includes(s) ||
          o.customerPhone.toLowerCase().includes(s)
        );
      });
  }, [orders, search, status, paymentStatus]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  const deleteOrder = (id: string) => {
    const ok = confirm("Delete this order? (placeholder)");
    if (!ok) return;
    alert(`Delete order: ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500">Manage all customer orders</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md text-sm font-semibold border hover:bg-gray-50 transition">
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <label className="text-xs font-semibold text-gray-600">Search</label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2 bg-white">
              <Search size={18} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by order number, name, phone..."
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-600">Status</label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setPage(1);
                }}
                className="w-full outline-none text-sm bg-transparent"
              >
                <option value="">All</option>
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-600">Payment</label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
              <select
                value={paymentStatus}
                onChange={(e) => {
                  setPaymentStatus(e.target.value as any);
                  setPage(1);
                }}
                className="w-full outline-none text-sm bg-transparent"
              >
                <option value="">All</option>
                <option value="paid">paid</option>
                <option value="unpaid">unpaid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-gray-500">
            Showing <span className="font-semibold">{paged.length}</span> of{" "}
            <span className="font-semibold">{total}</span> orders
          </div>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-md px-3 py-2 text-sm outline-none bg-white"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paged.map((o) => (
                <tr key={o._id} className="border-t">
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    <Link href={`/admin/orders/${o._id}`} className="hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-800">{o.customerName}</p>
                    <p className="text-xs text-gray-500">{o.customerPhone}</p>
                  </td>

                  <td className="py-3 px-4 text-gray-700">{o.itemsCount}</td>

                  <td className="py-3 px-4 font-semibold">
                    ৳ {o.totalAmount.toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <PayBadge status={o.paymentStatus} />
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={o.status} />
                  </td>

                  <td className="py-3 px-4 text-gray-500">{o.createdAt}</td>

                  <td className="py-3 px-4">
                    <div className="flex justify-end items-center gap-2">
                      <Link
                        href={`/admin/orders/${o._id}`}
                        className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                      >
                        <Eye size={14} />
                        View
                      </Link>

                      <Link
                        href={`/admin/orders/${o._id}/shipping`}
                        className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                      >
                        <Pencil size={14} />
                        Shipping
                      </Link>

                      <button
                        onClick={() => deleteOrder(o._id)}
                        className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 inline-flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border-t bg-white">
          <p className="text-xs text-gray-500">
            Page <span className="font-semibold">{safePage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className={`px-3 py-2 rounded-md border text-sm font-semibold inline-flex items-center gap-2 ${
                safePage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className={`px-3 py-2 rounded-md border text-sm font-semibold inline-flex items-center gap-2 ${
                safePage >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
