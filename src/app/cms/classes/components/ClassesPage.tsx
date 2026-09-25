"use client";

import { useState } from "react";
import { useGlobalError } from "@/components/providers/ErrorProvider";
import { useClasses } from "@/hooks/useClasses";
import type { ClassItem } from "../../../../../lib/classes";
import type { PackageItem } from "../../../../../lib/packages";
import { ClassesFormModal, type UnifiedForm } from "./ClassesFormModal";
import { ClassesHeader } from "./ClassesHeader";
import { ClassesListMobile } from "./ClassesListMobile";
import { ClassesTable } from "./ClassesTable";

export default function ClassesPage() {
  const { showError } = useGlobalError();
  const {
    mentors,
    curriculum,
    classes,
    loading,
    err,
    canWrite,
    search,
    setSearch,
    filteredClasses = [],
    filteredPackages = [],
    idxMentor,
    idxCurriculum,
    rupiah,
    createItem,
    updateItem,
    removeItem,
    toggleVisible,
  } = useClasses();

  const [activeTab, setActiveTab] = useState<"class" | "package">("class");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassItem | PackageItem | null>(null);

  const [form, setForm] = useState<UnifiedForm>({
    title: "",
    description: "",
    price: 0,
    base_price_per_meeting: 0,
    offers: [],
    visible: true,
    mentor_ids: [],
    curriculum_ids: [],
    class_ids: [],
    items: [],
  });
  const [saving, setSaving] = useState(false);

  const readonly = !canWrite;

  function openNew() {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      price: 0,
      base_price_per_meeting: 0,
      offers: [
        {
          meeting_count: 2,
          list_price: 0,
          price: 0,
          is_recommended: false,
          visible: true,
          sort_order: 0,
        },
        {
          meeting_count: 6,
          list_price: 0,
          price: 0,
          is_recommended: true,
          visible: true,
          sort_order: 1,
        },
      ],
      visible: true,
      mentor_ids: mentors[0]?.id ? [mentors[0].id] : [],
      curriculum_ids: [],
      class_ids: [],
      items: [],
    });
    setModalOpen(true);
  }

  function openEdit(it: ClassItem | PackageItem) {
    setEditing(it);
    setForm({
      title: it.title,
      description: it.description,
      price: it.price,
      base_price_per_meeting:
        "base_price_per_meeting" in it ? it.base_price_per_meeting : 0,
      offers: "offers" in it ? it.offers : [],
      visible: it.visible,
      mentor_ids: "mentor_ids" in it ? it.mentor_ids : [],
      curriculum_ids: "curriculum_ids" in it ? it.curriculum_ids : [],
      class_ids: "class_ids" in it ? it.class_ids : [],
      items: "items" in it ? it.items : [],
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!canWrite) return;
    if (!form.title.trim()) {
      showError("Judul wajib diisi.");
      return;
    }

    if (activeTab === "class") {
      if (!form.mentor_ids.length) {
        showError("Pilih minimal 1 mentor.");
        return;
      }
      if (!form.curriculum_ids.length) {
        showError("Pilih minimal 1 kurikulum.");
        return;
      }
      if (!form.offers.length) {
        showError("Tambahkan minimal 1 pilihan pertemuan.");
        return;
      }
      if (
        new Set(form.offers.map((offer) => offer.meeting_count)).size !==
        form.offers.length
      ) {
        showError("Jumlah pertemuan tidak boleh duplikat.");
        return;
      }
      if (form.offers.some((offer) => offer.price > offer.list_price)) {
        showError("Harga jual tidak boleh melebihi harga normal.");
        return;
      }
    } else {
      if (!form.class_ids.length) {
        showError("Pilih minimal 1 kelas untuk paket ini.");
        return;
      }
      if (form.items.length !== form.class_ids.length) {
        showError("Pilih jumlah pertemuan untuk setiap kelas dalam bundle.");
        return;
      }
    }

    setSaving(true);
    try {
      if (editing) {
        await updateItem(editing.id, form, activeTab);
      } else {
        await createItem(form, activeTab);
      }
      setModalOpen(false);
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(it: ClassItem | PackageItem) {
    if (!canWrite) return;
    if (
      !window.confirm(
        `Hapus ${activeTab === "package" ? "paket" : "kelas"} "${it.title}"?`,
      )
    )
      return;
    try {
      await removeItem(it.id, activeTab);
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "Gagal menghapus.");
    }
  }

  async function handleToggleVisible(it: ClassItem | PackageItem) {
    if (!canWrite) return;
    try {
      await toggleVisible(it, activeTab);
    } catch (error: unknown) {
      showError(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui visibilitas.",
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse text-white/70">
        Memuat data katalog…
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-white/10 bg-red-500/10 p-5 text-red-300 border border-red-500/20">
        Terjadi kesalahan: {err}
      </div>
    );
  }

  const currentItems =
    activeTab === "class" ? filteredClasses : filteredPackages;

  return (
    <div className="space-y-5">
      <ClassesHeader
        canWrite={canWrite}
        search={search}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearchChange={setSearch}
        onAdd={openNew}
      />

      <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70">
        Menampilkan {currentItems.length}{" "}
        {activeTab === "class" ? "Kelas" : "Paket"}
        {activeTab === "class" &&
          ` • ${mentors.length} mentor • ${curriculum.length} kurikulum`}
      </div>

      <ClassesTable
        mode={activeTab}
        items={currentItems}
        allClasses={classes || []}
        readonly={readonly}
        rupiah={rupiah}
        idxMentor={idxMentor}
        idxCurriculum={idxCurriculum}
        onToggleVisible={handleToggleVisible}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <ClassesListMobile
        mode={activeTab}
        items={currentItems}
        allClasses={classes || []}
        readonly={readonly}
        rupiah={rupiah}
        idxMentor={idxMentor}
        idxCurriculum={idxCurriculum}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <ClassesFormModal
        open={modalOpen}
        mode={activeTab}
        editing={editing}
        form={form}
        mentors={mentors}
        curriculum={curriculum}
        availableClasses={classes || []}
        saving={saving}
        onChangeForm={setForm}
        onClose={() => !saving && setModalOpen(false)}
        onSubmit={handleSave}
      />
    </div>
  );
}
