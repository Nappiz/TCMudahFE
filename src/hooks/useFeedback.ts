"use client";

import { useEffect, useState } from "react";

import { fetchMe, type Role } from "../../lib/admin";
import { type ClassItem, fetchClasses } from "../../lib/classes";
import {
  deleteFeedback,
  type FeedbackItem,
  fetchFeedback,
} from "../../lib/feedback";

export function useFeedback() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const [rows, setRows] = useState<FeedbackItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();
        setRole(me.role);

        const cls = await fetchClasses();
        setClasses(cls);
      } catch (error: unknown) {
        setErr(error instanceof Error ? error.message : "Gagal memuat kelas.");
      }
    })();
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const list = await fetchFeedback(
          selectedClassId || undefined,
          page,
          limit,
        );
        if (!cancel) {
          setRows(list.data);
          setTotal(list.total);
        }
      } catch (error: unknown) {
        if (!cancel)
          setErr(
            error instanceof Error ? error.message : "Gagal memuat feedback.",
          );
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [page, selectedClassId]);

  const canDelete = role === "admin" || role === "superadmin";

  async function deleteById(id: string) {
    await deleteFeedback(id);
    setRows((r) => r.filter((x) => x.id !== id));
    setTotal((value) => Math.max(0, value - 1));
  }

  return {
    classes,
    selectedClassId,
    setSelectedClassId: (classId: string) => {
      setSelectedClassId(classId);
      setPage(1);
    },
    rows,
    page,
    setPage,
    total,
    limit,
    loading,
    err,
    canDelete,
    deleteById,
  };
}
