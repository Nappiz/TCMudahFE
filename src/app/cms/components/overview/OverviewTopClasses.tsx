"use client";

import { useMemo } from "react";
import type { AdminOrder, ClassItem } from "@/types/catalog"; // Sesuaikan import types
import { GlassCard, TopClassItem } from "./overview-ui";
import { Trophy } from "lucide-react";

export default function OverviewTopClasses({
  orders,
  classes,
}: {
  orders: AdminOrder[] | null;
  classes: ClassItem[] | null;
}) {
  const topClasses = useMemo(() => {
    if (!orders || !classes) return [];

    const salesMap: Record<string, { id: string; title: string; count: number; revenue: number }> = {};

    orders.forEach(o => {
        if (o.status !== 'approved') return;        
        (o.items || []).forEach((item: any) => {
            const cid = item.class_id;
            if (!salesMap[cid]) {
                const cls = classes.find(c => c.id === cid);
                salesMap[cid] = {
                    id: cid,
                    title: cls ? cls.title : "Unknown Class",
                    count: 0,
                    revenue: 0
                };
            }
            salesMap[cid].count += item.qty;
            salesMap[cid].revenue += (item.price * item.qty);
        });
    });

    return Object.values(salesMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5); 

  }, [orders, classes]);

  return (
    <GlassCard 
        title="Kelas Terlaris" 
        right={<Trophy className="h-4 w-4 text-yellow-500" />}
        noPadding
        className="h-full"
    >
        {topClasses.length === 0 ? (
            <div className="p-5 text-sm text-slate-500 text-center">Belum ada data penjualan.</div>
        ) : (
            <div className="flex flex-col">
                {topClasses.map((c, i) => (
                    <TopClassItem
                        key={c.id}
                        rank={i + 1}
                        title={c.title}
                        sales={c.count}
                        revenue={c.revenue}
                    />
                ))}
            </div>
        )}
    </GlassCard>
  );
}