"use client";

import { useState } from "react";
import Modal from "@/components/modal/Modal";
import { useModal } from "@/components/ui/useModal";
import { useUserRoles } from "@/hooks/useUserRoles";
import type { User } from "../../../../../lib/admin";
import { labelRole } from "./roleLabel";
import { UserRoleHeader } from "./UserRoleHeader";
import { UserRoleTable } from "./UserRoleTable";

export default function UserRolePage() {
  const {
    me,
    loading,
    err,
    search,
    setSearch,
    canEdit,
    filtered,
    pending,
    saving,
    setPendingRole,
    saveUserRole,
    page,
    setPage,
    limit,
    total,
    roleFilter,
    setRoleFilter,
  } = useUserRoles();

  const successModal = useModal();
  const errorModal = useModal();
  const [successMsg, setSuccessMsg] = useState("Berhasil");
  const [errorMsg, setErrorMsg] = useState("Terjadi kesalahan");

  async function handleSave(user: User) {
    try {
      const updated = await saveUserRole(user);
      if (!updated) return;

      setSuccessMsg(
        "Role " +
          user.full_name +
          " diperbarui menjadi " +
          labelRole(updated.role) +
          ".",
      );
      successModal.onOpen();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMsg(`Gagal menyimpan: ${message}`);
      errorModal.onOpen();
    }
  }

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true">
        <output className="sr-only">Memuat data pengguna...</output>
        <div className="animate-pulse rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#121b28] to-[#0d131c] p-6">
          <div className="h-3 w-28 rounded bg-white/[0.08]" />
          <div className="mt-4 h-7 w-56 rounded-lg bg-white/[0.08]" />
          <div className="mt-3 h-4 max-w-sm rounded bg-white/[0.06]" />
          <div className="mt-8 h-11 rounded-xl bg-white/[0.05]" />
        </div>
        <div className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-[28px] border border-rose-300/[0.12] bg-gradient-to-br from-rose-300/[0.05] to-[#0d131c] p-6 sm:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-200/60">
          Pengguna &amp; akses
        </p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-white">
          Data pengguna belum dapat dimuat
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/55">{err}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <UserRoleHeader
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={(value) => {
          setRoleFilter(value);
          setPage(1);
        }}
        total={total}
      />

      <UserRoleTable
        me={me}
        canEdit={canEdit}
        filtered={filtered}
        pending={pending}
        saving={saving}
        onChangeRole={setPendingRole}
        onSaveRow={handleSave}
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      <Modal
        open={successModal.open}
        onClose={successModal.onClose}
        title="Berhasil"
        variant="success"
        actions={[
          {
            label: "Tutup",
            onClick: successModal.onClose,
            variant: "primary",
            autoFocus: true,
          },
        ]}
      >
        {successMsg}
      </Modal>

      <Modal
        open={errorModal.open}
        onClose={errorModal.onClose}
        title="Gagal"
        variant="error"
        actions={[
          {
            label: "Tutup",
            onClick: errorModal.onClose,
            variant: "danger",
            autoFocus: true,
          },
        ]}
      >
        {errorMsg}
      </Modal>
    </div>
  );
}
