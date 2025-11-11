"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import Modal from "@/components/ui/Modal";
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
        `Role ${user.full_name} diperbarui menjadi ${labelRole(
          updated.role,
        )}.`,
      );
      successModal.onOpen();
    } catch (e: any) {
      setErrorMsg(`Gagal menyimpan: ${e?.message || "Unknown error"}`);
      errorModal.onOpen();
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse text-white/70">
        Memuat data user…
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-red-300">
        Terjadi kesalahan: {err}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserRoleHeader
        me={me}
        search={search}
        onSearchChange={setSearch}
      />

      <UserRoleTable
        me={me}
        canEdit={canEdit}
        filtered={filtered}
        pending={pending}
        saving={saving}
        onChangeRole={setPendingRole}
        onSaveRow={handleSave}
      />

      <div className="flex items-center gap-2 text-xs text-white/50">
        <Shield className="h-3.5 w-3.5" />
        <span>Tip: gunakan kolom pencarian untuk menemukan user dengan cepat.</span>
      </div>

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
