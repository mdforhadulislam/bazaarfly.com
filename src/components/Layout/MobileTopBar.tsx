"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export default function MobileTopBar() {
  return (
    <div className="sticky top-0 z-50 md:hidden bg-gradient-to-r from-pink-600 to-rose-500 px-3 py-2 shadow-md">
      <div className="flex items-center gap-2">

        {/* LOGO */}
        <Link href="/" className="text-lg font-extrabold text-white tracking-tight">
          BazaarFly
        </Link>

        {/* SEARCH BAR */}
        <div className="flex flex-1 items-center rounded-full bg-white/95 px-3 py-1.5 shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search for products..."
            className="ml-2 w-full text-sm outline-none bg-transparent placeholder:text-gray-400"
          />
        </div>

        {/* BUTTON */}
        <button className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-pink-600 shadow-sm active:scale-95">
          Go
        </button>
      </div>
    </div>
  );
}
