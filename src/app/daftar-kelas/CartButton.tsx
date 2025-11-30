"use client";

import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartButton({ count }: { count: number }) {
  return (
    <button
      id="cart-floating"
      className="cursor-pointer group relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5 hover:border-cyan-500/50 transition-all shadow-lg"
      title="Buka keranjang"
      type="button"
    >
      <ShoppingCart className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
      <span className="hidden sm:inline">Keranjang</span>
      
      <AnimatePresence mode="wait">
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-bold text-slate-950"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}