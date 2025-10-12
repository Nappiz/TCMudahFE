"use client";
import { useEffect, useMemo, useState } from "react";
import { Shield, Save, Lock } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useModal } from "@/components/ui/useModal";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type User = { id: string; email: string; full_name: string; role: Role };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail ?? res.statusText;
    } catch {
      detail = res.statusText;
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

function labelRole(r: Role) {
  switch (r) {
    case "superadmin":
      return "Superadmin";
    case "admin":
      return "Admin";
    case "mentor":
      return "Mentor";
    default:
      return "Peserta";
  }
}

function RolePill({ role }: { role: Role }) {
  const colors: Record<Role, string> = {
    superadmin: "bg-pink-500/20 text-pink-300",
    admin: "bg-amber-500/20 text-amber-300",
    mentor: "bg-emerald-500/20 text-emerald-300",
    peserta: "bg-slate-500/20 text-slate-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colors[role]}`}>
      {labelRole(role)}
    </span>
  );
}

export default function UserRolePage() {
  const [me, setMe] = useState<User | null>(null);
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Record<string, Role>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // MODALS
  const successModal = useModal();
  const errorModal = useModal();
  const [successMsg, setSuccessMsg] = useState("Berhasil");
  const [errorMsg, setErrorMsg] = useState("Terjadi kesalahan");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setErr(null);
        const [meRes, list] = await Promise.all([api<User>("/me"), api<User[]>("/admin/users")]);
        if (cancel) return;
        const top = list.find((u) => u.id === meRes.id);
        const rest = list.filter((u) => u.id !== meRes.id);
        setMe(meRes);
        setRows(top ? [top, ...rest] : list);
      } catch (e: any) {
        setErr(e?.message || "Gagal memuat data");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const canEdit = useMemo(() => me && (me.role === "admin" || me.role === "superadmin"), [me]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u as any).nim?.toLowerCase?.().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [rows, search]);

  async function handleSave(user: User) {
    const newRole = (pending[user.id] ?? user.role) as Role;
    if (newRole === user.role) return;

    setSaving((s) => ({ ...s, [user.id]: true }));
    try {
      const updated = await api<User>(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      setRows((rs) => rs.map((r) => (r.id === user.id ? { ...r, role: updated.role } : r)));
      setPending((p) => {
        const { [user.id]: _, ...rest } = p;
        return rest;
      });
      setSuccessMsg(`Role ${user.full_name} diperbarui menjadi ${labelRole(updated.role)}.`);
      successModal.onOpen();
    } catch (e: any) {
      setErrorMsg(`Gagal menyimpan: ${e?.message || "Unknown error"}`);
      errorModal.onOpen();
    } finally {
      setSaving((s) => ({ ...s, [user.id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse text-white/70">
        Memuat data user…
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-red-300">
        Terjadi kesalahan: {err}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Kelola Role Pengguna</h2>
            <p className="text-sm text-white/60">Settings role tiap user</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-white/70">Role aktif:</div>
            {me && <RolePill role={me.role} />}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative w-full max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / email / NRP / role…"
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 pr-9 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">⌘K</span>
          </div>
        </div>
      </div>

      {/* Table */}
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

                const baseCanEdit = !!(me && (me.role === "admin" || me.role === "superadmin"));
                const cannotTouchSuperadmin = targetIsSuperadmin && !viewerIsSuperadmin;
                const disabledSelect = !baseCanEdit || isSelf || cannotTouchSuperadmin;

                const baseAllowed: Role[] = viewerIsSuperadmin
                  ? ["superadmin", "admin", "mentor", "peserta"]
                  : ["admin", "mentor", "peserta"];

                const options: Role[] = baseAllowed.includes(row.role) ? baseAllowed : [row.role, ...baseAllowed];
                const currentValue = (pending[row.id] ?? row.role) as Role;

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
                            disabledSelect ? "border-white/10 opacity-50 cursor-not-allowed" : "border-white/15 focus:border-white/30"
                          }`}
                          value={currentValue}
                          disabled={disabledSelect}
                          onChange={(e) => setPending((p) => ({ ...p, [row.id]: e.target.value as Role }))}
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
                              isSelf ||
                              !baseCanEdit ||
                              (opt === "superadmin" && !viewerIsSuperadmin) ||
                              (targetIsSuperadmin && !viewerIsSuperadmin && opt !== row.role);
                            return (
                              <option key={opt} value={opt} disabled={optionDisabled}>
                                {labelRole(opt)}
                              </option>
                            );
                          })}
                        </select>

                        {(isSelf || cannotTouchSuperadmin) && (
                          <span className="inline-flex items-center text-white/40" title="Terkunci">
                            <Lock className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSave(row)}
                        disabled={disabledSelect || saving[row.id] || (pending[row.id] ?? row.role) === row.role}
                        className={`cursor-pointer inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                          disabledSelect || saving[row.id] || (pending[row.id] ?? row.role) === row.role
                            ? "cursor-not-allowed bg-white/5 text-white/40"
                            : "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 hover:opacity-95"
                        }`}
                        title={disabledSelect ? "Tidak dapat menyimpan perubahan untuk baris ini" : "Simpan perubahan"}
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
      </div>

      <div className="flex items-center gap-2 text-xs text-white/50">
        <Shield className="h-3.5 w-3.5" />
        <span>Tip: gunakan kolom pencarian untuk menemukan user dengan cepat.</span>
      </div>

      <Modal
        open={successModal.open}
        onClose={successModal.onClose}
        title="Berhasil"
        variant="success"
        actions={[{ label: "Tutup", onClick: successModal.onClose, variant: "primary", autoFocus: true }]}
      >
        {successMsg}
      </Modal>

      <Modal
        open={errorModal.open}
        onClose={errorModal.onClose}
        title="Gagal"
        variant="error"
        actions={[{ label: "Tutup", onClick: errorModal.onClose, variant: "danger", autoFocus: true }]}
      >
        {errorMsg}
      </Modal>
    </div>
  );
}
