"use client";
import { useEffect, useMemo, useState } from "react";
import { apiMyEnrollments, fetchCatalog } from "../../../../lib/api";
import { API_BASE } from "../../../../lib/api";
import { Button } from "@/components/ui/Button";

type MyFeedback = {
  id: string;
  class_id: string;
  rating?: number | null;
  message: string;
  created_at: string;
};

type ClassLite = { id: string; title: string };

export default function FeedbackPage() {
  const [catalogClasses, setCatalogClasses] = useState<ClassLite[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [mine, setMine] = useState<MyFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // load kelas aktif user + katalog utk nama
  useEffect(() => {
    (async () => {
      try {
        const [enrolls, catalog] = await Promise.all([apiMyEnrollments(), fetchCatalog()]);
        const activeIds = enrolls.filter(e => e.active).map(e => e.class_id);
        setEnrolledIds(activeIds);
        const cls = catalog.classes.map(c => ({ id: c.id, title: c.title }));
        setCatalogClasses(cls);
        // default pilih pertama yg aktif
        const first = activeIds[0] || "";
        setClassId(first);
      } catch (e: any) {
        setErr(e?.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const eligibleClasses = useMemo(
    () => catalogClasses.filter(c => enrolledIds.includes(c.id)),
    [catalogClasses, enrolledIds]
  );

  const classNameMap = useMemo(() => {
    const m = new Map<string, string>();
    catalogClasses.forEach(c => m.set(c.id, c.title));
    return m;
  }, [catalogClasses]);

  async function loadMyFeedback() {
    try {
      const r = await fetch(`${API_BASE}/feedback/me`, { credentials: "include" });
      if (!r.ok) throw new Error((await r.text()) || r.statusText);
      const data = (await r.json()) as MyFeedback[];
      setMine(data);
    } catch (e: any) {
      // biar halaman tetap jalan meski belum ada endpoint
      setMine([]);
    }
  }

  useEffect(() => {
    loadMyFeedback();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!classId) {
      setErr("Pilih kelas terlebih dahulu.");
      return;
    }
    if (message.trim().length < 4) {
      setErr("Feedback minimal 4 karakter.");
      return;
    }
    if (message.trim().length > 1000) {
      setErr("Feedback maksimal 1000 karakter.");
      return;
    }
    try {
      setSubmitting(true);
      const r = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          rating: rating ?? null,
          message: message.trim(),
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || r.statusText);
      }
      setOk("Terima kasih! Feedback kamu tersimpan.");
      setMessage("");
      setRating(null);
      await loadMyFeedback();
    } catch (e: any) {
      setErr(e?.message || "Gagal mengirim feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h1 className="text-xl font-semibold text-white">Feedback Materi</h1>
        <p className="text-white/70 text-sm">
          Beri masukan untuk kelas yang kamu ikuti. Feedback ini <strong>bersifat anonim</strong> di CMS.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm text-white/80 mb-1">Pilih Kelas</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="cursor-pointer w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white"
              >
                {eligibleClasses.length === 0 && <option value="">(Tidak ada kelas aktif)</option>}
                {eligibleClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/50 mt-1">
                Hanya kelas dengan enrollment aktif yang bisa kamu pilih.
              </p>
            </div>

            {/* rating */}
            <div className="shrink-0">
              <label className="block text-sm text-white/80 mb-1">Rating </label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(rating === n ? null : n)}
                    className={`cursor-pointer rounded-md border px-2 py-1 text-sm ${
                      rating && rating >= n
                        ? "border-yellow-400 bg-yellow-400/20 text-yellow-200"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Feedback</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-white"
              placeholder="Tulis masukan atau pengalaman kamu..."
            />
            <p className="text-xs text-white/50 mt-1">Min 4 karakter, maks 1000 karakter. Nama kamu tidak ditampilkan di CMS.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="secondary" disabled={submitting || !classId}>
              {submitting ? "Mengirim..." : "Kirim Feedback"}
            </Button>
            {err && <span className="text-xs text-rose-300">{err}</span>}
            {ok && <span className="text-xs text-emerald-300">{ok}</span>}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-white font-semibold mb-2">Feedback Kamu</div>
        {mine.length === 0 ? (
          <div className="text-sm text-white/60">Belum ada feedback yang tersimpan.</div>
        ) : (
          <ul className="space-y-3">
            {mine.map(f => (
              <li key={f.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <div className="text-sm text-white/80">
                  <span className="font-medium">{classNameMap.get(f.class_id) || f.class_id}</span>{" "}
                  {f.rating ? <span className="ml-2 text-yellow-300">{"★".repeat(f.rating)}</span> : null}
                </div>
                <div className="text-white/80 mt-1 whitespace-pre-wrap">{f.message}</div>
                <div className="text-xs text-white/40 mt-1">{new Date(f.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
