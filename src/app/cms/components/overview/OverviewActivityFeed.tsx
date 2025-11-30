"use client";

import { useMemo } from "react";
import type { AdminOrder } from "@/types/catalog";
import { GlassCard, ActivityItem } from "./overview-ui";
import { ShoppingCart, CheckCircle, Clock } from "lucide-react";
import { parseDate } from "@/hooks/useCMSOverview";

type ActivityLog = {
  id: string;
  type: 'new_order' | 'order_approved';
  title: React.ReactNode;
  subtitle: string;
  time: Date;
  icon: React.ReactNode;
};

export default function OverviewActivityFeed({
  orders,
}: {
  orders: AdminOrder[] | null;
}) {
  const activities = useMemo(() => {
    if (!orders) return [];

    const list: ActivityLog[] = [];

    orders.slice(0, 20).forEach(o => { 
        const dateCreated = parseDate(o.created_at);
        if(!dateCreated) return;
        
        list.push({
            id: `new-${o.id}`,
            type: 'new_order',
            title: <span className="text-slate-200">Order Masuk <span className="font-mono text-xs text-slate-500">#{o.id.slice(0,4)}</span></span>,
            subtitle: `${o.user_name || 'User'} memesan ${o.items?.length || 0} kelas`,
            time: dateCreated,
            icon: <ShoppingCart className="h-4 w-4 text-blue-400" />
        });

        if (o.status === 'pending') {
        } else if (o.status === 'approved') {
             const approvedTime = new Date(dateCreated.getTime() + 1000 * 60 * 30);
             list.push({
                id: `app-${o.id}`,
                type: 'order_approved',
                title: <span className="text-emerald-400">Pembayaran Diterima</span>,
                subtitle: `Order #${o.id.slice(0,4)} telah disetujui`,
                time: approvedTime,
                icon: <CheckCircle className="h-4 w-4 text-emerald-400" />
            });
        }
    });

    return list.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);
  }, [orders]);

  const timeAgo = (date: Date) => {
    const diff = (new Date().getTime() - date.getTime()) / 1000;
    if(diff < 60) return "Baru saja";
    if(diff < 3600) return `${Math.floor(diff/60)}m lalu`;
    if(diff < 86400) return `${Math.floor(diff/3600)}j lalu`;
    return `${Math.floor(diff/86400)}h lalu`;
  };

  return (
    <GlassCard title="Live Activity" noPadding className="h-full">
        {activities.length === 0 ? (
            <div className="p-5 text-sm text-slate-500 text-center">Belum ada aktivitas.</div>
        ) : (
            <div className="flex flex-col">
                {activities.map(act => (
                    <ActivityItem 
                        key={act.id}
                        icon={act.icon}
                        title={act.title}
                        subtitle={act.subtitle}
                        time={timeAgo(act.time)}
                    />
                ))}
            </div>
        )}
    </GlassCard>
  );
}