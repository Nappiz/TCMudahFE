"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle2, Minus, Plus, Users2 } from "lucide-react";
import { rupiah } from "../../../lib/format"; 
import IconButton from "./IconButton";
import { ClassItem, Curriculum, Mentor } from "@/types/catalog";

export default function ClassCard({
  item,
  mentor,
  idxCur,
  qty,
  onInc,
  onDec,
}: {
  item: ClassItem;
  mentor?: Mentor;
  idxCur: Map<string, Curriculum>;
  qty: number;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
}) {
  return (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/[0.06]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-gradient-to-b from-cyan-400/10 to-transparent" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-white font-semibold leading-tight">{item.title}</h3>
          <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
            {rupiah(item.price)}
          </span>
        </div>
        <p className="mt-2 text-sm text-white/70">{item.description}</p>

        <div className="mt-3 grid gap-2">
          <div className="inline-flex items-center gap-2 text-xs text-white/70">
            <Users2 className="h-4 w-4" />
            <span>{mentor?.name}</span>
            <span className="text-white/40">•</span>
            <span>Angkatan {mentor?.angkatan}</span>
          </div>
          <div className="inline-flex flex-wrap gap-2">
            {item.curriculum_ids.map((id) => {
              const c = idxCur.get(id);
              if (!c) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/75"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Smt {c.sem} • {c.code}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {qty === 0 ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onInc(item.id)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-sm font-medium text-slate-900 hover:opacity-95"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" />
              Masukkan Keranjang
            </motion.button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
              <IconButton onClick={() => onDec(item.id)}>
                <Minus className="h-4 w-4" />
              </IconButton>
              <motion.span
                key={qty}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 450, damping: 16 }}
                className="min-w-[2ch] text-center text-white"
              >
                {qty}
              </motion.span>
              <IconButton onClick={() => onInc(item.id)}>
                <Plus className="h-4 w-4" />
              </IconButton>
            </div>
          )}

          <AnimatePresence>
            {qty > 0 && (
              <motion.span
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 6, opacity: 0 }}
                className="inline-flex items-center gap-1 text-xs text-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4" /> Di keranjang
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
