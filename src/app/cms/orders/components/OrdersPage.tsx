"use client";

import { useState } from "react";
import { useGlobalError } from "@/components/providers/ErrorProvider";
import { useOrders } from "@/hooks/useOrders";
import type { Order, OrderStatus } from "../../../../../lib/orders";
import { OrderDetailModal } from "./OrderDetailModal";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";

export default function OrdersPage() {
  const { showError } = useGlobalError();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [approving, setApproving] = useState(false);
  const {
    filtered,
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
  } = useOrders();

  async function handleSetStatus(
    id: string,
    status: Exclude<OrderStatus, "pending">,
  ) {
    try {
      await setStatus(id, status);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Gagal memperbarui status");
    }
  }

  async function handleApprove() {
    if (!selectedOrder) return;
    setApproving(true);
    try {
      await setStatus(selectedOrder.id, "approved");
      setSelectedOrder(null);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Gagal menyetujui order");
    } finally {
      setApproving(false);
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
        onView={setSelectedOrder}
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          rupiah={rupiah}
          approving={approving}
          onClose={() => setSelectedOrder(null)}
          onApprove={handleApprove}
        />
      )}
    </div>
  );
}
