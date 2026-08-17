"use client";

import { useOrders } from "@/hooks/useOrders";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";
import type { OrderStatus } from "../../../../../lib/orders";
import { useGlobalError } from "@/components/providers/ErrorProvider";

export default function OrdersPage() {
  const { showError } = useGlobalError();
  const { filtered, search, setSearch, statusFilter, setStatusFilter, page, setPage, limit, total, err, loading, rupiah, setStatus } =
    useOrders();

  async function handleSetStatus(
    id: string,
    status: Exclude<OrderStatus, "pending">,
  ) {
    try {
      await setStatus(id, status);
    } catch (e: any) {
      showError(e?.message ?? "Gagal memperbarui status");
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
        Memuat orders…
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-red-300">
        {err}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <OrdersHeader 
        search={search} 
        onSearchChange={setSearch} 
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
      />

      <OrdersTable
        rows={filtered}
        rupiah={rupiah}
        onSetStatus={handleSetStatus}
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />
    </div>
  );
}
