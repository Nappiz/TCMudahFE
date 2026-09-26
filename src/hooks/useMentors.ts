// src/hooks/useMentors.ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { fetchMe, type User } from "../../lib/admin";
import {
  createMentor,
  deleteMentor,
  fetchMentors,
  MAX_MENTOR_ACHIEVEMENTS,
  type Mentor,
  type MentorPayload,
  updateMentor,
} from "../../lib/mentors";

export function useMentors() {
  const router = useRouter();

  const [me, setMe] = useState<User | null>(null);
  const [list, setList] = useState<Mentor[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isReadonly = useMemo(() => me?.role === "mentor", [me]);

  useEffect(() => {
    (async () => {
      try {
        const u = await fetchMe();
        if (u.role === "peserta") {
          router.replace("/");
          return;
        }
        setMe(u);
      } catch {
        router.replace("/");
        return;
      }

      try {
        const rows = await fetchMentors();
        setList(rows);
      } catch (errorValue: unknown) {
        setError(
          errorValue instanceof Error
            ? errorValue.message
            : "Gagal memuat mentor.",
        );
        setList([]);
      }
    })();
  }, [router]);

  function addDraftMentor(): Mentor | null {
    if (isReadonly || !list) return null;
    const draft: Mentor = {
      id: `new-${Math.random().toString(36).slice(2)}`,
      name: "",
      angkatan: new Date().getFullYear(),
      achievements: [""],
      visible: true,
    };
    setList((prev) => [draft, ...(prev ?? [])]);
    return draft;
  }

  function buildPayload(m: Mentor): MentorPayload {
    const cleanAchievements = (m.achievements || [])
      .map((s) => s.trim())
      .filter(Boolean);

    if (!m.name.trim()) {
      throw new Error("Nama mentor wajib diisi.");
    }
    if (
      !Number.isInteger(m.angkatan) ||
      m.angkatan < 1900 ||
      m.angkatan > 2100
    ) {
      throw new Error("Angkatan harus berupa tahun yang valid.");
    }
    if (
      cleanAchievements.length < 1 ||
      cleanAchievements.length > MAX_MENTOR_ACHIEVEMENTS
    ) {
      throw new Error(
        `Prestasi harus diisi 1 sampai ${MAX_MENTOR_ACHIEVEMENTS} item.`,
      );
    }

    return {
      name: m.name.trim(),
      angkatan: Number(m.angkatan),
      achievements: cleanAchievements,
      visible: !!m.visible,
    };
  }

  async function saveMentorRow(m: Mentor): Promise<"created" | "updated"> {
    if (isReadonly) {
      throw new Error("Mode read-only, tidak dapat menyimpan perubahan.");
    }
    const payload = buildPayload(m);

    if (m.id.startsWith("new-")) {
      const saved = await createMentor(payload);
      setList((prev) => (prev ?? []).map((x) => (x.id === m.id ? saved : x)));
      return "created";
    } else {
      const saved = await updateMentor(m.id, payload);
      setList((prev) => (prev ?? []).map((x) => (x.id === m.id ? saved : x)));
      return "updated";
    }
  }

  async function deleteMentorRow(
    m: Mentor,
  ): Promise<"draft-removed" | "deleted"> {
    if (isReadonly) {
      throw new Error("Mode read-only, tidak dapat menghapus.");
    }

    if (m.id.startsWith("new-")) {
      setList((prev) => (prev ?? []).filter((x) => x.id !== m.id));
      return "draft-removed";
    }

    await deleteMentor(m.id);
    setList((prev) => (prev ?? []).filter((x) => x.id !== m.id));
    return "deleted";
  }

  return {
    me,
    list,
    setList,
    error,
    isReadonly,
    addDraftMentor,
    saveMentorRow,
    deleteMentorRow,
  };
}
