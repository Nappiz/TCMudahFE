"use client";

import { useMemo } from "react";
import type { AdminOrder } from "@/types/catalog";
import { GlassCard } from "./overview-ui";
import { PieChart, TrendingUp, Package, BookOpen } from "lucide-react";

export default function OverviewRevenueBreakdown({ orders }: { orders: AdminOrder[] | null }) {
  const { classRev, packageRev, totalRev } = useMemo(() => {
    if (!orders) return { classRev: 0, packageRev: 0, totalRev: 0 };
    
    let c = 0;
    let p = 0;
    
    orders.forEach(o => {
        if (o.status !== 'approved') return;
        (o.items || []).forEach((item: any) => {
             const rev = item.price * item.qty;
             if (item.item_type === 'package') p += rev;
             else c += rev;
        });
    });
    
    return { classRev: c, packageRev: p, totalRev: c + p };
  }, [orders]);

  const classPct = totalRev > 0 ? Math.round((classRev / totalRev) * 100) : 0;
  const packagePct = totalRev > 0 ? Math.round((packageRev / totalRev) * 100) : 0;

  return (
    <GlassCard 
        title="Distribusi Pendapatan" 
        right={<PieChart className="h-4 w-4 text-purple-400" />}
    >
        <div className="flex flex-col gap-4">
           {totalRev === 0 ? (
               <div className="text-sm text-slate-500 text-center py-4">Belum ada data pendapatan.</div>
           ) : (
               <>
                   {/* Baris Total */}
                   <div className="flex items-end justify-between mb-2">
                       <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Sales</p>
                           <h4 className="text-xl font-bold text-white">Rp {totalRev.toLocaleString('id-ID')}</h4>
                       </div>
                   </div>

                   {/* Progress Bar Gabungan */}
                   <div className="h-4 w-full flex rounded-full overflow-hidden bg-slate-800">
                       <div style={{ width: `${classPct}%` }} className="bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"></div>
                       <div style={{ width: `${packagePct}%` }} className="bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"></div>
                   </div>

                   {/* Legend */}
                   <div className="grid grid-cols-2 gap-4 mt-2">
                       <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                           <div className="flex items-center gap-2 text-cyan-400">
                               <BookOpen className="w-4 h-4" />
                               <span className="text-xs font-bold uppercase tracking-wider">Kelas</span>
                           </div>
                           <div className="text-lg font-bold text-white">{classPct}%</div>
                           <div className="text-xs text-slate-400">Rp {classRev.toLocaleString('id-ID')}</div>
                       </div>

                       <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                           <div className="flex items-center gap-2 text-purple-400">
                               <Package className="w-4 h-4" />
                               <span className="text-xs font-bold uppercase tracking-wider">Paket</span>
                           </div>
                           <div className="text-lg font-bold text-white">{packagePct}%</div>
                           <div className="text-xs text-slate-400">Rp {packageRev.toLocaleString('id-ID')}</div>
                       </div>
                   </div>
               </>
           )}
        </div>
    </GlassCard>
  );
}
