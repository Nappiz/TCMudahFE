"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../../lib/orders";

export function useOrders() {
  const [rows, setRows] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await fetchOrders();
        if (!cancel) setRows(data);
      } catch (e: any) {
        if (!cancel) setErr(e?.message ?? "Gagal memuat orders");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const pengirim = (r.user_name || r.user_email || "").toLowerCase();
      return (
        pengirim.includes(s) ||
        (r.status || "").toLowerCase().includes(s) ||
        (r.note || "").toLowerCase().includes(s)
      );
    });
  }, [rows, search]);

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
    filtered,
    search,
    setSearch,
    err,
    loading,
    rupiah,
    setStatus,
  };
}
