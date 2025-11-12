// src/hooks/useShortlinks.ts
"use client";

import { useEffect, useState } from "react";
import {
  apiAdminShortlinksList,
  apiAdminShortlinksCreate,
  apiAdminShortlinksUpdate,
  apiAdminShortlinksDelete,
  type Shortlink,
  type ShortlinkInput,
} from "../../lib/shortlinks";

type UseShortlinksResult = {
  rows: Shortlink[];
  loading: boolean;
  error: string | null;
  setRows: React.Dispatch<React.SetStateAction<Shortlink[]>>;
  createShortlink: (data: ShortlinkInput) => Promise<Shortlink>;
  updateShortlink: (id: string, data: ShortlinkInput) => Promise<Shortlink>;
  deleteShortlink: (id: string) => Promise<void>;
};

export function useShortlinks(): UseShortlinksResult {
  const [rows, setRows] = useState<Shortlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiAdminShortlinksList();
        if (!cancel) setRows(data);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Gagal memuat shortlinks.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  async function createShortlink(data: ShortlinkInput): Promise<Shortlink> {
    const created = await apiAdminShortlinksCreate(data);
    setRows((prev) => [created, ...prev]);
    return created;
  }

  async function updateShortlink(
    id: string,
    data: ShortlinkInput
  ): Promise<Shortlink> {
    const updated = await apiAdminShortlinksUpdate(id, data);
    setRows((prev) => prev.map((x) => (x.id === id ? updated : x)));
    return updated;
  }

  async function deleteShortlink(id: string): Promise<void> {
    await apiAdminShortlinksDelete(id);
    setRows((prev) => prev.filter((x) => x.id !== id));
  }

  return { rows, loading, error, setRows, createShortlink, updateShortlink, deleteShortlink };
}
