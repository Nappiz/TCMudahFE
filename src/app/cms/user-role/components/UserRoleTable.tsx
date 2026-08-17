import { Save, Lock } from "lucide-react";
import type { Role, User } from "../../../../../lib/admin";
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
  onPageChange: (p: number) => void;
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
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full border-collapse bg-white/5 text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/70">
            <th className="px-4 py-3 text-left font-medium">Nama</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Role Saat Ini</th>
            <th className="px-4 py-3 text-left font-medium">Ubah Role</th>
            <th className="px-4 py-3 text-left font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-white/60">
                Tidak ada pengguna ditemukan
              </td>
            </tr>
          ) : (
            filtered.map((row) => {
              const isSelf = me && row.id === me.id;
              const targetIsSuperadmin = row.role === "superadmin";
              const viewerIsSuperadmin = me?.role === "superadmin";
              const viewerIsAdmin = me?.role === "admin";

              const baseCanEdit = canEdit;
              const cannotTouchSuperadmin = targetIsSuperadmin && !viewerIsSuperadmin;
              const disabledSelect = !baseCanEdit || !!isSelf || cannotTouchSuperadmin;

              const baseAllowed: Role[] = viewerIsSuperadmin
                ? ["superadmin", "admin", "mentor", "peserta"]
                : ["admin", "mentor", "peserta"];

              const options: Role[] = baseAllowed.includes(row.role)
                ? baseAllowed
                : [row.role, ...baseAllowed];

              const currentValue = (pending[row.id] ?? row.role) as Role;

              const canSave =
                !disabledSelect &&
                !saving[row.id] &&
                (pending[row.id] ?? row.role) !== row.role;

              return (
                <tr key={row.id} className="border-b border-white/10">
                  <td className="px-4 py-3 text-white">
                    <div className="font-medium">{row.full_name}</div>
                  </td>
                  <td className="px-4 py-3 text-white/80">{row.email}</td>
                  <td className="px-4 py-3">
                    <RolePill role={row.role} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        className={`cursor-pointer rounded-lg border bg-slate-900/60 px-2.5 py-1.5 text-white/90 outline-none transition ${
                          disabledSelect
                            ? "border-white/10 opacity-50 cursor-not-allowed"
                            : "border-white/15 focus:border-white/30"
                        }`}
                        value={currentValue}
                        disabled={disabledSelect}
                        onChange={(e) =>
                          onChangeRole(row.id, e.target.value as Role)
                        }
                        title={
                          isSelf
                            ? "Tidak bisa mengubah role diri sendiri"
                            : cannotTouchSuperadmin
                            ? "Hanya superadmin yang bisa mengubah superadmin"
                            : !baseCanEdit
                            ? "Role Anda read-only"
                            : ""
                        }
                      >
                        {options.map((opt) => {
                          const optionDisabled =
                            !!isSelf ||
                            !baseCanEdit ||
                            (opt === "superadmin" && !viewerIsSuperadmin) ||
                            (targetIsSuperadmin &&
                              !viewerIsSuperadmin &&
                              opt !== row.role);

                          return (
                            <option
                              key={opt}
                              value={opt}
                              disabled={optionDisabled}
                            >
                              {labelRole(opt)}
                            </option>
                          );
                        })}
                      </select>

                      {(isSelf || cannotTouchSuperadmin) && (
                        <span
                          className="inline-flex items-center text-white/40"
                          title="Terkunci"
                        >
                          <Lock className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSaveRow(row)}
                      disabled={!canSave}
                      className={`cursor-pointer inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                        !canSave
                          ? "cursor-not-allowed bg-white/5 text-white/40"
                          : "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 hover:opacity-95"
                      }`}
                      title={
                        !canSave
                          ? "Tidak dapat menyimpan perubahan untuk baris ini"
                          : "Simpan perubahan"
                      }
                    >
                      <Save className="h-4 w-4" />
                      Simpan
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination UI */}
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/50">
              Menampilkan <span className="font-medium text-white/80">{total > 0 ? startIndex : 0}</span> hingga <span className="font-medium text-white/80">{endIndex}</span> dari <span className="font-medium text-white/80">{total}</span> hasil
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-white/40 ring-1 ring-inset ring-white/10 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <span aria-hidden="true">&laquo; Prev</span>
              </button>
              
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-inset ring-white/10">
                Halaman {page} dari {totalPages}
              </span>

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-white/40 ring-1 ring-inset ring-white/10 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <span aria-hidden="true">Next &raquo;</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
