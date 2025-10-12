"use client";

import { useEffect, useMemo, useState } from "react";
import { Cart, CartLine, ClassItem } from "@/types/catalog";

const LS_KEY = "tcmudah_cart_v1";

export function useLocalCart(classes: ClassItem[] | null) {
  const [cart, setCart] = useState<Cart>({});

  // load from LS
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
  }, []);

  // persist to LS
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
  }, [cart]);

  const lines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ id, qty }))
        .filter((l) => l.qty > 0 && (classes?.some((k) => k.id === l.id) ?? false)),
    [cart, classes]
  );

  const totalCount = lines.reduce((s, l) => s + l.qty, 0);

  function inc(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }
  function dec(id: string) {
    setCart((c) => {
      const next = Math.max(0, (c[id] ?? 0) - 1);
      const cp = { ...c };
      if (next === 0) delete cp[id];
      else cp[id] = next;
      return cp;
    });
  }
  function clear() {
    setCart({});
  }

  return { cart, lines, totalCount, inc, dec, clear };
}
