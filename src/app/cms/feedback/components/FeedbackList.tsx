"use client";

import { Button } from "@/components/ui/Button";
import { Trash2, Star } from "lucide-react";
import type { FeedbackItem } from "../../../../../lib/feedback";

type Props = {
  rows: FeedbackItem[];
  loading: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
};

export function FeedbackList({
  rows,
  loading,
  canDelete,
  onDelete,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      {loading ? (
        <div className="text-sm text-white/60">Memuat…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-white/60">
          Belum ada feedback.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-white/10 bg-black/40 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-white/60">
                    {r.class_title ? r.class_title : r.class_id}
                    <span className="ml-2 text-white/40">
                      •{" "}
                      {r.created_at
                        ? new Date(
                            r.created_at,
                          ).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  {r.rating ? (
                    <div className="mt-1 inline-flex items-center gap-1 text-yellow-300">
                      {Array.from({ length: r.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5"
                          />
                        ),
                      )}
                    </div>
                  ) : null}
                  <div className="mt-1 whitespace-pre-wrap text-sm text-white/90">
                    {r.text}
                  </div>
                </div>
                {canDelete && (
                  <Button
                    variant="ghost"
                    onClick={() => onDelete(r.id)}
                    title="Hapus"
                    className="text-rose-300 hover:text-rose-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
