"use client";

import { Search } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
};

export function OrdersHeader({ search, onSearchChange, statusFilter, onStatusFilterChange }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Validasi Pembayaran</h2>
          <p className="text-sm text-white/70">
            Approve/Reject/Expire bukti transfer peserta.
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama pengirim…"
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 pr-9 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            ⌘K
          </span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="w-full sm:w-auto rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-white/25 h-[38px]"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>
    </div>
  );
}
