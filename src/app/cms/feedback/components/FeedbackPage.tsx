"use client";

import { useFeedback } from "@/hooks/useFeedback";
import { FeedbackHeader } from "./FeedbackHeader";
import { FeedbackList } from "./FeedbackList";

export default function FeedbackPage() {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    rows,
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
    } catch (e: any) {
      alert(e?.message || "Gagal menghapus.");
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
    </div>
  );
}
