"use client";

import { useState } from "react";
import { ClassesHeader } from "./ClassesHeader";
import { ClassesTable } from "./ClassesTable";
import { ClassesListMobile } from "./ClassesListMobile";
import { ClassesFormModal, UnifiedForm } from "./ClassesFormModal";

import { useClasses } from "@/hooks/useClasses";

export default function ClassesPage() {
  const {
    mentors,
    curriculum,
    classes,
    packages = [],
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
  const [editing, setEditing] = useState<any | null>(null);

  const [form, setForm] = useState<UnifiedForm>({
    title: "",
    description: "",
    price: 0,
    visible: true,
    mentor_ids: [],
    curriculum_ids: [],
    class_ids: [],
  });
  const [saving, setSaving] = useState(false);

  const readonly = !canWrite;

  function openNew() {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      price: 0,
      visible: true,
      mentor_ids: mentors[0]?.id ? [mentors[0].id] : [],
      curriculum_ids: [],
      class_ids: [],
    });
    setModalOpen(true);
  }

  function openEdit(it: any) {
    setEditing(it);
    setForm({
      title: it.title,
      description: it.description,
      price: it.price,
      visible: it.visible,
      mentor_ids: it.mentor_ids || [],
      curriculum_ids: it.curriculum_ids || [],
      class_ids: it.class_ids || [],
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!canWrite) return;
    if (!form.title.trim()) {
      alert("Judul wajib diisi.");
      return;
    }

    if (activeTab === "class") {
      if (!form.mentor_ids.length) { alert("Pilih minimal 1 mentor."); return; }
      if (!form.curriculum_ids.length) { alert("Pilih minimal 1 kurikulum."); return; }
    } else {
      if (!form.class_ids.length) { alert("Pilih minimal 1 kelas untuk paket ini."); return; }
    }

    setSaving(true);
    try {

      if (editing) {
        await updateItem(editing.id, form, activeTab);
      } else {
        await createItem(form, activeTab);
      }
      setModalOpen(false);
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(it: any) {
    if (!canWrite) return;
    if (!window.confirm(`Hapus ${activeTab === 'package' ? 'paket' : 'kelas'} "${it.title}"?`)) return;
    try {
      await removeItem(it.id, activeTab);
    } catch (e: any) {
      alert(e?.message ?? "Gagal menghapus.");
    }
  }

  async function handleToggleVisible(it: any) {
    if (!canWrite) return;
    try {
      await toggleVisible(it, activeTab);
    } catch (e: any) {
      alert(e?.message ?? "Gagal memperbarui visibilitas.");
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

  const currentItems = activeTab === "class" ? filteredClasses : filteredPackages;

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
        Menampilkan {currentItems.length} {activeTab === "class" ? "Kelas" : "Paket"}
        {activeTab === "class" && ` • ${mentors.length} mentor • ${curriculum.length} kurikulum`}
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