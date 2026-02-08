"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartVariant = {
  size?: string;
  color?: {
    name: string;
    hex?: string;
    image?: string;
  };
};

export type CartItem = {
  key: string;

  productId: string;
  name: string;
  slug?: string;

  image?: string;

  unitPrice: number;
  qty: number;

  variant?: CartVariant;
  weight?: number;
};

type AddToCartProduct = {
  _id: string;
  name: string;
  slug?: string;

  basePrice: number;
  discountPrice?: number;

  images?: string[];
  colors?: { name: string; hex?: string; images: string[] }[];
  weight?: number;
};

type CartContextType = {
  items: CartItem[];
  totalQty: number;
  subTotal: number;

  addItem: (product: AddToCartProduct, variant?: CartVariant, qty?: number) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;

  hasItem: (key: string) => boolean;
  getItemQty: (key: string) => number;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "bazaarfly_cart_v2";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function computeFinalPrice(basePrice: number, discountPrice?: number) {
  if (
    typeof discountPrice === "number" &&
    discountPrice > 0 &&
    discountPrice < basePrice
  ) {
    return discountPrice;
  }
  return basePrice;
}

function makeCartKey(productId: string, variant?: CartVariant) {
  const sizeKey = variant?.size ? `size:${variant.size}` : "size:-";
  const colorKey = variant?.color?.name ? `color:${variant.color.name}` : "color:-";
  return `${productId}|${sizeKey}|${colorKey}`;
}

function pickImage(product: AddToCartProduct, variant?: CartVariant) {
  if (variant?.color?.image) return variant.color.image;

  const colorName = variant?.color?.name;
  if (colorName && product.colors?.length) {
    const found = product.colors.find((c) => c.name === colorName);
    const img = found?.images?.[0];
    if (img) return img;
  }

  return product.images?.[0];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // ✅ Lazy init (no setState in effect)
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return safeParse<CartItem[]>(localStorage.getItem(STORAGE_KEY), []);
  });

  // ✅ Persist to storage (this effect is fine)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = useCallback<CartContextType["addItem"]>(
    (product, variant, qty = 1) => {
      const safeQty = Math.max(1, qty);

      const key = makeCartKey(product._id, variant);
      const unitPrice = computeFinalPrice(product.basePrice, product.discountPrice);
      const image = pickImage(product, variant);

      setItems((prev) => {
        const idx = prev.findIndex((x) => x.key === key);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + safeQty };
          return copy;
        }

        const newItem: CartItem = {
          key,
          productId: product._id,
          name: product.name,
          slug: product.slug,
          image,
          unitPrice,
          qty: safeQty,
          variant,
          weight: product.weight,
        };

        return [...prev, newItem];
      });
    },
    []
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    const safeQty = Math.max(0, qty);
    setItems((prev) =>
      prev
        .map((x) => (x.key === key ? { ...x, qty: safeQty } : x))
        .filter((x) => x.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalQty = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);
  const subTotal = useMemo(
    () => items.reduce((a, b) => a + b.qty * b.unitPrice, 0),
    [items]
  );

  const hasItem = useCallback((key: string) => items.some((x) => x.key === key), [items]);
  const getItemQty = useCallback(
    (key: string) => items.find((x) => x.key === key)?.qty ?? 0,
    [items]
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      totalQty,
      subTotal,
      addItem,
      removeItem,
      updateQty,
      clear,
      hasItem,
      getItemQty,
    }),
    [items, totalQty, subTotal, addItem, removeItem, updateQty, clear, hasItem, getItemQty]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider />");
  return ctx;
}
