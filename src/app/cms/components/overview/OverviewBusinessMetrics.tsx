"use client";

import { useMemo } from "react";
import type { AdminOrder } from "@/types/catalog";
import { GlassCard } from "./overview-ui";
import { TrendingUp, CheckCircle, ShoppingCart } from "lucide-react";

export default function OverviewBusinessMetrics({ orders }: { orders: AdminOrder[] | null }) {
  const { approvalRate, aov, totalApproved } = useMemo(() => {
    if (!orders || orders.length === 0) return { approvalRate: 0, aov: 0, totalApproved: 0 };
    
    const approved = orders.filter(o => o.status === 'approved');
    const rate = Math.round((approved.length / orders.length) * 100);
    const totalRev = approved.reduce((acc, o) => acc + o.total, 0);
    const avg = approved.length > 0 ? (totalRev / approved.length) : 0;
    
    return { approvalRate: rate, aov: avg, totalApproved: approved.length };
  }, [orders]);

  return (
    <GlassCard 
        title="Business Metrics" 
        right={<TrendingUp className="h-4 w-4 text-emerald-400" />}
    >
        <div className="flex flex-col gap-4">
           {totalApproved === 0 ? (
               <div className="text-sm text-slate-500 text-center py-4">Belum ada metrik.</div>
           ) : (
               <div className="flex gap-4">
                   <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                       <ShoppingCart className="w-5 h-5 text-emerald-400 mb-2 opacity-80" />
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg. Order Value</div>
                       <h4 className="text-lg font-bold text-white">Rp {aov.toLocaleString('id-ID')}</h4>
                   </div>
                   
                   <div className="flex-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                       <CheckCircle className="w-5 h-5 text-blue-400 mb-2 opacity-80" />
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Approval Rate</div>
                       <h4 className="text-xl font-bold text-white">{approvalRate}%</h4>
                   </div>
               </div>
           )}
        </div>
    </GlassCard>
  );
}
