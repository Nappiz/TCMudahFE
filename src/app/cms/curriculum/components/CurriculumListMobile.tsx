import { PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CurriculumItem } from "../../../../../lib/curriculum";

type Props = {
  items: CurriculumItem[];
  canWrite: boolean;
  onEdit: (item: CurriculumItem) => void;
  onDelete: (item: CurriculumItem) => void;
};

export function CurriculumListMobile({
  items,
  canWrite,
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
              <div className="text-xs text-white/60">
                Smt {it.sem} • {it.code}
              </div>
              <div className="text-white font-semibold">{it.name}</div>
              <div className="text-sm text-white/70 mt-1">{it.blurb}</div>
            </div>
            {canWrite ? (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(it)}>
                  <PencilLine className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(it)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
