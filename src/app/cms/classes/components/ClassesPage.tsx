"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { useClasses } from "@/hooks/useClasses";
import type { ClassItem, ClassForm } from "../../../../../lib/classes";

import { ClassesHeader } from "./ClassesHeader";
import { ClassesTable } from "./ClassesTable";
import { ClassesListMobile } from "./ClassesListMobile";
import { ClassesFormModal } from "./ClassesFormModal";

export default function ClassesPage() {
  const {
    me,
    mentors,
    curriculum,
    loading,
    err,
    canWrite,
    search,
    setSearch,
    filtered,
    idxMentor,
    idxCurriculum,
    rupiah,
    createItem,
    updateItem,
    removeItem,
    toggleVisible,
  } = useClasses();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [form, setForm] = useState<ClassForm>({
    title: "",
    description: "",
    mentor_ids: [],
    curriculum_ids: [],
    price: 0,
    visible: true,
  });
  const [saving, setSaving] = useState(false);

  const readonly = !canWrite;

  function openNew() {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      mentor_ids: mentors[0]?.id ? [mentors[0].id] : [],
      curriculum_ids: [],
      price: 0,
      visible: true,
    });
    setModalOpen(true);
  }

  function openEdit(it: ClassItem) {
    setEditing(it);
    setForm({
      title: it.title,
      description: it.description,
      mentor_ids: [...(it.mentor_ids || [])],
      curriculum_ids: [...it.curriculum_ids],
      price: it.price,
      visible: it.visible,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!canWrite) return;
    if (!form.title.trim()) {
      alert("Judul wajib diisi.");
      return;
    }
    if (!form.mentor_ids.length) {
      alert("Pilih minimal 1 mentor.");
      return;
    }
    if (!form.curriculum_ids.length) {
      alert("Pilih minimal 1 kurikulum.");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateItem(editing.id, form);
      } else {
        await createItem(form);
      }
      setModalOpen(false);
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(it: ClassItem) {
    if (!canWrite) return;
    if (!window.confirm(`Hapus kelas "${it.title}"?`)) return;
    try {
      await removeItem(it.id);
    } catch (e: any) {
      alert(e?.message ?? "Gagal menghapus.");
    }
  }

  async function handleToggleVisible(it: ClassItem) {
    if (!canWrite) return;
    try {
      await toggleVisible(it);
    } catch (e: any) {
      alert(e?.message ?? "Gagal memperbarui visibilitas.");
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse text-white/70">
        Memuat kelas…
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
    <div className="space-y-5">
      <ClassesHeader
        canWrite={canWrite}
        search={search}
        onSearchChange={setSearch}
        onAdd={openNew}
      />

      <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70">
        {filtered.length} item • {mentors.length} mentor •{" "}
        {curriculum.length} kurikulum
      </div>

      <ClassesTable
        items={filtered}
        readonly={readonly}
        rupiah={rupiah}
        idxMentor={idxMentor}
        idxCurriculum={idxCurriculum}
        onToggleVisible={handleToggleVisible}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <ClassesListMobile
        items={filtered}
        readonly={readonly}
        rupiah={rupiah}
        idxMentor={idxMentor}
        idxCurriculum={idxCurriculum}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <ClassesFormModal
        open={modalOpen}
        editing={editing}
        form={form}
        mentors={mentors}
        curriculum={curriculum}
        saving={saving}
        onChangeForm={setForm}
        onClose={() => !saving && setModalOpen(false)}
        onSubmit={handleSave}
      />
    </div>
  );
}
