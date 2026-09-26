"use client";

import { Search, SlidersHorizontal } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
};

export function OrdersHeader({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0c111a]/90 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-cyan-500/[0.07] blur-3xl" />

      <div className="relative p-5 sm:p-6">
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/75">
            Payments / Review
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
            Order review
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/50">
            Periksa pembayaran peserta dan pastikan akses kelas diberikan ke
            order yang tepat.
          </p>
        </div>
      </div>

      <div className="relative grid gap-3 border-t border-white/[0.06] bg-white/[0.018] p-4 sm:grid-cols-[minmax(0,1fr)_180px] sm:p-5">
        <label className="relative block">
          <span className="sr-only">Cari order</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
          />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari nama, email, atau ID order"
            className="h-10 w-full rounded-xl border border-white/[0.09] bg-[#080d14]/75 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/35 focus:bg-[#080d14] focus:ring-2 focus:ring-cyan-300/10"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Filter status</span>
          <SlidersHorizontal
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35"
          />
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            className="h-10 w-full appearance-none rounded-xl border border-white/[0.09] bg-[#080d14]/75 pl-10 pr-3 text-sm text-white outline-none transition focus:border-cyan-300/35 focus:bg-[#080d14] focus:ring-2 focus:ring-cyan-300/10"
          >
            <option value="">Semua status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
            <option value="expired">Kedaluwarsa</option>
          </select>
        </label>
      </div>
    </section>
  );
}
