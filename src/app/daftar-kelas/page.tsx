"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { fetchCatalog } from "../../../lib/api";
import { rupiah } from "../../../lib/format";
import CartButton from "./CartButton";
import ClassCard from "./ClassCard";
import CartDrawer from "./CartDrawer";
import { useLocalCart } from "@/hooks/useLocalCart";
import { Catalog, Curriculum, Mentor, ClassItem } from "@/types/catalog";

export default function DaftarKelasPage() {
  const authChecked = useRequireAuth();

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!authChecked) return;
    let cancel = false;
    (async () => {
      try {
        const data = await fetchCatalog();
        if (!cancel) setCatalog(data);
      } catch (e: any) {
        if (!cancel) setErr(e?.message ?? "Gagal memuat katalog");
      }
    })();
    return () => {
      cancel = true;
    };
  }, [authChecked]);

  const { lines, totalCount, inc, dec, clear } = useLocalCart(catalog?.classes ?? null);

  const idxMentor = useMemo(() => {
    const m = new Map<string, Mentor>();
    catalog?.mentors.forEach((x) => m.set(x.id, x));
    return m;
  }, [catalog]);

  const idxCur = useMemo(() => {
    const m = new Map<string, Curriculum>();
    catalog?.curriculum.forEach((x) => m.set(x.id, x));
    return m;
  }, [catalog]);

  const filtered = useMemo(() => {
    if (!catalog) return [];
    const s = q.trim().toLowerCase();
    if (!s) return catalog.classes;
    return catalog.classes.filter((c: ClassItem) => {
      // cari di semua mentor_ids
      const mentorsTxt = (c.mentor_ids || [])
        .map((id) => idxMentor.get(id)?.name?.toLowerCase() ?? "")
        .join(" ");
      const curs = c.curriculum_ids
        .map((id) => {
          const cur = idxCur.get(id);
          return (cur?.name || cur?.code || "").toLowerCase();
        })
        .join(" ");
      return (
        c.title.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        mentorsTxt.includes(s) ||
        curs.includes(s)
      );
    });
  }, [catalog, q, idxMentor, idxCur]);

  const total = useMemo(() => {
    if (!catalog) return 0;
    const priceById = new Map(catalog.classes.map((k) => [k.id, k.price]));
    return lines.reduce((s, l) => s + (priceById.get(l.id) || 0) * l.qty, 0);
  }, [catalog, lines]);

  if (!authChecked) {
    return (
      <div className="min-h-[50vh] rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse text-white/70">
        Mengecek sesi…
      </div>
    );
  }

  return (
    <main className="min-h-screen py-20">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_460px_at_18%_-10%,rgba(34,211,238,0.10),transparent_60%),radial-gradient(820px_480px_at_85%_0%,rgba(99,102,241,0.10),transparent_60%)]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Daftar Kelas</h1>
            <p className="text-white/70 text-sm">Pilih kelas, masukkan ke keranjang, lalu lanjut ke proses checkout.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64 max-w-[60vw]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul / mentor / kurikulum…"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
              />
            </div>
            <CartButton count={totalCount} />
          </div>
        </div>

        {!catalog ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
            {err ? `Gagal memuat: ${err}` : "Memuat kelas…"}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">Tidak ada kelas.</div>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((k) => {
              const mentorObjs = (k.mentor_ids || []).map((id) => idxMentor.get(id)).filter(Boolean) as Mentor[];
              const combinedMentor: Mentor | undefined = mentorObjs.length
                ? {
                    id: mentorObjs.map((m) => m.id).join(","),
                    name: mentorObjs.map((m) => m.name).join(" & "),
                    angkatan: mentorObjs[0]?.angkatan ?? 0, 
                    visible: true,
                  }
                : undefined;

              return (
                <ClassCard
                  key={k.id}
                  item={k as any}                 
                  mentor={combinedMentor}
                  idxCur={idxCur}
                  qty={lines.find((l) => l.id === k.id)?.qty ?? 0}
                  onInc={inc}
                  onDec={dec}
                />
              );
            })}
          </div>
        )}

        <CartDrawer
          openButtonSelector="#cart-floating"
          lines={lines}
          classes={catalog?.classes ?? []}
          onInc={inc}
          onDec={dec}
          onClear={clear}
          total={total}
        />
      </div>
    </main>
  );
}
