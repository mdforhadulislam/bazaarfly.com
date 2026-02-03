"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Users,
  MousePointerClick,
  Globe,
  Smartphone,
  Laptop,
  Search,
  Calendar,
} from "lucide-react";

type Period = "7d" | "30d" | "90d";

type TrafficPoint = { label: string; sessions: number; users: number; pageviews: number };
type TopRow = { name: string; value: number };

const makeTraffic = (period: Period): TrafficPoint[] => {
  if (period === "7d") {
    return [
      { label: "Mon", sessions: 740, users: 520, pageviews: 2180 },
      { label: "Tue", sessions: 860, users: 590, pageviews: 2450 },
      { label: "Wed", sessions: 690, users: 480, pageviews: 2050 },
      { label: "Thu", sessions: 920, users: 640, pageviews: 2710 },
      { label: "Fri", sessions: 1030, users: 710, pageviews: 3150 },
      { label: "Sat", sessions: 880, users: 600, pageviews: 2620 },
      { label: "Sun", sessions: 800, users: 560, pageviews: 2330 },
    ];
  }
  if (period === "30d") {
    return Array.from({ length: 30 }).map((_, i) => ({
      label: `D${i + 1}`,
      sessions: 520 + ((i * 41) % 520),
      users: 360 + ((i * 31) % 410),
      pageviews: 1400 + ((i * 120) % 1600),
    }));
  }
  return Array.from({ length: 12 }).map((_, i) => ({
    label: `W${i + 1}`,
    sessions: 5200 + ((i * 430) % 2800),
    users: 3600 + ((i * 290) % 2200),
    pageviews: 14000 + ((i * 1100) % 9000),
  }));
};

const TOP_PAGES: TopRow[] = [
  { name: "/ (Home)", value: 6420 },
  { name: "/category/fashion", value: 3810 },
  { name: "/product/premium-cotton-shirt", value: 2760 },
  { name: "/category/electronics", value: 2190 },
  { name: "/checkout", value: 1520 },
];

const TOP_SOURCES: TopRow[] = [
  { name: "Facebook", value: 5120 },
  { name: "Google Search", value: 4310 },
  { name: "Direct", value: 2980 },
  { name: "Instagram", value: 1640 },
  { name: "Referral", value: 920 },
];

function MiniBar({ value, max }: { value: number; max: number }) {
  const w = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-orange-600" style={{ width: `${w}%` }} />
    </div>
  );
}

export default function TrafficAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const [q, setQ] = useState("");

  const data = useMemo(() => makeTraffic(period), [period]);

  const totals = useMemo(() => {
    const sessions = data.reduce((a, b) => a + b.sessions, 0);
    const users = data.reduce((a, b) => a + b.users, 0);
    const pageviews = data.reduce((a, b) => a + b.pageviews, 0);
    const pagesPerSession = sessions ? Number((pageviews / sessions).toFixed(2)) : 0;
    return { sessions, users, pageviews, pagesPerSession };
  }, [data]);

  const maxSessions = useMemo(() => Math.max(...data.map((d) => d.sessions)), [data]);

  const filteredPages = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return TOP_PAGES;
    return TOP_PAGES.filter((x) => x.name.toLowerCase().includes(s));
  }, [q]);

  const deviceSplit = { mobile: 62, desktop: 34, tablet: 4 };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} /> Back
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-900">Traffic Analytics</h1>
            <p className="text-sm text-gray-600">Sessions • Users • Pageviews • Sources</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white text-sm">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="outline-none bg-transparent font-semibold text-gray-800"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <Link
            href="/admin/analytics/order"
            className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
          >
            Go to Order Analytics
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Sessions</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{totals.sessions.toLocaleString()}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <MousePointerClick size={16} className="text-gray-400" />
            User visits
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Users</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{totals.users.toLocaleString()}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <Users size={16} className="text-gray-400" />
            Unique visitors
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Pageviews</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{totals.pageviews.toLocaleString()}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <Globe size={16} className="text-gray-400" />
            Total views
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Pages / Session</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{totals.pagesPerSession}</p>
          <div className="mt-3 text-xs text-gray-600">Avg engagement</div>
        </div>
      </div>

      {/* Trend + Device */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5 lg:col-span-2 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Sessions Trend</p>
            <p className="text-xs text-gray-500">Simple bars (dummy)</p>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {data.slice(-7).map((d) => (
              <div key={d.label} className="space-y-2">
                <div className="h-28 flex items-end">
                  <div
                    className="w-full bg-orange-600 rounded-t-lg"
                    style={{ height: `${Math.max(6, (d.sessions / maxSessions) * 100)}%` }}
                    title={`Sessions: ${d.sessions}`}
                  />
                </div>
                <p className="text-[11px] text-gray-600 text-center">{d.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Device Split</p>
            <p className="text-xs text-gray-500">Traffic by device</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-gray-800">
                <Smartphone size={16} className="text-gray-400" /> Mobile
              </span>
              <span className="font-semibold">{deviceSplit.mobile}%</span>
            </div>
            <MiniBar value={deviceSplit.mobile} max={100} />

            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-gray-800">
                <Laptop size={16} className="text-gray-400" /> Desktop
              </span>
              <span className="font-semibold">{deviceSplit.desktop}%</span>
            </div>
            <MiniBar value={deviceSplit.desktop} max={100} />

            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-gray-800">
                <Globe size={16} className="text-gray-400" /> Tablet/Other
              </span>
              <span className="font-semibold">{deviceSplit.tablet}%</span>
            </div>
            <MiniBar value={deviceSplit.tablet} max={100} />
          </div>
        </div>
      </div>

      {/* Top pages + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">Top Pages</p>
              <p className="text-xs text-gray-500">Most visited routes</p>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search page..."
                className="pl-9 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredPages.map((x) => (
              <div key={x.name} className="p-4 rounded-2xl border">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">{x.name}</p>
                  <p className="text-sm font-bold text-gray-900">{x.value.toLocaleString()}</p>
                </div>
                <div className="mt-2">
                  <MiniBar value={x.value} max={TOP_PAGES[0].value} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Traffic Sources</p>
            <p className="text-xs text-gray-500">Where visitors come from</p>
          </div>

          <div className="space-y-3">
            {TOP_SOURCES.map((x) => (
              <div key={x.name} className="p-4 rounded-2xl border">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">{x.name}</p>
                  <p className="text-sm font-bold text-gray-900">{x.value.toLocaleString()}</p>
                </div>
                <div className="mt-2">
                  <MiniBar value={x.value} max={TOP_SOURCES[0].value} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
