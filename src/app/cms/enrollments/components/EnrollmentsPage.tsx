"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/modal/Modal";
import { useEnrollments } from "@/hooks/useEnrollments";
import ClassesSection from "./ClassesSection";
import UsersSidebar from "./UsersSidebar";

export default function EnrollmentsPage() {
  const {
    loading,
    loadingEnrollments,
    loadingMore,
    error,
    users,
    classes,
    packages,
    filteredUsers,
    selUser,
    selectedUserId,
    activeClassIds,
    hasChanges,
    hasMore,
    saving,
    q,
    setQ,
    setSelectedUserId,
    toggleClass,
    selectAllInPackage,
    loadMore,
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
            <div className="text-sm text-white/60">
              Kelola akses kelas peserta
            </div>
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
          hasMore={hasMore}
          loadingMore={loadingMore}
          onQueryChange={setQ}
          onSelectUser={setSelectedUserId}
          onLoadMore={loadMore}
        />

        <ClassesSection
          classes={classes}
          packages={packages}
          selUser={selUser}
          activeClassIds={activeClassIds}
          hasChanges={hasChanges}
          saving={saving}
          loadingEnrollments={loadingEnrollments}
          onToggleClass={toggleClass}
          onSelectPackage={selectAllInPackage}
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
