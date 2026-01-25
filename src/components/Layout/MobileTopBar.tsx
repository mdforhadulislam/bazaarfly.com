"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export default function MobileTopBar() {
  return (
    <div className="sticky top-0 z-50 md:hidden bg-gradient-to-r from-orange-500 to-orange-400 backdrop-blur shadow-md px-3 py-2">
      <div className="flex items-center gap-3">

        {/* LOGO */}
        <Link href="/" className="text-lg font-black text-white tracking-tight">
          BazaarFly
        </Link>

        {/* SEARCH */}
        <div className="flex flex-1 items-center rounded-full bg-white/95 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-orange-500">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="ml-2 w-full text-sm outline-none bg-transparent placeholder:text-gray-400"
          />
        </div>

      </div>
    </div>
  );
}
