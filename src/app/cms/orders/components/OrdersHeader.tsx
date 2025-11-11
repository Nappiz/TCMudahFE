"use client";

import { Search } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function OrdersHeader({ search, onSearchChange }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-white font-semibold">Validasi Pembayaran</div>
          <div className="text-sm text-white/70">
            Approve/Reject/Expire bukti transfer peserta.
          </div>
        </div>
        <div className="relative w-72 max-w-[60vw]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari status/nama pengirim/catatan…"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
          />
        </div>
      </div>
    </div>
  );
}
