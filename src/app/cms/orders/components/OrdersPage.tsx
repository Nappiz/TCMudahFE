"use client";

import { useState } from "react";
import { useGlobalError } from "@/components/providers/ErrorProvider";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useOrders } from "@/hooks/useOrders";
import type { Order, OrderStatus } from "../../../../../lib/orders";
import { OrderDetailModal } from "./OrderDetailModal";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";

export default function OrdersPage() {
  const { showError } = useGlobalError();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expireTarget, setExpireTarget] = useState<Order | null>(null);
  const [expiringId, setExpiringId] = useState<string | null>(null);
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
    } catch (errorValue: unknown) {
      showError(
        errorValue instanceof Error
          ? errorValue.message
          : "Gagal memperbarui status",
      );
    }
  }

  async function handleApprove() {
    if (!selectedOrder) return;
    setApproving(true);
    try {
      await setStatus(selectedOrder.id, "approved");
      setSelectedOrder(null);
    } catch (errorValue: unknown) {
      showError(
        errorValue instanceof Error
          ? errorValue.message
          : "Gagal menyetujui order",
      );
    } finally {
      setApproving(false);
    }
  }

  async function handleExpireConfirm() {
    if (!expireTarget || expiringId) return;
    const targetId = expireTarget.id;
    setExpiringId(targetId);
    try {
      await setStatus(targetId, "expired");
      setExpireTarget(null);
    } catch (errorValue: unknown) {
      showError(
        errorValue instanceof Error
          ? errorValue.message
          : "Gagal mengubah order menjadi expired",
      );
    } finally {
      setExpiringId(null);
    }
  }

  return (
    <div className="space-y-5 pb-6">
      <OrdersHeader
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
      />

      {loading ? (
        <OrdersLoadingState />
      ) : err ? (
        <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] p-5 text-sm text-rose-200">
          {err}
        </div>
      ) : (
        <OrdersTable
          rows={filtered}
          rupiah={rupiah}
          onSetStatus={handleSetStatus}
          onExpire={setExpireTarget}
          expiringId={expiringId}
          onView={setSelectedOrder}
          page={page}
          total={total}
          limit={limit}
          onPageChange={setPage}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          rupiah={rupiah}
          approving={approving}
          onClose={() => setSelectedOrder(null)}
          onApprove={handleApprove}
        />
      )}

      <ConfirmModal
        open={expireTarget !== null}
        onClose={() => {
          if (!expiringId) setExpireTarget(null);
        }}
        title="Expire order ini?"
        message={
          <div className="space-y-2">
            <p>
              Order dari{" "}
              <strong>
                {expireTarget?.user_name ||
                  expireTarget?.user_email ||
                  "peserta ini"}
              </strong>{" "}
              akan ditandai sebagai expired.
            </p>
            <p className="text-sm text-white/55">
              Status order berubah, tetapi akses enrollment yang sudah diberikan
              tetap tersimpan.
            </p>
          </div>
        }
        confirmText="Ya, expire order"
        cancelText="Batal"
        variant="danger"
        loading={expiringId !== null}
        onConfirm={handleExpireConfirm}
      />
    </div>
  );
}

function OrdersLoadingState() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c111a]/80">
      <div className="flex h-12 items-center gap-4 border-b border-white/[0.06] px-5">
        {[
          { id: "order", width: "w-16" },
          { id: "participant", width: "w-28" },
          { id: "total", width: "w-20" },
          { id: "status", width: "w-16" },
          { id: "action", width: "w-14" },
        ].map(({ id, width }) => (
          <div
            key={id}
            className={`h-2 animate-pulse rounded-full bg-white/[0.08] ${width}`}
          />
        ))}
      </div>
      <div className="space-y-1 p-2">
        {["one", "two", "three", "four", "five"].map((key) => (
          <div
            key={key}
            className="grid grid-cols-[1fr_1.4fr_1.2fr_0.7fr_0.7fr] gap-4 rounded-xl px-3 py-5"
          >
            {[
              { id: "order", width: "w-20" },
              { id: "participant", width: "w-36" },
              { id: "created", width: "w-28" },
              { id: "status", width: "w-16" },
              { id: "action", width: "w-14" },
            ].map(({ id, width }) => (
              <div
                key={id}
                className={`h-3 animate-pulse rounded-full bg-white/[0.06] ${width}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
