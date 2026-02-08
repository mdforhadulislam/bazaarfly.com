"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  FileText,
} from "lucide-react";

const invoiceData = {
  invoiceNo: "INV-2026-00125",
  date: "30 Jan 2026",
  seller: {
    name: "Bazaarfly",
    address: "Dhaka, Bangladesh",
    phone: "+880 1XXXXXXXXX",
  },
  buyer: {
    name: "Sabbir Hossain",
    address: "House 12, Road 3, Mirpur, Dhaka",
    phone: "01700000001",
  },
  items: [
    { name: "Premium Cotton Shirt", qty: 2, price: 1290 },
    { name: "Leather Wallet", qty: 1, price: 390 },
  ],
  shipping: 390,
};

export default function AdminInvoicePage() {
  const { id } = useParams();

  const subtotal = invoiceData.items.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );
  const total = subtotal + invoiceData.shipping;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/orders/${id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600"
          >
            <ArrowLeft size={16} />
            Back to Order
          </Link>

          <h1 className="text-2xl font-semibold text-gray-800 mt-2">
            Invoice
          </h1>
          <p className="text-sm text-gray-500">
            Order ID: {String(id)}
          </p>
        </div>

       <button
  onClick={() => window.print()}
  className="px-3 py-2 rounded-md text-sm font-semibold border hover:bg-gray-50 transition inline-flex items-center gap-2"
>
          <Printer size={16} />
          Print
        </button>
      </div>

      {/* Invoice Card */}
      <div id="invoice-print" className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-semibold text-gray-800">
              <FileText size={18} />
              {invoiceData.seller.name}
            </div>
            <p className="text-sm text-gray-600 mt-1">{invoiceData.seller.address}</p>
            <p className="text-sm text-gray-600">{invoiceData.seller.phone}</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Invoice No</p>
            <p className="font-semibold">{invoiceData.invoiceNo}</p>
            <p className="text-sm text-gray-600 mt-2">Date</p>
            <p className="font-semibold">{invoiceData.date}</p>
          </div>
        </div>

        <hr className="my-5" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Bill To</p>
            <p className="font-semibold">{invoiceData.buyer.name}</p>
            <p className="text-sm text-gray-600">{invoiceData.buyer.address}</p>
            <p className="text-sm text-gray-600">{invoiceData.buyer.phone}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left">
                <th className="py-3 px-3">Item</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Price</th>
                <th className="py-3 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-3 px-3">{it.name}</td>
                  <td className="py-3 px-3 text-center">{it.qty}</td>
                  <td className="py-3 px-3 text-right">৳ {it.price}</td>
                  <td className="py-3 px-3 text-right">৳ {it.qty * it.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 max-w-sm ml-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">৳ {subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold">৳ {invoiceData.shipping}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total</span>
            <span>৳ {total}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          This is a system generated invoice.
        </p>
      </div>


      <style jsx global>{`
  @media print {
    /* Hide everything */
    body * {
      visibility: hidden !important;
    }

    /* Show only invoice */
    #invoice-print,
    #invoice-print * {
      visibility: visible !important;
    }

    /* Position invoice at top-left */
    #invoice-print {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      background: white !important;
    }

    /* Remove page header/footer (optional, depends browser) */
    @page {
      margin: 12mm;
    }
  }
`}</style>

    </div>
  );
}
