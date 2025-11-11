"use client";

import { GraduationCap, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ClassItem, User } from "../api/admin";

type Props = {
  classes: ClassItem[];
  selUser?: User;
  activeClassIds: Set<string>;
  hasChanges: boolean;
  saving: boolean;
  onToggleClass: (classId: string) => void;
  onSave: () => void;
};

export default function ClassesSection({
  classes,
  selUser,
  activeClassIds,
  hasChanges,
  saving,
  onToggleClass,
  onSave,
}: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
          <GraduationCap className="h-4 w-4" /> Kelas Aktif
        </div>
        <div className="text-xs text-white/60">
          {selUser ? (
            <>
              Untuk: <span className="text-white">{selUser.full_name}</span>{" "}
              <span className="text-white/50">({selUser.email})</span>
            </>
          ) : (
            "Pilih peserta di kiri"
          )}
        </div>
      </div>

      {!selUser ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/60">
          Pilih peserta terlebih dahulu.
        </div>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => {
              const checked = activeClassIds.has(c.id);
              return (
                <label
                  key={c.id}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer
                  ${
                    checked
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-emerald-400"
                    checked={checked}
                    onChange={() => onToggleClass(c.id)}
                  />
                  <CheckCircle2 className="h-4 w-4" />
                  {c.title}
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 text-xs text-white/60">
            {hasChanges && (
              <span className="mr-auto text-amber-300/80">
                Ada perubahan belum disimpan.
              </span>
            )}
            <Button
              variant="secondary"
              onClick={onSave}
              disabled={!selUser || saving || !hasChanges}
              className="inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan…" : "Simpan Perubahan"}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
