"use client";

import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, Users2, BookOpen, PencilLine, Trash2, Package } from "lucide-react";
import type { ClassItem } from "../../../../../lib/classes";
import type { Mentor } from "../../../../../lib/mentors";
import type { CurriculumItem } from "../../../../../lib/curriculum";

type Mode = "class" | "package";

type Props = {
  mode: Mode;
  items: any[];
  allClasses: ClassItem[];
  readonly: boolean;
  rupiah: (n: number) => string;
  idxMentor: Map<string, Mentor>;
  idxCurriculum: Map<string, CurriculumItem>;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
};

export function ClassesListMobile({
  mode, items, allClasses, readonly, rupiah, idxMentor, idxCurriculum, onEdit, onDelete,
}: Props) {
  const isPackage = mode === "package";
  const getClassName = (id: string) => allClasses.find(c => c.id === id)?.title || "Unknown";

  return (
    <div className="grid gap-3 sm:hidden">
      {items.map((it) => (
        <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-white font-semibold flex items-center gap-2">
                {isPackage && <Package className="w-4 h-4 text-amber-400" />}
                {it.title}
              </div>

              {!isPackage ? (
                <div className="mt-1 text-xs text-white/60 inline-flex items-center gap-2 flex-wrap">
                  {(it.mentor_ids || []).map((mid: string, i: number) => {
                    const m = idxMentor.get(mid);
                    return (
                      <span key={mid} className="inline-flex items-center gap-1">
                        <Users2 className="h-3 w-3" /> {m?.name ?? "—"}
                        {i < (it.mentor_ids?.length || 0) - 1 && <span className="text-white/40">•</span>}
                      </span>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-2 font-mono text-cyan-400 text-sm">
                {rupiah(it.price)}
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {!isPackage ? (
                  (it.curriculum_ids || []).map((id: string) => {
                    const c = idxCurriculum.get(id);
                    return (
                      <span key={id} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px]">
                        <BookOpen className="h-3 w-3" /> {c ? c.code : id}
                      </span>
                    );
                  })
                ) : (
                  (it.class_ids || []).map((cid: string) => (
                    <span key={cid} className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-200 px-2 py-0.5 text-[10px]">
                      <Package className="h-3 w-3" /> {getClassName(cid)}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          {!readonly && (
            <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
              <Button variant="secondary" size="sm" className="w-full bg-white/5" onClick={() => onEdit(it)}>
                <PencilLine className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-red-400 hover:bg-red-500/10" onClick={() => onDelete(it)}>
                <Trash2 className="h-4 w-4 mr-2" /> Hapus
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}