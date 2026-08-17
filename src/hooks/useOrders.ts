"use client";

import { useEffect, useState } from "react";
import {
  fetchOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../../lib/orders";

export function useOrders() {
  const [rows, setRows] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetchOrders(page, limit, debouncedSearch, statusFilter);
        if (cancel) return;
        setRows(res.data);
        setTotal(res.total);
      } catch (e: any) {
        if (!cancel) setErr(e?.message ?? "Gagal memuat orders");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [page, limit, debouncedSearch, statusFilter]);

  const rupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  async function setStatus(id: string, status: Exclude<OrderStatus, "pending">) {
    const updated = await updateOrderStatus(id, status);
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    return updated;
  }

  return {
    rows,
    filtered: rows,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    limit,
    total,
    err,
    loading,
    rupiah,
    setStatus,
  };
}
