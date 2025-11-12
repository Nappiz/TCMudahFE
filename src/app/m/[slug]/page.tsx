import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function resolveShortlink(slug: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${API_BASE}/shortlinks/${encodeURIComponent(slug)}`,
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
  params: { slug: string };
}) {
  const target = await resolveShortlink(params.slug);

  if (!target) {
    // fallback sederhana kalau slug tidak ditemukan
    return (
      <html>
        <body className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center">
            <div className="text-sm font-semibold">
              Shortlink tidak ditemukan
            </div>
            <p className="mt-2 text-xs text-white/60">
              Pastikan URL /m/{params.slug} sudah benar atau hubungi admin.
            </p>
          </div>
        </body>
      </html>
    );
  }

  redirect(target);
}
