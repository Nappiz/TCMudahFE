"use client";

import type { Shortlink } from "../../../../../lib/shortlinks";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, PencilLine, Trash2 } from "lucide-react";

type Props = {
  rows: Shortlink[];
  loading: boolean;
  origin: string;
  onEdit: (row: Shortlink) => void;
  onDelete: (row: Shortlink) => void;
};

export function ShortlinksTable({
  rows,
  loading,
  origin,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/60">
          <tr>
            <th className="px-4 py-3 text-left font-medium w-48">Slug</th>
            <th className="px-4 py-3 text-left font-medium">Target URL</th>
            <th className="px-4 py-3 text-left font-medium w-56">Judul</th>
            <th className="px-4 py-3 text-left font-medium w-28">Klik</th>
            <th className="px-4 py-3 text-left font-medium w-32">Status</th>
            <th className="px-4 py-3 text-left font-medium w-40">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-white/60">
                {loading
                  ? "Memuat…"
                  : "Belum ada shortlink. Tambahkan satu untuk mulai."}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-white/10 hover:bg-white/[0.04]"
              >
                <td className="px-4 py-3 text-white">
                  <div className="font-mono text-xs">
                    {origin ? `${origin}/m/${row.slug}` : `/m/${row.slug}`}
                  </div>
                  <div className="text-[11px] text-white/50">/m/{row.slug}</div>
                </td>
                <td className="px-4 py-3 text-white/80">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-cyan-300 hover:underline"
                  >
                    {row.url}
                  </a>
                </td>
                <td className="px-4 py-3 text-white/80">
                  <div className="font-medium">
                    {row.title || "(tanpa judul)"}
                  </div>
                  {row.description && (
                    <div className="mt-0.5 line-clamp-2 text-xs text-white/60">
                      {row.description}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-white/80">
                  {row.clicks ?? 0}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs ${
                      row.active
                        ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                        : "border-slate-400/30 bg-slate-500/15 text-slate-200"
                    }`}
                  >
                    {row.active ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    {row.active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(row)}
                    >
                      <PencilLine className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(row)}
                      className="text-rose-300 hover:text-rose-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
