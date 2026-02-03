"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Eye,
  X,
  CalendarClock,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type PopupType = "banner" | "modal" | "toast";
type PopupStatus = "draft" | "scheduled" | "active" | "paused";
type TargetAudience = "all" | "customers" | "sellers" | "affiliates";
type PageTarget = "all_pages" | "home" | "product" | "category" | "checkout";

function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-3">
      <div className="w-full max-w-3xl bg-white rounded-2xl border shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border hover:bg-gray-50 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function NewPopupPage() {
  const [previewOpen, setPreviewOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "modal" as PopupType,
    status: "draft" as PopupStatus,

    audience: "all" as TargetAudience,
    pageTarget: "home" as PageTarget,

    title: "",
    message: "",

    buttonText: "",
    buttonUrl: "",

    startAt: "",
    endAt: "",

    showOncePerUser: true,
    enabled: true,
  });

  const canSave = useMemo(
    () => form.name.trim() && form.title.trim() && form.message.trim(),
    [form.name, form.title, form.message]
  );

  const saveDummy = () => {
    if (!canSave) return;
    // Dummy save: replace with API later
    alert("Saved (dummy). Connect API to persist.");
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/popups"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} /> Back
          </Link>

          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-orange-50 border">
              <Sparkles className="text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Popup</h1>
              <p className="text-sm text-gray-600">
                Create a new popup (dummy form + live preview).
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <button
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <Eye size={16} /> Preview
          </button>

          <button
            onClick={saveDummy}
            disabled={!canSave}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              canSave
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      {/* Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* FORM */}
        <div className="bg-white border rounded-2xl p-5 space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name *">
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="e.g. Home Sale Popup"
              />
            </Field>

            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="modal">modal</option>
                <option value="banner">banner</option>
                <option value="toast">toast</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="draft">draft</option>
                <option value="scheduled">scheduled</option>
                <option value="active">active</option>
                <option value="paused">paused</option>
              </select>
            </Field>

            <Field label="Audience">
              <select
                value={form.audience}
                onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="all">all</option>
                <option value="customers">customers</option>
                <option value="sellers">sellers</option>
                <option value="affiliates">affiliates</option>
              </select>
            </Field>
          </div>

          <Field label="Target Page">
            <select
              value={form.pageTarget}
              onChange={(e) =>
                setForm((p) => ({ ...p, pageTarget: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="all_pages">all_pages</option>
              <option value="home">home</option>
              <option value="product">product</option>
              <option value="category">category</option>
              <option value="checkout">checkout</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Start At">
              <input
                value={form.startAt}
                onChange={(e) => setForm((p) => ({ ...p, startAt: e.target.value }))}
                placeholder="2026-02-05T08:00"
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </Field>

            <Field label="End At">
              <input
                value={form.endAt}
                onChange={(e) => setForm((p) => ({ ...p, endAt: e.target.value }))}
                placeholder="2026-02-12T23:59"
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Title *">
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Popup headline"
              />
            </Field>

            <Field label="Show once per user">
              <select
                value={form.showOncePerUser ? "yes" : "no"}
                onChange={(e) =>
                  setForm((p) => ({ ...p, showOncePerUser: e.target.value === "yes" }))
                }
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
          </div>

          <Field label="Message *">
            <textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="Popup message text..."
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Button Text">
              <input
                value={form.buttonText}
                onChange={(e) =>
                  setForm((p) => ({ ...p, buttonText: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="e.g. Shop Now"
              />
            </Field>

            <Field label="Button URL">
              <input
                value={form.buttonUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, buttonUrl: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="/category/fashion"
              />
            </Field>
          </div>

          <div className="p-4 rounded-2xl border bg-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Enabled</p>
              <p className="text-xs text-gray-600">Toggle popup visibility (dummy)</p>
            </div>

            <button
              onClick={() => setForm((p) => ({ ...p, enabled: !p.enabled }))}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-white transition"
            >
              {form.enabled ? (
                <>
                  <ToggleRight size={18} className="text-green-600" /> Enabled
                </>
              ) : (
                <>
                  <ToggleLeft size={18} className="text-gray-500" /> Disabled
                </>
              )}
            </button>
          </div>
        </div>

        {/* LIVE PREVIEW CARD */}
        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Live Preview</p>
            <p className="text-xs text-gray-500">
              This is a simple preview card (not real popup).
            </p>
          </div>

          <div className="p-4 rounded-2xl border bg-gray-50 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs text-gray-600">
              <CalendarClock size={16} className="text-gray-400" />
              {form.startAt || "Start not set"} → {form.endAt || "End not set"}
            </div>

            <p className="text-sm font-semibold text-gray-900">
              {form.title || "Popup Title"}
            </p>

            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {form.message || "Popup message preview..."}
            </p>

            {form.buttonText ? (
              <div className="pt-1">
                <button className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold">
                  {form.buttonText}
                </button>
                <p className="text-[11px] text-gray-500 mt-2">
                  URL: {form.buttonUrl || "-"}
                </p>
              </div>
            ) : null}
          </div>

          <div className="p-4 rounded-2xl border">
            <p className="text-xs text-gray-500">Meta</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {form.type} • {form.status}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              audience: <span className="font-semibold">{form.audience}</span>
              <br />
              target: <span className="font-semibold">{form.pageTarget}</span>
              <br />
              once/user:{" "}
              <span className="font-semibold">
                {form.showOncePerUser ? "Yes" : "No"}
              </span>
              <br />
              enabled:{" "}
              <span className="font-semibold">{form.enabled ? "Yes" : "No"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal title="Popup Preview" open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border bg-gray-50">
            <p className="text-xs text-gray-500">Title</p>
            <p className="text-sm font-semibold text-gray-900">{form.title || "—"}</p>
          </div>

          <div className="p-4 rounded-2xl border">
            <p className="text-xs text-gray-500">Message</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {form.message || "—"}
            </p>
          </div>

          <div className="p-4 rounded-2xl border bg-gray-50">
            <p className="text-xs text-gray-500">Button</p>
            <p className="text-sm font-semibold text-gray-900">
              {form.buttonText || "—"}
            </p>
            <p className="text-xs text-gray-600">{form.buttonUrl || "—"}</p>
          </div>

          <div className="text-right">
            <button
              onClick={() => setPreviewOpen(false)}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
