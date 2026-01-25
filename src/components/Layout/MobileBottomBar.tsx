"use client";

import Link from "next/link";
import { Home, LayoutGrid, ShoppingCart, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function MobileBottomBar() {
  const pathname = usePathname();

  const item = (path: string) =>
    `flex flex-col items-center text-[11px] font-semibold transition ${
      pathname === path ? "text-orange-500" : "text-gray-500 hover:text-orange-400"
    }`;

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[94%] -translate-x-1/2 rounded-full bg-white shadow-lg border md:hidden">
      <div className="flex justify-around py-2">

        <Link href="/" className={item("/")}>
          <Home size={22} />
          Home
        </Link>

        <Link href="/category" className={item("/category")}>
          <LayoutGrid size={22} />
          Category
        </Link>

        <Link href="/cart" className={`${item("/cart")} relative`}>
          <ShoppingCart size={22} />
          <span className="absolute -top-1 right-2 bg-orange-500 text-white text-[10px] px-1 rounded-full">
            2
          </span>
          Cart
        </Link>

        <Link href="/chat" className={item("/chat")}>
          <MessageCircle size={22} />
          Chat
        </Link>

        <Link href="/profile" className={item("/profile")}>
          <User size={22} />
          Profile
        </Link>

      </div>
    </nav>
  );
}
