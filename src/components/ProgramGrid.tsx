"use client";
import { useEffect, useMemo, useState } from "react";
import SectionHeader from "./SectionHeader";
import Card from "./ui/Card";

type Item = {
  id: string;
  code: string;
  name: string;
  sem: 1 | 2;
  blurb: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function ProgramGrid() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/curriculum`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(await safeText(res));
        const data = (await res.json()) as Item[];
        if (!cancel) setItems((data ?? []).slice(0).sort(sorter));
      } catch (e: any) {
        console.warn("ProgramGrid fetch error:", e?.message || e);
        if (!cancel) {
          setErr(e?.message ?? "Gagal memuat kurikulum.");
          setItems([]);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const list = useMemo(() => (items ?? []).slice(0).sort(sorter), [items]);

  return (
    <section id="program" className="relative py-16">
      
      <SectionHeader
        eyebrow="Kurikulum"
        title={
          <>
            Kurikulum TC Mudah <span className="text-white/60"></span>
          </>
        }
        description="Silabus disusun berdasarkan mata kuliah Teknik Informatika ITS. Setiap modul memiliki latihan, rangkuman, dan sesi pembahasan."
      />

      {err && <p className="mb-4 text-sm text-red-300">{err}</p>}

      {!items ? (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} fixedHeight={230} className="overflow-hidden">
              <div className="animate-pulse space-y-4">
                <div className="h-5 w-24 rounded bg-white/10" />
                <div className="h-6 w-3/4 rounded bg-white/10" />
                <div className="h-4 w-11/12 rounded bg-white/10" />
                <div className="h-4 w-2/3 rounded bg-white/10" />
                <div className="h-4 w-40 rounded bg-white/10" />
              </div>
            </Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mx-auto mt-4 max-w-3xl">
          <Card className="text-center py-12">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <svg width="22" height="22" viewBox="0 0 24 24" className="text-white/70">
                <path d="M12 8v4m0 4h.01M4 6h16l-1 12H5L4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h4 className="text-white font-semibold">Tidak ada data</h4>
            <p className="mt-1 text-sm text-white/70">
              Kurikulum belum ditambahkan. (Admin dapat mengelola melalui CMS &rarr; Kurikulum)
            </p>
          </Card>
        </div>
      ) : (
        // Grid data
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((x) => (
            <Card key={x.id} className="relative overflow-hidden" fixedHeight={230}>
              <div className="pointer-events-none absolute inset-0 rounded-2xl [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-gradient-to-b from-cyan-400/10 to-transparent" />
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center rounded-xl bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 border border-white/10">
                  Smt {x.sem}
                </span>
                <span className="text-[11px] text-white/50">{x.code}</span>
              </div>

              <h3 className="mt-3 text-base font-semibold text-white">{x.name}</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                {x.blurb}
              </p>

              <div className="mt-auto" />

              <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                <IconCheck /> Modul • Latihan • Rekaman
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function IconCheck() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function sorter(a: Item, b: Item) {
  if (a.sem !== b.sem) return a.sem - b.sem;
  return a.code.localeCompare(b.code);
}

async function safeText(res: Response) {
  try {
    const t = await res.text();
    return t || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}
