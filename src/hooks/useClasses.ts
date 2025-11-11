"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMe, type User } from "../../lib/admin";
import { fetchMentors, type Mentor } from "../../lib/mentors";
import {
  fetchCurriculum,
  type CurriculumItem,
} from "../../lib/curriculum";
import {
  fetchClasses,
  createClassItem,
  updateClassItem,
  deleteClassItem,
  patchClassVisibility,
  type ClassItem,
  type ClassForm,
} from "../../lib/classes";

export function useClasses() {
  const [me, setMe] = useState<User | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancel = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const m = await fetchMe();
        if (cancel) return;
        setMe(m);

        const [cls, ments, curs] = await Promise.all([
          fetchClasses(),
          fetchMentors(),
          fetchCurriculum(),
        ]);
        if (cancel) return;
        setClasses(cls);
        setMentors(ments);
        setCurriculum(curs);
      } catch (e: any) {
        if (!cancel) setErr(e?.message ?? "Gagal memuat.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  const canWrite = useMemo(
    () => !!(me && (me.role === "admin" || me.role === "superadmin")),
    [me],
  );

  const idxMentor = useMemo(() => {
    const m = new Map<string, Mentor>();
    mentors.forEach((x) => m.set(x.id, x));
    return m;
  }, [mentors]);

  const idxCurriculum = useMemo(() => {
    const m = new Map<string, CurriculumItem>();
    curriculum.forEach((x) => m.set(x.id, x));
    return m;
  }, [curriculum]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return classes;

    return classes.filter((k) => {
      const mentorsTxt = (k.mentor_ids || [])
        .map((id) => idxMentor.get(id)?.name?.toLowerCase() ?? "")
        .join(" ");
      const curs = (k.curriculum_ids || [])
        .map(
          (id) =>
            idxCurriculum.get(id)?.name?.toLowerCase() ??
            idxCurriculum.get(id)?.code?.toLowerCase() ??
            "",
        )
        .join(" ");

      return (
        k.title.toLowerCase().includes(s) ||
        k.description.toLowerCase().includes(s) ||
        mentorsTxt.includes(s) ||
        curs.includes(s)
      );
    });
  }, [classes, search, idxMentor, idxCurriculum]);

  const rupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  async function createItem(form: ClassForm): Promise<ClassItem> {
    const created = await createClassItem(form);
    setClasses((prev) => [created, ...prev]);
    return created;
  }

  async function updateItem(
    id: string,
    form: ClassForm,
  ): Promise<ClassItem> {
    const updated = await updateClassItem(id, form);
    setClasses((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i)),
    );
    return updated;
  }

  async function removeItem(id: string): Promise<void> {
    await deleteClassItem(id);
    setClasses((prev) => prev.filter((x) => x.id !== id));
  }

  async function toggleVisible(item: ClassItem): Promise<ClassItem> {
    const updated = await patchClassVisibility(item.id, !item.visible);
    setClasses((prev) =>
      prev.map((x) => (x.id === updated.id ? updated : x)),
    );
    return updated;
  }

  return {
    me,
    classes,
    mentors,
    curriculum,
    loading,
    err,
    canWrite,
    search,
    setSearch,
    filtered,
    idxMentor,
    idxCurriculum,
    rupiah,
    createItem,
    updateItem,
    removeItem,
    toggleVisible,
  };
}
