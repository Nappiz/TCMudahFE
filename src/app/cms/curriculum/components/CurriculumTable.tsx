import { PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CurriculumItem } from "../../../../../lib/curriculum";

type Props = {
  items: CurriculumItem[];
  canWrite: boolean;
  onEdit: (item: CurriculumItem) => void;
  onDelete: (item: CurriculumItem) => void;
};

export function CurriculumTable({
  items,
  canWrite,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:block">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/60">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Kode</th>
            <th className="px-4 py-3 text-left font-medium">Nama</th>
            <th className="px-4 py-3 text-left font-medium">Smt</th>
            <th className="px-4 py-3 text-left font-medium">Deskripsi</th>
            {canWrite ? (
              <th className="px-4 py-3 text-left font-medium w-32">Aksi</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              className="border-t border-white/10 hover:bg-white/[0.04]"
            >
              <td className="px-4 py-3 text-white">{it.code}</td>
              <td className="px-4 py-3 text-white/90">{it.name}</td>
              <td className="px-4 py-3 text-white/80">{it.sem}</td>
              <td className="px-4 py-3 text-white/70">{it.blurb}</td>
              {canWrite ? (
                <td className="px-4 py-3">
                  <div className="flex gap-2">
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
