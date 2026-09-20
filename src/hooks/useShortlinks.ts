// src/hooks/useShortlinks.ts
"use client";

import { useEffect, useState } from "react";
import {
  apiAdminShortlinksCreate,
  apiAdminShortlinksDelete,
  apiAdminShortlinksList,
  apiAdminShortlinksUpdate,
  type Shortlink,
  type ShortlinkInput,
} from "../../lib/shortlinks";

type UseShortlinksResult = {
  rows: Shortlink[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  total: number;
  limit: number;
  setRows: React.Dispatch<React.SetStateAction<Shortlink[]>>;
  createShortlink: (data: ShortlinkInput) => Promise<Shortlink>;
  updateShortlink: (id: string, data: ShortlinkInput) => Promise<Shortlink>;
  deleteShortlink: (id: string) => Promise<void>;
};

export function useShortlinks(): UseShortlinksResult {
  const [rows, setRows] = useState<Shortlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiAdminShortlinksList(
          page,
          limit,
          debouncedSearch,
        );
        if (!cancel) {
          setRows(result.data);
          setTotal(result.total);
        }
      } catch (error: unknown) {
        if (!cancel)
          setError(
            error instanceof Error ? error.message : "Gagal memuat shortlinks.",
          );
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [debouncedSearch, page]);

  async function createShortlink(data: ShortlinkInput): Promise<Shortlink> {
    const created = await apiAdminShortlinksCreate(data);
    setTotal((value) => value + 1);
    if (page === 1) setRows((prev) => [created, ...prev].slice(0, limit));
    else setPage(1);
    return created;
  }

  async function updateShortlink(
    id: string,
    data: ShortlinkInput,
  ): Promise<Shortlink> {
    const updated = await apiAdminShortlinksUpdate(id, data);
    setRows((prev) => prev.map((x) => (x.id === id ? updated : x)));
    return updated;
  }

  async function deleteShortlink(id: string): Promise<void> {
    await apiAdminShortlinksDelete(id);
    setRows((prev) => prev.filter((x) => x.id !== id));
    setTotal((value) => Math.max(0, value - 1));
  }

  return {
    rows,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    total,
    limit,
    setRows,
    createShortlink,
    updateShortlink,
    deleteShortlink,
  };
}
