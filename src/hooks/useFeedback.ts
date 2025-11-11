"use client";

import { useEffect, useState } from "react";

import { fetchMe, type Role } from "../../lib/admin";
import { fetchClasses, type ClassItem } from "../../lib/classes";
import {
  fetchFeedback,
  deleteFeedback,
  type FeedbackItem,
} from "../../lib/feedback";

export function useFeedback() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const [rows, setRows] = useState<FeedbackItem[]>([]);
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
      } catch (e: any) {
        setErr(e?.message || "Gagal memuat kelas.");
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
        );
        if (!cancel) setRows(list);
      } catch (e: any) {
        if (!cancel)
          setErr(e?.message || "Gagal memuat feedback.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [selectedClassId]);

  const canDelete =
    role === "admin" || role === "superadmin";

  async function deleteById(id: string) {
    await deleteFeedback(id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return {
    classes,
    selectedClassId,
    setSelectedClassId,
    rows,
    loading,
    err,
    canDelete,
    deleteById,
  };
}
