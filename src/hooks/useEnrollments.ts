import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ClassItem,
  fetchActiveClassIds,
  fetchEnrollmentBootstrap,
  fetchEnrollmentCandidates,
  type PackageItem,
  setUserEnrollments,
  type User,
} from "../../lib/admin";

type ModalVariant = "success" | "error" | "info" | "warn" | "default";

const PARTICIPANT_PAGE_SIZE = 50;

export function useEnrollments() {
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [q, setQ] = useState("");
  const [selectedUserId, setSelectedUserIdState] = useState("");
  const [selUser, setSelUser] = useState<User | undefined>();
  const [activeClassIds, setActiveClassIds] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<ModalVariant>("default");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const bootstrappedRef = useRef(false);
  const selectedUserIdRef = useRef("");
  const queryRef = useRef("");
  const lastCandidateQueryRef = useRef("");
  const loadedEnrollmentUserRef = useRef("");
  const candidateRequestRef = useRef(0);
  const enrollmentRequestRef = useRef(0);

  const showModal = useCallback(
    (variant: ModalVariant, title: string, message: string) => {
      setModalVariant(variant);
      setModalTitle(title);
      setModalMessage(message);
      setModalOpen(true);
    },
    [],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const requestId = ++candidateRequestRef.current;
    try {
      const data = await fetchEnrollmentBootstrap({
        userId: selectedUserIdRef.current || undefined,
        q: queryRef.current,
        limit: PARTICIPANT_PAGE_SIZE,
      });
      if (requestId !== candidateRequestRef.current) return;

      setUsers(data.participants);
      setClasses(data.classes);
      setPackages(data.packages);
      setNextCursor(data.next_cursor);
      setHasMore(data.has_more);
      setSelUser(data.selected_user ?? undefined);

      const selectedId = data.selected_user?.id ?? "";
      selectedUserIdRef.current = selectedId;
      setSelectedUserIdState(selectedId);
      loadedEnrollmentUserRef.current = selectedId;
      setActiveClassIds(new Set(data.active_class_ids));
      setHasChanges(false);

      lastCandidateQueryRef.current = queryRef.current.trim();
      bootstrappedRef.current = true;
    } catch (errorValue: unknown) {
      if (requestId !== candidateRequestRef.current) return;
      const message =
        errorValue instanceof Error ? errorValue.message : "Gagal memuat data";
      setError(message);
      setUsers([]);
      setClasses([]);
      setPackages([]);
      setSelUser(undefined);
      setSelectedUserIdState("");
      selectedUserIdRef.current = "";
      setActiveClassIds(new Set());
    } finally {
      if (requestId === candidateRequestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    queryRef.current = q;
    if (!bootstrappedRef.current || q.trim() === lastCandidateQueryRef.current)
      return;

    // Invalidate an older search/load-more immediately, including during debounce.
    const requestId = ++candidateRequestRef.current;
    setLoadingMore(false);
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEnrollmentCandidates({
          q: q.trim(),
          limit: PARTICIPANT_PAGE_SIZE,
        });
        if (requestId !== candidateRequestRef.current) return;
        setUsers(data.participants);
        setNextCursor(data.next_cursor);
        setHasMore(data.has_more);
        lastCandidateQueryRef.current = q.trim();
      } catch (errorValue: unknown) {
        if (requestId !== candidateRequestRef.current) return;
        setError(
          errorValue instanceof Error
            ? errorValue.message
            : "Gagal mencari peserta",
        );
      } finally {
        if (requestId === candidateRequestRef.current) setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    if (!selectedUserId || loadedEnrollmentUserRef.current === selectedUserId)
      return;
    const requestId = ++enrollmentRequestRef.current;
    setLoadingEnrollments(true);
    setActiveClassIds(new Set());
    setHasChanges(false);

    void fetchActiveClassIds(selectedUserId)
      .then((data) => {
        if (requestId !== enrollmentRequestRef.current) return;
        loadedEnrollmentUserRef.current = selectedUserId;
        setActiveClassIds(new Set(data.class_ids));
      })
      .catch((errorValue: unknown) => {
        if (requestId !== enrollmentRequestRef.current) return;
        setError(
          errorValue instanceof Error
            ? errorValue.message
            : "Gagal memuat enrollment",
        );
      })
      .finally(() => {
        if (requestId === enrollmentRequestRef.current)
          setLoadingEnrollments(false);
      });
  }, [selectedUserId]);

  const setSelectedUserId = useCallback(
    (userId: string) => {
      selectedUserIdRef.current = userId;
      setSelectedUserIdState(userId);
      setSelUser(users.find((user) => user.id === userId));
    },
    [users],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    const requestId = ++candidateRequestRef.current;
    const requestedQuery = queryRef.current.trim();
    setLoadingMore(true);
    try {
      const data = await fetchEnrollmentCandidates({
        q: requestedQuery,
        limit: PARTICIPANT_PAGE_SIZE,
        cursor: nextCursor,
      });
      if (
        requestId !== candidateRequestRef.current ||
        requestedQuery !== queryRef.current.trim()
      )
        return;
      setUsers((current) => {
        const seen = new Set(current.map((user) => user.id));
        return [
          ...current,
          ...data.participants.filter((user) => !seen.has(user.id)),
        ];
      });
      setNextCursor(data.next_cursor);
      setHasMore(data.has_more);
    } catch (errorValue: unknown) {
      if (requestId !== candidateRequestRef.current) return;
      setError(
        errorValue instanceof Error
          ? errorValue.message
          : "Gagal memuat peserta berikutnya",
      );
    } finally {
      if (requestId === candidateRequestRef.current) setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor]);

  const toggleClass = (classId: string) => {
    if (loadingEnrollments) return;
    setActiveClassIds((current) => {
      const next = new Set(current);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
    setHasChanges(true);
  };

  const selectAllInPackage = (pkg: PackageItem) => {
    if (loadingEnrollments) return;
    setActiveClassIds((current) => {
      const next = new Set(current);
      pkg.class_ids.forEach((classId) => {
        next.add(classId);
      });
      return next;
    });
    setHasChanges(true);
  };

  const save = async () => {
    if (!selectedUserId || loadingEnrollments) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await setUserEnrollments(
        selectedUserId,
        Array.from(activeClassIds),
      );
      setActiveClassIds(
        new Set(
          updated.filter((item) => item.active).map((item) => item.class_id),
        ),
      );
      loadedEnrollmentUserRef.current = selectedUserId;
      setHasChanges(false);
      showModal(
        "success",
        "Berhasil disimpan",
        "Enrollment peserta berhasil diperbarui.",
      );
    } catch (errorValue: unknown) {
      const message =
        errorValue instanceof Error
          ? errorValue.message
          : "Terjadi kesalahan saat menyimpan perubahan.";
      setError(message);
      showModal("error", "Gagal menyimpan", message);
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    loadingEnrollments,
    loadingMore,
    error,
    users,
    classes,
    packages,
    filteredUsers: users,
    selUser,
    selectedUserId,
    activeClassIds,
    hasChanges,
    hasMore,
    saving,
    q,
    setQ,
    setSelectedUserId,
    toggleClass,
    selectAllInPackage,
    loadMore,
    save,
    reload,
    modalOpen,
    modalVariant,
    modalTitle,
    modalMessage,
    closeModal: () => setModalOpen(false),
  };
}
