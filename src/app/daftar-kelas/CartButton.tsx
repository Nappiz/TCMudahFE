"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

export default function CartButton({ count }: { count: number }) {
  return (
    <button
      id="cart-floating"
      type="button"
      aria-label={`Buka keranjang, ${count} item`}
      className="group inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-cyan-100/15 bg-cyan-100/[0.055] px-4 text-sm font-semibold text-cyan-50/90 transition hover:border-cyan-100/25 hover:bg-cyan-100/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/40 sm:w-auto"
      title="Buka keranjang"
    >
      <ShoppingCart
        aria-hidden="true"
        className="h-4 w-4 text-cyan-100/75"
        strokeWidth={1.8}
      />
      <span>Keranjang</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={count}
          initial={{ y: 4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -4, opacity: 0 }}
          className="inline-flex min-w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.07] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white/80"
          aria-live="polite"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
