"use client";

import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, Users2, BookOpen, PencilLine, Trash2 } from "lucide-react";
import type { ClassItem } from "../../../../../lib/classes";
import type { Mentor } from "../../../../../lib/mentors";
import type { CurriculumItem } from "../../../../../lib/curriculum";

type Props = {
  items: ClassItem[];
  readonly: boolean;
  rupiah: (n: number) => string;
  idxMentor: Map<string, Mentor>;
  idxCurriculum: Map<string, CurriculumItem>;
  onEdit: (item: ClassItem) => void;
  onDelete: (item: ClassItem) => void;
};

export function ClassesListMobile({
  items,
  readonly,
  rupiah,
  idxMentor,
  idxCurriculum,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="grid gap-3 sm:hidden">
      {items.map((it) => (
        <div
          key={it.id}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-white font-semibold">{it.title}</div>
              <div className="mt-1 text-xs text-white/60 inline-flex items-center gap-2 flex-wrap">
                {(it.mentor_ids || []).map((mid, i) => {
                  const m = idxMentor.get(mid);
                  return (
                    <span
                      key={mid}
                      className="inline-flex items-center gap-1"
                    >
                      <Users2 className="h-4 w-4" /> {m?.name ?? "—"}
                      {i < (it.mentor_ids?.length || 0) - 1 && (
                        <span className="text-white/40">•</span>
                      )}
                    </span>
                  );
                })}
                <span className="text-white/40">•</span> {rupiah(it.price)}
              </div>
              <div className="mt-2 text-sm text-white/80">
                {it.description}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
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
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
              {it.visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {it.visible ? "Tampil" : "Hidden"}
            </div>
          </div>
          {!readonly && (
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(it)}>
                <PencilLine className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(it)}>
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
