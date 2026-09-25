"use client";

import { useEffect, useMemo, useState } from "react";
import type { Cart, CartLine } from "@/types/catalog";

const LS_KEY = "tcmudah_cart_v2";

export function useLocalCart() {
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

  const lines: CartLine[] = useMemo(() => Object.values(cart), [cart]);

  const totalCount = lines.length;

  function addClass(classId: string, offerId: string) {
    const key = `class:${classId}`;
    setCart((cart) => ({
      ...cart,
      [key]: { key, itemType: "class", itemId: classId, offerId },
    }));
  }

  function addPackage(packageId: string) {
    const key = `package:${packageId}`;
    setCart((cart) => ({
      ...cart,
      [key]: { key, itemType: "package", itemId: packageId },
    }));
  }

  function remove(key: string) {
    setCart((cart) => {
      const next = { ...cart };
      delete next[key];
      return next;
    });
  }
  function clear() {
    setCart({});
  }

  return { cart, lines, totalCount, addClass, addPackage, remove, clear };
}
