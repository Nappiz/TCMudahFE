"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, CheckCircle2, Users, GraduationCap, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type User = { id: string; full_name: string; email: string; role: Role };
type ClassItem = { id: string; title: string };
type Order = {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected" | "expired";
};
type Enrollment = { id: string; user_id: string; class_id: string; active: boolean };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!r.ok) {
    let msg = r.statusText;
    try {
      const j = await r.json();
      if (j?.detail) msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(msg);
  }
  return r.json() as Promise<T>;
}

export default function EnrollmentsCMSPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [approvedUserIds, setApprovedUserIds] = useState<Set<string>>(new Set());

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string>(""); // user_id
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState<number>(0);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const [u, c, orders] = await Promise.all([
        api<User[]>("/admin/users"),
        api<ClassItem[]>("/admin/classes"),
        api<Order[]>("/admin/orders?status=approved"),
      ]);

      const approved = new Set(orders.map((o) => o.user_id));
      setApprovedUserIds(approved);

      const onlyApprovedParticipants = u.filter((x) => x.role === "peserta" && approved.has(x.id));
      setUsers(onlyApprovedParticipants);
      setClasses(c);

      if (!selected && onlyApprovedParticipants.length > 0) {
        setSelected(onlyApprovedParticipants[0].id);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Gagal memuat data");
      setUsers([]);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      try {
        const list = await api<Enrollment[]>(`/admin/enrollments?user_id=${encodeURIComponent(selected)}`);
        setEnrollments(list);
      } catch (e: any) {
        setErr(e?.message ?? "Gagal memuat enrollment");
        setEnrollments([]);
      }
    })();
  }, [selected, savedTick]);

  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
    );
  }, [users, q]);

  const activeClassIds = useMemo(() => {
    return new Set(enrollments.filter((e) => e.active).map((e) => e.class_id));
  }, [enrollments]);

  function toggleClass(cid: string) {
    const next = new Set(activeClassIds);
    if (next.has(cid)) next.delete(cid);
    else next.add(cid);
    const class_ids = Array.from(next);
    doSave(class_ids);
  }

  async function doSave(class_ids?: string[]) {
    if (!selected) return;
    const payload = { user_id: selected, class_ids: class_ids ?? Array.from(activeClassIds) };
    setSaving(true);
    try {
      await api<Enrollment[]>("/admin/enrollments/set", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSavedTick((t) => t + 1);
    } catch (e: any) {
      alert(e?.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  const selUser = users.find((u) => u.id === selected);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-white/60">Kelola akses kelas peserta</div>
            <h1 className="text-xl font-bold text-white">Enrollments</h1>
            <p className="text-white/70 text-sm">
              Daftar menampilkan peserta dengan order <b>approved</b>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={loadAll} className="inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Muat Ulang
            </Button>
          </div>
        </div>
        {err && <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{err}</div>}
      </div>

      <div className="grid gap-5 md:grid-cols-[340px_1fr]">
        {/* Sidebar: approved users */}
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
              <Users className="h-4 w-4" /> Peserta Approved
            </div>
          </div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama / email…"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
            />
          </div>

          <div className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/60">Memuat…</div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/60">Tidak ada peserta.</div>
            ) : (
              filteredUsers.map((u) => {
                const active = selected === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelected(u.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition
                    ${active ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"}`}
                  >
                    <div className="font-medium text-white">{u.full_name}</div>
                    <div className="text-xs text-white/60">{u.email}</div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
              <GraduationCap className="h-4 w-4" /> Kelas Aktif
            </div>
            <div className="text-xs text-white/60">
              {selUser ? (
                <>
                  Untuk: <span className="text-white">{selUser.full_name}</span>{" "}
                  <span className="text-white/50">({selUser.email})</span>
                </>
              ) : (
                "Pilih peserta di kiri"
              )}
            </div>
          </div>

          {!selUser ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/60">
              Pilih peserta terlebih dahulu.
            </div>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((c) => {
                  const checked = activeClassIds.has(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer
                      ${checked ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"}`}
                    >
                      <input
                        type="checkbox"
                        className="accent-emerald-400"
                        checked={checked}
                        onChange={() => toggleClass(c.id)}
                      />
                      <CheckCircle2 className="h-4 w-4" />
                      {c.title}
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => doSave()}
                  disabled={!selUser || saving}
                  className="inline-flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Menyimpan…" : "Simpan Perubahan"}
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
