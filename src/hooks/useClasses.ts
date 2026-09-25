"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMe, type User } from "../../lib/admin";
import {
  type ClassItem,
  createClassItem,
  deleteClassItem,
  fetchClasses,
  patchClassVisibility,
  updateClassItem,
} from "../../lib/classes";
import { type CurriculumItem, fetchCurriculum } from "../../lib/curriculum";
import { fetchMentors, type Mentor } from "../../lib/mentors";

import {
  createPackageItem,
  deletePackageItem,
  fetchPackages,
  type PackageItem,
  patchPackageVisibility,
  updatePackageItem,
} from "../../lib/packages";

import type { UnifiedForm } from "../app/cms/classes/components/ClassesFormModal";

export function useClasses() {
  const [me, setMe] = useState<User | null>(null);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);

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

        const [cls, pkgs, ments, curs] = await Promise.all([
          fetchClasses(),
          fetchPackages(),
          fetchMentors(),
          fetchCurriculum(),
        ]);

        if (cancel) return;
        setClasses(cls);
        setPackages(pkgs);
        setMentors(ments);
        setCurriculum(curs);
      } catch (error: unknown) {
        if (!cancel) {
          setErr(
            error instanceof Error
              ? error.message
              : "Gagal memuat data katalog.",
          );
        }
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
    mentors.forEach((x) => {
      m.set(x.id, x);
    });
    return m;
  }, [mentors]);

  const idxCurriculum = useMemo(() => {
    const m = new Map<string, CurriculumItem>();
    curriculum.forEach((x) => {
      m.set(x.id, x);
    });
    return m;
  }, [curriculum]);

  const filteredClasses = useMemo(() => {
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

  const filteredPackages = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return packages;

    return packages.filter((p) => {
      const classNames = (p.class_ids || [])
        .map(
          (cid) =>
            classes.find((c) => c.id === cid)?.title?.toLowerCase() ?? "",
        )
        .join(" ");

      return (
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        classNames.includes(s)
      );
    });
  }, [packages, classes, search]);

  const rupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  async function createItem(form: UnifiedForm, type: "class" | "package") {
    if (type === "class") {
      const payload = {
        title: form.title,
        description: form.description,
        mentor_ids: form.mentor_ids,
        curriculum_ids: form.curriculum_ids,
        base_price_per_meeting: form.base_price_per_meeting,
        offers: form.offers,
        visible: form.visible,
      };
      const created = await createClassItem(payload);
      setClasses((prev) => [created, ...prev]);
      return created;
    } else {
      const payload = {
        title: form.title,
        description: form.description,
        price: form.price,
        visible: form.visible,
        class_ids: form.class_ids,
        items: form.items,
      };
      const created = await createPackageItem(payload);
      setPackages((prev) => [created, ...prev]);
      return created;
    }
  }

  async function updateItem(
    id: string,
    form: UnifiedForm,
    type: "class" | "package",
  ) {
    if (type === "class") {
      const payload = {
        title: form.title,
        description: form.description,
        mentor_ids: form.mentor_ids,
        curriculum_ids: form.curriculum_ids,
        base_price_per_meeting: form.base_price_per_meeting,
        offers: form.offers,
        visible: form.visible,
      };
      const updated = await updateClassItem(id, payload);
      setClasses((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i)),
      );
      return updated;
    } else {
      const payload = {
        title: form.title,
        description: form.description,
        price: form.price,
        visible: form.visible,
        class_ids: form.class_ids,
        items: form.items,
      };
      const updated = await updatePackageItem(id, payload);
      setPackages((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i)),
      );
      return updated;
    }
  }

  async function removeItem(id: string, type: "class" | "package") {
    if (type === "class") {
      await deleteClassItem(id);
      setClasses((prev) => prev.filter((x) => x.id !== id));
    } else {
      await deletePackageItem(id);
      setPackages((prev) => prev.filter((x) => x.id !== id));
    }
  }

  async function toggleVisible(
    item: ClassItem | PackageItem,
    type: "class" | "package",
  ) {
    if (type === "class") {
      const updated = await patchClassVisibility(item.id, !item.visible);
      setClasses((prev) =>
        prev.map((x) =>
          x.id === updated.id
            ? {
                ...x,
                ...updated,
                offers: updated.offers?.length ? updated.offers : x.offers,
              }
            : x,
        ),
      );
      return updated;
    } else {
      const updated = await patchPackageVisibility(item.id, !item.visible);
      setPackages((prev) =>
        prev.map((x) =>
          x.id === updated.id
            ? {
                ...x,
                ...updated,
                items: updated.items?.length ? updated.items : x.items,
              }
            : x,
        ),
      );
      return updated;
    }
  }

  return {
    me,
    classes,
    packages,
    mentors,
    curriculum,
    loading,
    err,
    canWrite,
    search,
    setSearch,
    filteredClasses,
    filteredPackages,
    idxMentor,
    idxCurriculum,
    rupiah,
    createItem,
    updateItem,
    removeItem,
    toggleVisible,
  };
}
