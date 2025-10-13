"use client";

import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

export default function CartButton({ count }: { count: number }) {
  return (
    <button
      id="cart-floating"
      className="cursor-pointer relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
      title="Buka keranjang"
      type="button"
    >
      <ShoppingCart className="h-4 w-4" />
      Keranjang
      <motion.span
        key={count}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="ml-1 rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[11px] text-cyan-300"
      >
        {count}
      </motion.span>
    </button>
  );
}
