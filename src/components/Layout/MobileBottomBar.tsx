"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutGrid,
  MessageCircle,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileBottomBar() {
  const path = usePathname();
  const { totalQty } = useCart();
  const { isAuthenticated } = useAuth();

  const item = (p: string) =>
    cn(
      "flex flex-col items-center gap-1 text-[11px] font-medium transition",
      path === p
        ? "text-orange-500"
        : "text-muted-foreground hover:text-orange-400",
    );

  const accountPath = isAuthenticated ? "/profile" : "/auth/signin";

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[94%] -translate-x-1/2 rounded-full border border-orange-500 bg-white/90 backdrop-blur shadow-xl md:hidden">
      <div className="flex justify-around py-2 pt-3">
        <Link href="/" className={item("/")}>
          <Home size={20} /> Home
        </Link>

        <Link href="/category" className={item("/category")}>
          <LayoutGrid size={20} /> Category
        </Link>

        <Link href="/cart" className={cn(item("/cart"), "relative")}>
          <ShoppingCart size={20} /> Cart
          {totalQty > 0 && (
            <span className="absolute -top-1 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[11px] flex items-center justify-center">
              {totalQty}
            </span>
          )}
        </Link>

        <Link href="/chat" className={item("/chat")}>
          <MessageCircle size={20} /> Chat
        </Link>

        <Link href={accountPath} className={item(accountPath)}>
          <User size={20} /> Account
        </Link>
      </div>
    </nav>
  );
}
