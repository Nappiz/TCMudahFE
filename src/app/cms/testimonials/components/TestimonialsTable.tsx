"use client";

import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, PencilLine, Trash2 } from "lucide-react";
import type { Testimonial } from "../../../../../lib/testimonials";

type Props = {
  items: Testimonial[];
  canWrite: boolean;
  onToggleVisible: (item: Testimonial) => void;
  onEdit: (item: Testimonial) => void;
  onDelete: (item: Testimonial) => void;
};

export function TestimonialsTable({
  items,
  canWrite,
  onToggleVisible,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:block">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/60">
          <tr>
            <th className="px-4 py-3 text-left font-medium w-60">Nama</th>
            <th className="px-4 py-3 text-left font-medium">Kutipan</th>
            <th className="px-4 py-3 text-left font-medium w-40">Status</th>
            {canWrite ? (
              <th className="px-4 py-3 text-left font-medium w-40">Aksi</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              className="border-t border-white/10 hover:bg-white/[0.04]"
            >
              <td className="px-4 py-3 text-white">{it.name}</td>
              <td className="px-4 py-3 text-white/80">{it.text}</td>
              <td className="px-4 py-3 text-white/70">
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs">
                  {it.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  {it.visible ? "Ditampilkan" : "Disembunyikan"}
                </div>
              </td>
              {canWrite ? (
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleVisible(it)}
                    >
                      {it.visible ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Sembunyikan
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Tampilkan
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(it)}
                    >
                      <PencilLine className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(it)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
