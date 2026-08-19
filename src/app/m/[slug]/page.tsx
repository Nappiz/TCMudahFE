import { redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function resolveShortlink(slug: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/shortlinks/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return data.url || null;
  } catch {
    return null;
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = await resolveShortlink(slug);

  if (!target) {
    // Beautiful fallback UI for shortlink not found
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E14] p-4 relative overflow-hidden">
        {/* Decorative glowing orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2.5" className="text-rose-500"></line>
              <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" className="text-white/20"></line>
            </svg>
          </div>
          
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-white">
            Tautan Tidak Ditemukan
          </h1>
          
          <p className="mb-8 text-sm leading-relaxed text-slate-400">
            Maaf, shortlink <span className="font-mono font-medium text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">/m/{slug}</span> yang Anda cari tidak tersedia, sudah kedaluwarsa, atau mungkin Anda salah mengetiknya.
          </p>

          <a href="/" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:shadow-cyan-500/40 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  redirect(target);
}
