"use client";

import { Copy, Link2 } from "lucide-react";
import { useState } from "react";

type AffiliateLink = {
  id: string;
  product: string;
  link: string;
  clicks: number;
  conversions: number;
};

const links: AffiliateLink[] = [
  {
    id: "1",
    product: "Men Casual Shirt",
    link: "https://bazaarfly.com/p/men-shirt?ref=AFF123",
    clicks: 320,
    conversions: 25,
  },
  {
    id: "2",
    product: "Running Sneakers",
    link: "https://bazaarfly.com/p/sneakers?ref=AFF123",
    clicks: 210,
    conversions: 18,
  },
];

export default function AffiliateLinksPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          Affiliate Links
        </h1>
        <p className="text-sm text-gray-500">
          Share these links and earn commission on every order.
        </p>
      </div>

      {/* Generate Link */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-3">
          Generate New Link
        </h2>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            placeholder="Paste product URL here..."
            className="flex-1 border px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />

          <button className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm">
            Generate Link
          </button>
        </div>
      </div>

      {/* Link List */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="divide-y">
          {links.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50"
            >
              {/* Info */}
              <div>
                <p className="font-semibold text-sm">
                  {item.product}
                </p>

                <p className="text-xs text-gray-500 break-all mt-1">
                  {item.link}
                </p>

                <div className="flex gap-4 text-xs text-gray-500 mt-2">
                  <span>
                    Clicks: <strong>{item.clicks}</strong>
                  </span>
                  <span>
                    Conversions: <strong>{item.conversions}</strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => copyLink(item.id, item.link)}
                className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                <Link2 size={16} />
                {copiedId === item.id ? "Copied!" : "Copy Link"}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
