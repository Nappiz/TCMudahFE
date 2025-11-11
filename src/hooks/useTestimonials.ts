"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMe, type User } from "../../lib/admin";
import {
  fetchTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type Testimonial,
  type TestimonialForm,
} from "../../lib/testimonials";

export function useTestimonials() {
  const [me, setMe] = useState<User | null>(null);
  const [items, setItems] = useState<Testimonial[]>([]);
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

        const data = await fetchTestimonials();
        if (cancel) return;
        setItems(data);
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

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (x) =>
        x.name.toLowerCase().includes(s) ||
        x.text.toLowerCase().includes(s),
    );
  }, [items, search]);

  async function createItem(form: TestimonialForm): Promise<Testimonial> {
    const created = await createTestimonial(form);
    setItems((prev) => [created, ...prev]);
    return created;
  }

  async function updateItem(
    id: string,
    form: TestimonialForm,
  ): Promise<Testimonial> {
    const updated = await updateTestimonial(id, form);
    setItems((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i)),
    );
    return updated;
  }

  async function removeItem(id: string): Promise<void> {
    await deleteTestimonial(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function toggleVisible(item: Testimonial): Promise<Testimonial> {
    const updated = await updateTestimonial(item.id, {
      visible: !item.visible,
    });
    setItems((prev) =>
      prev.map((x) => (x.id === updated.id ? updated : x)),
    );
    return updated;
  }

  return {
    me,
    items,
    loading,
    err,
    search,
    setSearch,
    canWrite,
    filtered,
    createItem,
    updateItem,
    removeItem,
    toggleVisible,
  };
}
