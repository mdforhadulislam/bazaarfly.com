"use client";

import Link from "next/link";
import { Home, LayoutGrid, ShoppingCart, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MobileBottomBar() {
  const path = usePathname();

  const item = (p: string) =>
    cn(
      "flex flex-col items-center gap-1 text-[11px] font-medium transition",
      path === p ? "text-orange-500" : "text-muted-foreground hover:text-orange-400"
    );

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[94%] -translate-x-1/2 rounded-full border border-orange-500 bg-white/90 backdrop-blur shadow-xl md:hidden">
      <div className="flex justify-around py-2 pt-3">

        <Link href="/" className={item("/")}>
          <Home size={20}/> Home
        </Link>

        <Link href="/category" className={item("/category")}>
          <LayoutGrid size={20}/> Category
        </Link>

        <Link href="/cart" className={item("/cart")}>
          <ShoppingCart size={20}/> Cart
        </Link>

        <Link href="/chat" className={item("/chat")}>
          <MessageCircle size={20}/> Chat
        </Link>

        <Link href="/profile" className={item("/profile")}>
          <User size={20}/> Profile
        </Link>

      </div>
    </nav>
  );
}
