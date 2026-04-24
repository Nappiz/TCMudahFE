"use client";

import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, Users2, BookOpen, Package } from "lucide-react";
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
  onToggleVisible: (item: any) => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
};

export function ClassesTable({
  mode,
  items,
  allClasses,
  readonly,
  rupiah,
  idxMentor,
  idxCurriculum,
  onToggleVisible,
  onEdit,
  onDelete,
}: Props) {
  const isPackage = mode === "package";

  const getClassName = (id: string) => allClasses.find(c => c.id === id)?.title || "Unknown Class";

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:block">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/60">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Judul {isPackage ? "Paket" : "Kelas"}</th>

            {!isPackage ? (
              <>
                <th className="px-4 py-3 text-left font-medium w-48">Mentor</th>
                <th className="px-4 py-3 text-left font-medium w-48">Kurikulum</th>
              </>
            ) : (
              <th className="px-4 py-3 text-left font-medium w-96">Isi Paket</th>
            )}

            <th className="px-4 py-3 text-left font-medium w-32">Harga</th>
            <th className="px-4 py-3 text-left font-medium w-36">Status</th>
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
              <td className="px-4 py-3 text-white">
                <div className="font-semibold">{it.title}</div>
              </td>

              {!isPackage ? (
                <>
                  <td className="px-4 py-3 text-white/80">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(it.mentor_ids || []).map((mid: string) => {
                        const m = idxMentor.get(mid);
                        return (
                          <span key={mid} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                            <Users2 className="h-3.5 w-3.5" />
                            {m?.name ?? "—"}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/80">
                    <div className="flex flex-wrap gap-1.5">
                      {(it.curriculum_ids || []).map((id: string) => {
                        const c = idxCurriculum.get(id);
                        return (
                          <span key={id} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                            <BookOpen className="h-3.5 w-3.5" />
                            {c ? c.code : id}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </>
              ) : (
                <td className="px-4 py-3 text-white/80">
                  <div className="flex flex-wrap gap-1.5">
                    {(it.class_ids || []).map((cid: string) => (
                      <span key={cid} className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-200 px-2 py-0.5 text-xs">
                        <Package className="h-3 w-3" />
                        {getClassName(cid)}
                      </span>
                    ))}
                  </div>
                </td>
              )}

              <td className="px-4 py-3 font-mono text-cyan-400">
                {rupiah(it.price)}
              </td>
              <td className="px-4 py-3 text-white/70">
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs">
                  {it.visible ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                  {it.visible ? "Tampil" : "Hidden"}
                </div>
              </td>
              {!readonly && (
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onToggleVisible(it)} className="px-2">
                      {it.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(it)} className="px-2 text-cyan-400 hover:text-cyan-300">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(it)} className="px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10">
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