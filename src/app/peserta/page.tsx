"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiMyEnrollments } from "../../../lib/api";

type HasAccessResp = { has_access: boolean };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function getHasAccess(): Promise<boolean> {
  const r = await fetch(`${API_BASE}/me/has-access`, { credentials: "include" });
  if (!r.ok) return false;
  const j = (await r.json()) as HasAccessResp;
  return !!j?.has_access;
}

export default function PesertaIndex() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "no-access" | "no-class">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1) Gate by approved access
      const allowed = await getHasAccess();
      if (!allowed) {
        if (!cancelled) setState("no-access");
        router.replace("/"); // tendang balik ke landing
        return;
      }

      // 2) Redirect ke kelas aktif pertama (kalau ada)
      try {
        const e = await apiMyEnrollments();
        const first = e.find((x) => x.active);
        if (first) {
          router.replace(`/peserta/kelas/${first.class_id}`);
        } else {
          if (!cancelled) setState("no-class");
        }
      } catch {
        // kalau gagal ambil enrollments, tetap tampilkan info
        if (!cancelled) setState("no-class");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "loading") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
        Memuat…
      </div>
    );
  }

  if (state === "no-class") {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-white/80">
        Kamu sudah <span className="font-semibold">diterima</span>, tetapi belum ada kelas aktif.
        Silakan hubungi admin/mentor untuk mengaktifkan kelasmu.
      </div>
    );
  }

  // no-access: sebenarnya sudah di-redirect ke "/", UI ini hanya fallback sekejap
  return null;
}
