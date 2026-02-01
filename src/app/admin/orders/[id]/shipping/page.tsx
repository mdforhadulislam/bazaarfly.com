"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  Truck,
  Save,
  ArrowLeft,
  MapPin,
} from "lucide-react";

type Courier = "Pathao" | "RedX" | "Steadfast" | "Paperfly" | "Other";
type ShippingStatus = "not_shipped" | "in_transit" | "delivered" | "returned";

export default function AdminOrderShippingPage() {
  const { id } = useParams();

  const [courier, setCourier] = useState<Courier>("Other");
  const [trackingId, setTrackingId] = useState("");
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus>("not_shipped");
  const [note, setNote] = useState("");

  const handleSave = async () => {
    // TODO: PATCH /api/v1/admin/orders/:id/shipping
    console.log({ id, courier, trackingId, shippingStatus, note });
    alert("Shipping updated (demo)");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/admin/orders/${id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600"
          >
            <ArrowLeft size={16} />
            Back to Order
          </Link>

          <h1 className="text-2xl font-semibold text-gray-800 mt-2">
            Shipping Update
          </h1>
          <p className="text-sm text-gray-500">
            Order ID: {String(id)}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-semibold">
          <Truck size={18} className="text-orange-600" />
          Shipping Details
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">Courier</label>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value as Courier)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="Pathao">Pathao</option>
              <option value="RedX">RedX</option>
              <option value="Steadfast">Steadfast</option>
              <option value="Paperfly">Paperfly</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Tracking ID</label>
            <input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. RX-123456"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Shipping Status</label>
            <select
              value={shippingStatus}
              onChange={(e) => setShippingStatus(e.target.value as ShippingStatus)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="not_shipped">Not Shipped</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Admin Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[110px]"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
        >
          <Save size={16} />
          Save Shipping
        </button>
      </div>

      {/* hint */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700 flex items-start gap-2">
        <MapPin size={18} className="mt-0.5" />
        Shipping update করলে customer notification/email পাঠানো recommend করা হয়।
      </div>
    </div>
  );
}
