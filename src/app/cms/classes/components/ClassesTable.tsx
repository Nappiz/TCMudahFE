"use client";

import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, Users2, BookOpen } from "lucide-react";
import type { ClassItem } from "../../../../../lib/classes";
import type { Mentor } from "../../../../../lib/mentors";
import type { CurriculumItem } from "../../../../../lib/curriculum";

type Props = {
  items: ClassItem[];
  readonly: boolean;
  rupiah: (n: number) => string;
  idxMentor: Map<string, Mentor>;
  idxCurriculum: Map<string, CurriculumItem>;
  onToggleVisible: (item: ClassItem) => void;
  onEdit: (item: ClassItem) => void;
  onDelete: (item: ClassItem) => void;
};

export function ClassesTable({
  items,
  readonly,
  rupiah,
  idxMentor,
  idxCurriculum,
  onToggleVisible,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:block">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/60">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Judul</th>
            <th className="px-4 py-3 text-left font-medium w-56">Mentor</th>
            <th className="px-4 py-3 text-left font-medium">Kurikulum</th>
            <th className="px-4 py-3 text-left font-medium w-32">Harga</th>
            <th className="px-4 py-3 text-left font-medium w-40">Status</th>
            {!readonly && (
              <th className="px-4 py-3 text-left font-medium w-44">Aksi</th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              className="border-t border-white/10 hover:bg-white/[0.04]"
            >
              <td className="px-4 py-3 text-white">{it.title}</td>
              <td className="px-4 py-3 text-white/80">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(it.mentor_ids || []).map((mid) => {
                    const m = idxMentor.get(mid);
                    return (
                      <span
                        key={mid}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs"
                      >
                        <Users2 className="h-3.5 w-3.5" />
                        {m?.name ?? "—"}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="px-4 py-3 text-white/80">
                <div className="flex flex-wrap gap-1.5">
                  {it.curriculum_ids.map((id) => {
                    const c = idxCurriculum.get(id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        {c ? c.code : id}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="px-4 py-3 text-white/80">
                {rupiah(it.price)}
              </td>
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
              {!readonly && (
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
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(it)}
                    >
                      Hapus
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
