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

export function TestimonialsListMobile({
  items,
  canWrite,
  onToggleVisible,
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
              <div className="text-white font-semibold">{it.name}</div>
              <div className="mt-1 text-sm text-white/80">{it.text}</div>
              <div className="mt-2 text-xs text-white/60 flex items-center gap-2">
                {it.visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                {it.visible ? "Ditampilkan" : "Disembunyikan"}
              </div>
            </div>
            {canWrite ? (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleVisible(it)}
                  title="Toggle tampil"
                >
                  {it.visible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(it)}
                >
                  <PencilLine className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(it)}
                >
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
