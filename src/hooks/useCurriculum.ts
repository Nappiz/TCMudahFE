import { useEffect, useMemo, useState } from "react";
import { fetchMe, type User } from "../../lib/admin";
import {
  fetchCurriculum,
  createCurriculumItem,
  updateCurriculumItem,
  deleteCurriculumItem,
  type CurriculumItem,
  type CurriculumForm,
} from "../../lib/curriculum";

export function useCurriculum() {
  const [me, setMe] = useState<User | null>(null);
  const [items, setItems] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancel = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [meRes, data] = await Promise.all([fetchMe(), fetchCurriculum()]);
        if (cancel) return;
        setMe(meRes);
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
        x.code.toLowerCase().includes(s) ||
        x.name.toLowerCase().includes(s) ||
        String(x.sem).includes(s) ||
        x.blurb.toLowerCase().includes(s),
    );
  }, [items, search]);

  async function createItem(form: CurriculumForm): Promise<CurriculumItem> {
    const created = await createCurriculumItem(form);
    setItems((prev) => [created, ...prev]);
    return created;
  }

  async function updateItem(
    id: string,
    form: CurriculumForm,
  ): Promise<CurriculumItem> {
    const updated = await updateCurriculumItem(id, form);
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    return updated;
  }

  async function removeItem(id: string): Promise<void> {
    await deleteCurriculumItem(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
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
  };
}
