"use client";

import { useGlobalError } from "@/components/providers/ErrorProvider";
import { useFeedback } from "@/hooks/useFeedback";
import { FeedbackHeader } from "./FeedbackHeader";
import { FeedbackList } from "./FeedbackList";

export default function FeedbackPage() {
  const { showError } = useGlobalError();
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    rows,
    page,
    setPage,
    total,
    limit,
    loading,
    err,
    canDelete,
    deleteById,
  } = useFeedback();

  async function handleDelete(id: string) {
    if (!canDelete) return;
    if (!window.confirm("Hapus feedback ini?")) return;
    try {
      await deleteById(id);
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "Gagal menghapus.");
    }
  }

  return (
    <div className="space-y-5">
      <FeedbackHeader
        classes={classes}
        selectedClassId={selectedClassId}
        onChangeClass={setSelectedClassId}
        err={err}
      />

      <FeedbackList
        rows={rows}
        loading={loading}
        canDelete={canDelete}
        onDelete={handleDelete}
      />

      {total > limit && (
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>
            Halaman {page} dari {Math.ceil(total / limit)} · {total} feedback
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={page * limit >= total || loading}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
