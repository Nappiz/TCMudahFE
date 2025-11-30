"use client";

import type { CMSStats } from "@/hooks/useCMSOverview";
import type { Me } from "@/types/catalog";
import { GlassCard, StatRow } from "./overview-ui";
import { CheckCircle2, XCircle, Clock, Archive } from "lucide-react";

export default function OverviewNavigationAndStatus({
  me,
  stats,
}: {
  me: Me | null;
  stats: CMSStats;
}) {
  return (
    <div className="space-y-6">
      <GlassCard title="Statistik Order">
         <div className="space-y-1">
            <StatRow 
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} 
                label="Approved" 
                value={stats.approvedOrders} 
            />
            <StatRow 
                icon={<Clock className="w-4 h-4 text-amber-400" />} 
                label="Pending" 
                value={stats.pendingOrders} 
            />
            <StatRow 
                icon={<XCircle className="w-4 h-4 text-rose-400" />} 
                label="Rejected" 
                value={stats.rejectedOrders} 
            />
            <StatRow 
                icon={<Archive className="w-4 h-4 text-slate-400" />} 
                label="Expired" 
                value={stats.expiredOrders} 
            />
         </div>
      </GlassCard>

      <div className="rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 p-5 text-white shadow-xl relative overflow-hidden group">
         <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
         <h4 className="text-lg font-bold mb-2 relative z-10">Halo Admin!</h4>
         <p className="text-sm text-white/80 mb-4 relative z-10">
            Jangan lupa cek order yang pending ya. Semakin cepat di-approve, semakin senang user kita!
         </p>
         <div className="text-xs font-mono bg-black/20 inline-block px-2 py-1 rounded">
            Approval Rate: {stats.approvalRate}%
         </div>
      </div>
    </div>
  );
}