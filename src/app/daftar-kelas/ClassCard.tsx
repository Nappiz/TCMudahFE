"use client";

import { motion } from "framer-motion";
import { BookOpen, Minus, Plus, Sparkles, UserCircle2 } from "lucide-react";
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
  onAddToCartAnim, 
}: {
  item: ClassItem;
  mentor?: Mentor;
  idxCur: Map<string, Curriculum>;
  qty: number;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onAddToCartAnim?: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300
        ${qty > 0 
          ? "border-cyan-500/30 bg-slate-900/80 shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)]" 
          : "border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60"
        }
      `}
    >
      {qty > 0 && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />}

      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start gap-4 mb-4">
           <div>
              <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-200 transition-colors">
                {item.title}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                 <UserCircle2 className="h-4 w-4 text-slate-500" />
                 <span>{mentor?.name || "Tim TC Mudah"}</span>
              </div>
           </div>
           <div className="flex-shrink-0">
              <span className="inline-block rounded-lg bg-white/5 px-3 py-1.5 text-sm font-mono font-semibold text-cyan-400 border border-white/5">
                {rupiah(item.price)}
              </span>
           </div>
        </div>

        <p className="text-sm text-slate-400 line-clamp-2 mb-6 min-h-[40px]">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {item.curriculum_ids.slice(0, 3).map((id) => {
            const c = idxCur.get(id);
            if (!c) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.02] px-2 py-1 text-[10px] text-slate-300">
                <BookOpen className="h-3 w-3 opacity-50" />
                {c.code}
              </span>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/5">
          {qty === 0 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                onInc(item.id);
                if (onAddToCartAnim) onAddToCartAnim(e);
              }}
              className="cursor-pointer w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-cyan-50 transition-colors shadow-lg shadow-white/5"
            >
              <Sparkles className="h-4 w-4 text-cyan-600" />
              Ambil Kelas
            </motion.button>
          ) : (
            <div className="flex items-center justify-between bg-slate-950/50 rounded-xl p-1 border border-white/5">
               <IconButton onClick={() => onDec(item.id)}>
                 <Minus className="h-4 w-4" />
               </IconButton>
               <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Qty</span>
                  <span className="text-white font-mono font-bold">{qty}</span>
               </div>
               <IconButton 
                 onClick={(e) => {
                    onInc(item.id);
                 }}
                >
                 <Plus className="h-4 w-4" />
               </IconButton>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}