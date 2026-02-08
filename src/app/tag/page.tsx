"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Hash, Search, TrendingUp, X } from "lucide-react";

type TagType = {
  _id: string;
  name: string;
  slug: string;
  count?: number;
  isTrending?: boolean;
};

const tags: TagType[] = [
  { _id: "1", name: "Fashion", slug: "fashion", count: 245, isTrending: true },
  { _id: "2", name: "Men", slug: "men", count: 130, isTrending: true },
  { _id: "3", name: "Women", slug: "women", count: 110 },
  { _id: "4", name: "Shoes", slug: "shoes", count: 88, isTrending: true },
  { _id: "5", name: "Bags", slug: "bags", count: 56 },
  { _id: "6", name: "Electronics", slug: "electronics", count: 150, isTrending: true },
  { _id: "7", name: "Watch", slug: "watch", count: 44 },
  { _id: "8", name: "Accessories", slug: "accessories", count: 73 },
  { _id: "9", name: "Kids", slug: "kids", count: 52 },
  { _id: "10", name: "Sports", slug: "sports", count: 61 },
];

export default function TagPage() {
  const [search, setSearch] = useState("");

  const totalProducts = useMemo(
    () => tags.reduce((sum, t) => sum + (t.count || 0), 0),
    []
  );

  const trending = useMemo(
    () => tags.filter((t) => t.isTrending).slice(0, 8),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tags
      .filter((t) => t.name.toLowerCase().includes(q))
      .sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-10">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-white to-orange-50" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                <Hash size={14} /> Explore by Tag
              </p>
              <h1 className="mt-3 text-2xl md:text-3xl font-black text-gray-900">
                Browse Tags
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Find products faster using popular tags and topics.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                  {tags.length} tags
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                  {totalProducts.toLocaleString()} tagged products
                </span>
              </div>
            </div>

            {/* SEARCH */}
            <div className="w-full md:w-[420px]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tags... (e.g. fashion, shoes)"
                  className="w-full pl-10 pr-10 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Clear search"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Tip: Click any tag to view related products.
              </p>
            </div>
          </div>
        </div>

        {/* TRENDING */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-orange-600" />
              <h2 className="font-bold text-gray-900">Trending Tags</h2>
            </div>
            <Link
              href="/tag"
              className="text-sm font-semibold text-orange-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {trending.map((tag) => (
              <Link
                key={tag._id}
                href={`/tag/${tag.slug}`}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100 transition text-sm font-semibold"
              >
                <Hash size={16} />
                {tag.name}
                <span className="text-xs text-orange-700/70">
                  ({tag.count ?? 0})
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ALL TAGS */}
        <div>
          <div className="flex items-end justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900">All Tags</h2>
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold">{filtered.length}</span>{" "}
              tags
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border rounded-2xl p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
                <Hash className="text-orange-600" />
              </div>
              <p className="mt-4 font-bold text-gray-900">No tags found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try a different keyword.
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-5 px-5 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((tag) => (
                <Link
                  key={tag._id}
                  href={`/tag/${tag.slug}`}
                  className="group bg-white border rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <Hash size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition">
                          {tag.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tag.count ?? 0} products
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      #{tag.slug}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
