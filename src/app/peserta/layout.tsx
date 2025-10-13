"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiMyEnrollments, fetchCatalog } from "../../../lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Catalog } from "@/types/catalog";
import { BookOpen, MessageSquare } from "lucide-react";

export default function PesertaLayout({ children }: { children: React.ReactNode }) {
  const authChecked = useRequireAuth();
  const [enroll, setEnroll] = useState<{ class_id: string }[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      try {
        const [e, c] = await Promise.all([apiMyEnrollments(), fetchCatalog()]);
        setEnroll(e.filter((x) => x.active));
        setCatalog(c);
      } catch (e: any) {
        setErr(e?.message || "Gagal memuat data.");
      }
    })();
  }, [authChecked]);

  const classes = useMemo(() => {
    if (!catalog) return [];
    const idx = new Map(catalog.classes.map((c) => [c.id, c]));
    return enroll.map((e) => idx.get(e.class_id)).filter(Boolean);
  }, [catalog, enroll]);

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5 p-6">
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm font-semibold text-white">Kelas Saya</div>

          {classes.length === 0 ? (
            <div className="text-sm text-white/60">Belum ada kelas aktif.</div>
          ) : (
            <ul className="space-y-1">
              {classes.map((c: any) => {
                const href = `/peserta/kelas/${c.id}`;
                const active = isActive(href);
                return (
                  <li key={c.id}>
                    <Link
                      href={href}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors
                        ${active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span className="truncate">{c.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <div className="mb-2 text-sm font-semibold text-white">Lainnya</div>
          <ul className="space-y-1">
            <li>
              <Link
                href="/peserta/feedback"
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors
                  ${isActive("/peserta/feedback") ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
              >
                <MessageSquare className="h-4 w-4" />
                Kirim Feedback
              </Link>
            </li>
          </ul>

          {err && <div className="mt-3 text-xs text-rose-300">{err}</div>}
        </aside>

        <section>{children}</section>
      </div>
    </div>
  );
}
