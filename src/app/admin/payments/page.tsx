"use client";

import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Image as ImageIcon,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
  paymentSS?: string; // ✅ added
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
    paymentSS: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
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
    paymentSS: "", // no ss
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
    paymentSS: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
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

function ScreenshotBadge({ paymentSS }: { paymentSS?: string }) {
  const hasSS = Boolean(paymentSS && paymentSS.trim().length > 0);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        hasSS ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
      }`}
      title={hasSS ? "Screenshot available" : "No screenshot"}
    >
      <ImageIcon size={14} />
      {hasSS ? "SS" : "No SS"}
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
    const s = search.trim().toLowerCase();

    return payments
      .filter((p) => (status ? p.status === status : true))
      .filter((p) => {
        if (!s) return true;
        return (
          p.paymentId.toLowerCase().includes(s) ||
          p.orderNumber.toLowerCase().includes(s) ||
          p.customer.toLowerCase().includes(s) ||
          p.method.toLowerCase().includes(s)
        );
      });
  }, [search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * limit, safePage * limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Payments</h1>
        <p className="text-sm text-gray-500">View and manage all payments</p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600">Search</label>
          <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Payment ID, Order, Customer, Method"
              className="w-full text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "" | PaymentStatus);
              setPage(1);
            }}
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="flex items-end">
          <div className="text-xs text-gray-500">
            Showing <span className="font-semibold">{paged.length}</span> of{" "}
            <span className="font-semibold">{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SS</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {paged.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {p.paymentId}
                  </td>
                  <td className="px-4 py-3">{p.orderNumber}</td>
                  <td className="px-4 py-3">{p.customer}</td>
                  <td className="px-4 py-3">{p.method}</td>
                  <td className="px-4 py-3 font-semibold">
                    ৳ {p.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ScreenshotBadge paymentSS={p.paymentSS} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.createdAt}</td>
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

              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
                    No payments found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Page {safePage} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-2 border rounded-md text-sm disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
