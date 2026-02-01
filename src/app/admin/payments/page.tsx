"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type PaymentStatus = "pending" | "success" | "failed" | "refunded";

interface PaymentRow {
  _id: string;
  paymentId: string;
  orderNumber: string;
  customer: string;
  method: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

/* ---------------- DUMMY DATA ---------------- */
const payments: PaymentRow[] = [
  {
    _id: "p1",
    paymentId: "PAY-10001",
    orderNumber: "ORD-100245",
    customer: "Sabbir Hossain",
    method: "bKash",
    amount: 2590,
    status: "success",
    createdAt: "30 Jan 2026, 11:35 AM",
  },
  {
    _id: "p2",
    paymentId: "PAY-10002",
    orderNumber: "ORD-100244",
    customer: "Nusrat Jahan",
    method: "Cash on Delivery",
    amount: 1450,
    status: "pending",
    createdAt: "30 Jan 2026, 10:15 AM",
  },
  {
    _id: "p3",
    paymentId: "PAY-10003",
    orderNumber: "ORD-100243",
    customer: "Rafi Ahmed",
    method: "Nagad",
    amount: 3990,
    status: "failed",
    createdAt: "29 Jan 2026, 08:45 PM",
  },
];

/* ---------------- HELPERS ---------------- */
function StatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, string> = {
    success: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-700",
  };

  const Icon =
    status === "success"
      ? CheckCircle
      : status === "pending"
      ? Clock
      : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}
    >
      <Icon size={14} />
      {status}
    </span>
  );
}

/* ---------------- PAGE ---------------- */
export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | PaymentStatus>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return payments
      .filter((p) => (status ? p.status === status : true))
      .filter(
        (p) =>
          p.paymentId.toLowerCase().includes(s) ||
          p.orderNumber.toLowerCase().includes(s) ||
          p.customer.toLowerCase().includes(s)
      );
  }, [search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Payments</h1>
        <p className="text-sm text-gray-500">
          View and manage all payments
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600">Search</label>
          <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Payment ID, Order, Customer"
              className="w-full text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="px-4 py-3 font-semibold">{p.paymentId}</td>
                <td className="px-4 py-3">{p.orderNumber}</td>
                <td className="px-4 py-3">{p.customer}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3 font-semibold">৳ {p.amount}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/payments/${p._id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border rounded-md hover:bg-gray-50"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
