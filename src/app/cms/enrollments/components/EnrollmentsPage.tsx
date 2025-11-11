"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import UsersSidebar from "./UsersSidebar";
import ClassesSection from "./ClassesSection";
import { useEnrollments } from "@/hooks/useEnrollments";

export default function EnrollmentsPage() {
  const {
    loading,
    error,
    users,
    classes,
    filteredUsers,
    selUser,
    selectedUserId,
    activeClassIds,
    hasChanges,
    saving,
    q,
    setQ,
    setSelectedUserId,
    toggleClass,
    save,
    reload,
    modalOpen,
    modalVariant,
    modalTitle,
    modalMessage,
    closeModal,
  } = useEnrollments();

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-white/60">Kelola akses kelas peserta</div>
            <h1 className="text-xl font-bold text-white">Enrollments</h1>
            <p className="text-white/70 text-sm">
              Daftar menampilkan peserta dengan order <b>approved</b>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={reload}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Muat Ulang
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-[340px_1fr]">
        <UsersSidebar
          loading={loading}
          users={users}
          filteredUsers={filteredUsers}
          selectedUserId={selectedUserId}
          q={q}
          onQueryChange={setQ}
          onSelectUser={setSelectedUserId}
        />

        <ClassesSection
          classes={classes}
          selUser={selUser}
          activeClassIds={activeClassIds}
          hasChanges={hasChanges}
          saving={saving}
          onToggleClass={toggleClass}
          onSave={save}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        variant={modalVariant}
        actions={[
          {
            label: "OK",
            onClick: closeModal,
            variant: "primary",
            autoFocus: true,
          },
        ]}
      >
        <p className="text-sm text-white/80">{modalMessage}</p>
      </Modal>
    </div>
  );
}
