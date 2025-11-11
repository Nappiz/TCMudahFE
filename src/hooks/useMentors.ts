// src/hooks/useMentors.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchMe, type User } from "../../lib/admin";
import {
  fetchMentors,
  createMentor,
  updateMentor,
  deleteMentor,
  type Mentor,
  type MentorPayload,
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
      } catch (e: any) {
        setError(e?.message ?? String(e) ?? "Gagal memuat mentor.");
        setList([]);
      }
    })();
  }, [router]);

  function addDraftMentor() {
    if (isReadonly || !list) return;
    setList((prev) => [
      {
        id: "new-" + Math.random().toString(36).slice(2),
        name: "",
        angkatan: new Date().getFullYear(),
        achievements: [""],
        visible: true,
      },
      ...(prev ?? []),
    ]);
  }

  function buildPayload(m: Mentor): MentorPayload {
    const cleanAchievements = (m.achievements || [])
      .map((s) => s.trim())
      .filter(Boolean);

    if (cleanAchievements.length < 1 || cleanAchievements.length > 5) {
      throw new Error("Prestasi harus diisi 1 sampai 5 item.");
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
      setList((prev) =>
        (prev ?? []).map((x) => (x.id === m.id ? saved : x)),
      );
      return "created";
    } else {
      const saved = await updateMentor(m.id, payload);
      setList((prev) =>
        (prev ?? []).map((x) => (x.id === m.id ? saved : x)),
      );
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
