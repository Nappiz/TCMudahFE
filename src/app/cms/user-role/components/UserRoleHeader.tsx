"use client";

import { RoleDropdown } from "./RoleDropdown";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  total: number;
};

const fieldClassName =
  "mt-2 h-11 w-full rounded-xl border border-white/[0.09] bg-[#0a0f16]/75 px-3.5 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/[0.15] focus:border-cyan-300/45 focus:ring-4 focus:ring-cyan-300/[0.08]";
export function UserRoleHeader({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  total,
}: Props) {
  return (
    <section className="relative isolate z-20 rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#121b28] via-[#101721] to-[#0d131c] px-5 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.2)] sm:px-7 sm:py-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]"
      >
        <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-cyan-400/[0.07] blur-3xl" />
      </div>
      <div className="relative">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
            Administrasi · Akses
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[30px]">
            Pengguna &amp; akses
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            Atur peran dan hak akses akun dengan jelas dari satu tempat.
          </p>
        </div>

        <div className="mt-7 border-t border-white/[0.07] pt-5">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_210px] sm:items-end lg:grid-cols-[minmax(0,1fr)_210px_auto]">
            <label className="block min-w-0">
              <span
                id="user-role-search-label"
                className="text-xs font-medium text-white/55"
              >
                Cari nama atau email
              </span>
              <input
                id="user-role-search"
                type="search"
                autoComplete="off"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Contoh: nama pengguna"
                className={fieldClassName}
              />
            </label>

            <div className="block min-w-0">
              <span
                id="user-role-filter-label"
                className="text-xs font-medium text-white/55"
              >
                Filter role
              </span>
              <div className="mt-2">
                <RoleDropdown
                  labelId="user-role-filter-label"
                  value={roleFilter}
                  onChange={onRoleFilterChange}
                />
              </div>
            </div>

            <span
              aria-live="polite"
              className="inline-flex h-11 w-fit items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-xs font-medium tabular-nums text-white/65 sm:col-span-2 lg:col-span-1 lg:justify-self-end"
            >
              {total.toLocaleString("id-ID")} akun
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
