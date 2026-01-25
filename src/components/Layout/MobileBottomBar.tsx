"use client";

import Link from "next/link";
import { Home, LayoutGrid, ShoppingCart, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function MobileBottomBar() {
  const pathname = usePathname();

  const itemClass = (path: string) =>
    `flex flex-col items-center gap-1 transition ${
      pathname === path
        ? "text-pink-600 scale-105"
        : "text-gray-500 hover:text-pink-500"
    }`;

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[94%] -translate-x-1/2 rounded-full bg-white/95 backdrop-blur shadow-xl md:hidden border">
      <div className="flex items-center justify-around py-2 text-[11px] font-medium">

        <Link href="/" className={itemClass("/")}>
          <Home size={22} />
          Home
        </Link>

        <Link href="/category" className={itemClass("/category")}>
          <LayoutGrid size={22} />
          Category
        </Link>

        <Link href="/cart" className={`${itemClass("/cart")} relative`}>
          <ShoppingCart size={22} />
          <span className="absolute -top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink-600 text-[10px] text-white">
            2
          </span>
          Cart
        </Link>

        <Link href="/chat" className={itemClass("/chat")}>
          <MessageCircle size={22} />
          Chat
        </Link>

        <Link href="/profile" className={itemClass("/profile")}>
          <User size={22} />
          Profile
        </Link>

      </div>
    </nav>
  );
}
