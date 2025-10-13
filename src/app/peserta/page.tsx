"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = "superadmin" | "admin" | "mentor" | "peserta";

type Me = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
};

type Enrollment = {
  id: string;
  user_id: string;
  class_id: string;
  active: boolean;
  created_at?: string;
};

type ClassItem = {
  id: string;
  title: string;
  description: string;
  visible: boolean;
  created_at?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

/* ---------- tiny fetch helpers ---------- */
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
  return (await r.json()) as T;
}
async function getMe(): Promise<Me> {
  return api<Me>("/me");
}
async function getHasAccess(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/me/has-access`, { credentials: "include" });
    if (!r.ok) return false;
    const j = (await r.json()) as { has_access?: boolean };
    return !!j?.has_access;
  } catch {
    return false;
  }
}
async function getMyEnrollments(): Promise<Enrollment[]> {
  return api<Enrollment[]>("/enrollments/me");
}
async function getAllClassesAdmin(): Promise<ClassItem[]> {
  // butuh role minimal mentor
  return api<ClassItem[]>("/admin/classes");
}

/* ---------- page ---------- */
export default function PesertaIndex() {
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // untuk staff (mentor ke atas)
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const isStaff = useMemo(() => me && me.role !== "peserta", [me]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const m = await getMe();
        if (cancelled) return;
        setMe(m);

        if (m.role === "peserta") {
          // hanya boleh masuk jika sudah approved (has-access)
          const allowed = await getHasAccess();
          if (cancelled) return;

          if (!allowed) {
            router.replace("/"); // tidak boleh masuk
            return;
          }

          // sudah approved -> arahkan ke kelas aktif pertama
          const enrolls = await getMyEnrollments();
          if (cancelled) return;

          const first = enrolls.find((e) => e.active);
          if (first) {
            router.replace(`/peserta/kelas/${first.class_id}`);
          } else {
            // approved tapi belum ada enrollment aktif (kasus edge)
            setErr("Kamu belum memiliki kelas aktif. Hubungi admin/mentor untuk di-assign.");
          }
          return;
        }

        // Staff (mentor/admin/superadmin) -> tampilkan semua kelas
        const cls = await getAllClassesAdmin();
        if (cancelled) return;
        setClasses(cls || []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Gagal memuat halaman peserta.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
        Memuat…
      </div>
    );
  }

  // Jika peserta dan sudah di-redirect, komponen akan unmount. Kalau tidak, tampilkan error edge-case:
  if (me?.role === "peserta") {
    return err ? (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
        {err}
      </div>
    ) : (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/60">
        Menyiapkan kelas aktif…
      </div>
    );
  }

  // Staff view (mentor/admin/superadmin):
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-white/60">Mode staf</div>
            <h1 className="text-xl font-bold text-white">
              {me?.full_name ?? "Staff"} <span className="text-white/60">— Semua Kelas</span>
            </h1>
            <p className="text-sm text-white/60">
              Kamu dapat membuka halaman peserta tiap kelas untuk melihat materi seperti peserta.
            </p>
          </div>
        </div>
        {err && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            {err}
          </div>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
          Belum ada kelas.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/peserta/kelas/${c.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.07]"
            >
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-white">{c.title}</h3>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs ${
                      c.visible
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        : "border border-amber-500/30 bg-amber-500/10 text-amber-200"
                    }`}
                  >
                    {c.visible ? "Ditampilkan" : "Disembunyikan"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-white/70">{c.description}</p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
                  Buka halaman peserta
                  <svg
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
