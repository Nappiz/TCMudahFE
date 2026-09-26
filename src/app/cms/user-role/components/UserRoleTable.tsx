import { LockKeyhole } from "lucide-react";
import type { Role, User } from "../../../../../lib/admin";
import { RoleDropdown, type RoleDropdownOption } from "./RoleDropdown";
import { RolePill } from "./RolePill";
import { labelRole } from "./roleLabel";

type Props = {
  me: User | null;
  canEdit: boolean;
  filtered: User[];
  pending: Record<string, Role>;
  saving: Record<string, boolean>;
  onChangeRole: (userId: string, role: Role) => void;
  onSaveRow: (user: User) => void;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export function UserRoleTable({
  me,
  canEdit,
  filtered,
  pending,
  saving,
  onChangeRole,
  onSaveRow,
  page,
  total,
  limit,
  onPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <section
      aria-label="Daftar akun pengguna"
      className="rounded-2xl border border-white/[0.08] bg-[#0d131c]/80 shadow-[0_20px_60px_rgba(0,0,0,0.16)]"
    >
      <div className="hidden grid-cols-[minmax(210px,1.25fr)_minmax(240px,1.35fr)_minmax(130px,0.75fr)_minmax(195px,1fr)_140px] items-center border-b border-white/[0.07] bg-white/[0.025] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35 xl:grid">
        <span>Pengguna</span>
        <span>Email</span>
        <span>Role saat ini</span>
        <span>Atur role</span>
        <span className="text-center">Aksi</span>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-14 text-center sm:py-16">
          <p className="text-sm font-medium text-white/75">
            Tidak ada akun yang cocok
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-white/40">
            Coba ubah kata pencarian atau pilih filter role yang lain.
          </p>
        </div>
      ) : (
        <div className="grid p-0 xl:grid-cols-[minmax(210px,1.25fr)_minmax(240px,1.35fr)_minmax(130px,0.75fr)_minmax(195px,1fr)_140px]">
          {filtered.map((row) => {
            const isSelf = row.id === me?.id;
            const viewerIsSuperadmin = me?.role === "superadmin";
            const targetIsSuperadmin = row.role === "superadmin";
            const cannotTouchSuperadmin =
              targetIsSuperadmin && !viewerIsSuperadmin;
            const lockReason = isSelf
              ? "Role akun sendiri tidak dapat diubah."
              : !canEdit
                ? "Akses akun Anda hanya untuk melihat."
                : cannotTouchSuperadmin
                  ? "Perubahan role ini hanya bisa dilakukan superadmin."
                  : null;
            const isRoleLocked = !!lockReason;
            const disabledSelect = isRoleLocked || !!saving[row.id];

            const baseAllowed: Role[] = viewerIsSuperadmin
              ? ["superadmin", "admin", "mentor", "peserta"]
              : ["admin", "mentor", "peserta"];
            const options: Role[] = baseAllowed.includes(row.role)
              ? baseAllowed
              : [row.role, ...baseAllowed];
            const roleOptions: RoleDropdownOption[] = options.map((option) => ({
              value: option,
              label: labelRole(option),
              disabled:
                isRoleLocked ||
                (option === "superadmin" && !viewerIsSuperadmin) ||
                (targetIsSuperadmin &&
                  !viewerIsSuperadmin &&
                  option !== row.role),
            }));

            const currentValue = pending[row.id] ?? row.role;
            const hasChange = currentValue !== row.role;
            const isSaving = !!saving[row.id];
            const canSave = !disabledSelect && hasChange && !isSaving;
            return (
              <div
                key={row.id}
                className="border-b border-white/[0.06] transition-colors last:border-b-0 hover:bg-white/[0.015] xl:contents"
              >
                <div className="flex min-w-0 items-center px-4 py-4 xl:border-b xl:border-white/[0.06]">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white/90">
                      {row.full_name}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/40 xl:hidden">
                      {row.email}
                    </p>
                  </div>
                </div>

                <div className="hidden min-w-0 truncate px-4 py-4 text-sm text-white/50 xl:flex xl:items-center xl:border-b xl:border-white/[0.06]">
                  {row.email}
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-2 xl:justify-start xl:border-b xl:border-white/[0.06] xl:py-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 xl:hidden">
                    Role saat ini
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <RolePill role={row.role} />
                    {lockReason ? (
                      <span
                        role="img"
                        aria-label={lockReason}
                        title={lockReason}
                        className="inline-flex text-white/35"
                      >
                        <LockKeyhole
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                          strokeWidth={1.8}
                        />
                      </span>
                    ) : null}
                  </span>
                </div>

                <div className="grid gap-1.5 border-t border-white/[0.04] px-4 py-3 sm:grid-cols-[110px_minmax(0,1fr)] sm:items-center xl:block xl:border-t-0 xl:border-b xl:border-white/[0.06] xl:px-4 xl:py-4">
                  <span
                    id={`user-role-label-${row.id}`}
                    className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 xl:sr-only"
                  >
                    Ubah role untuk {row.full_name}
                  </span>
                  <RoleDropdown
                    labelId={`user-role-label-${row.id}`}
                    value={currentValue}
                    onChange={(value) => onChangeRole(row.id, value as Role)}
                    options={roleOptions}
                    disabled={disabledSelect}
                  />
                </div>

                <div className="flex items-center justify-end border-t border-white/[0.04] px-4 py-3 xl:justify-center xl:border-t-0 xl:border-b xl:border-white/[0.06] xl:px-3 xl:py-4">
                  <button
                    type="button"
                    onClick={() => onSaveRow(row)}
                    disabled={!canSave}
                    aria-label={`Simpan role untuk ${row.full_name}`}
                    className={
                      "inline-flex h-10 min-w-[96px] cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/20 disabled:cursor-not-allowed " +
                      (canSave
                        ? "bg-cyan-300 text-slate-950 shadow-[0_6px_20px_rgba(103,232,249,0.12)] hover:bg-cyan-200"
                        : "border border-white/[0.07] bg-white/[0.035] text-white/35 disabled:opacity-75")
                    }
                  >
                    {isSaving ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/25 border-t-slate-950"
                        />
                        <span aria-live="polite">Menyimpan...</span>
                      </>
                    ) : (
                      "Simpan"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <footer className="flex flex-col gap-3 border-t border-white/[0.07] bg-white/[0.015] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-white/45">
          Menampilkan{" "}
          <span className="font-medium tabular-nums text-white/75">
            {total > 0 ? startIndex : 0}–{endIndex}
          </span>{" "}
          dari{" "}
          <span className="font-medium tabular-nums text-white/75">
            {total}
          </span>{" "}
          pengguna
        </p>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Halaman sebelumnya"
            className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs font-medium text-white/60 transition hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Sebelumnya
          </button>
          <span className="min-w-[104px] text-center text-xs tabular-nums text-white/45">
            Halaman <span className="text-white/75">{page}</span> dari{" "}
            {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Halaman berikutnya"
            className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs font-medium text-white/60 transition hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Berikutnya
          </button>
        </div>
      </footer>
    </section>
  );
}
