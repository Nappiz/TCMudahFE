import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAdminUsers,
  fetchAdminClasses,
  fetchApprovedOrders,
  fetchUserEnrollments,
  setUserEnrollments,
  User,
  ClassItem,
  Enrollment,
} from "../../lib/admin";

type ModalVariant = "success" | "error" | "info" | "warn" | "default";

export function useEnrollments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [q, setQ] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeClassIds, setActiveClassIds] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<ModalVariant>("default");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const showModal = useCallback((variant: ModalVariant, title: string, message: string) => {
    setModalVariant(variant);
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, c, orders] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminClasses(),
        fetchApprovedOrders(),
      ]);

      const approvedUserIds = new Set(orders.map((o) => o.user_id));
      const onlyApprovedParticipants = u.filter(
        (x) => x.role === "peserta" && approvedUserIds.has(x.id),
      );

      setUsers(onlyApprovedParticipants);
      setClasses(c);

      if (!selectedUserId && onlyApprovedParticipants.length > 0) {
        setSelectedUserId(onlyApprovedParticipants[0].id);
      }
    } catch (e: any) {
      setError(e?.message ?? "Gagal memuat data");
      setUsers([]);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!selectedUserId) return;

    (async () => {
      try {
        const list = await fetchUserEnrollments(selectedUserId);
        setEnrollments(list);
      } catch (e: any) {
        setError(e?.message ?? "Gagal memuat enrollment");
        setEnrollments([]);
      }
    })();
  }, [selectedUserId, savedTick]);

  useEffect(() => {
    const next = new Set(enrollments.filter((e) => e.active).map((e) => e.class_id));
    setActiveClassIds(next);
    setHasChanges(false);
  }, [enrollments]);

  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s),
    );
  }, [users, q]);

  const selUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId],
  );

  const toggleClass = (cid: string) => {
    setActiveClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid);
      else next.add(cid);
      return next;
    });
    setHasChanges(true);
  };

  const save = async () => {
    if (!selectedUserId) return;
    const classIds = Array.from(activeClassIds);

    setSaving(true);
    setError(null);
    try {
      await setUserEnrollments(selectedUserId, classIds);
      setSavedTick((t) => t + 1);
      showModal("success", "Berhasil disimpan", "Enrollment peserta berhasil diperbarui.");
    } catch (e: any) {
      const msg = e?.message || "Terjadi kesalahan saat menyimpan perubahan.";
      setError(msg);
      showModal("error", "Gagal menyimpan", msg);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => setModalOpen(false);

  return {
    loading,
    error,
    users,
    classes,
    filteredUsers,
    selUser,
    selectedUserId,
    activeClassIds,
    hasChanges,
    saving,
    q,
    setQ,
    setSelectedUserId,
    toggleClass,
    save,
    reload,
    modalOpen,
    modalVariant,
    modalTitle,
    modalMessage,
    closeModal,
  };
}
