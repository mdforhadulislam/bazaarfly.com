"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";

export default function NavBar() {
  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          BazaarFly
        </Link>

        <div className="relative w-[460px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-full border bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div className="flex items-center gap-6">
          <Link href="/cart" className="hover:text-pink-600">
            <ShoppingCart />
          </Link>
          <Link href="/profile" className="hover:text-pink-600">
            <User />
          </Link>
        </div>

      </div>
    </header>
  );
}
