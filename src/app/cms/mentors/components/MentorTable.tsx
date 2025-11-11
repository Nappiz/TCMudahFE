"use client";

import { Save, Trash2 } from "lucide-react";
import type { Mentor } from "../../../../../lib/mentors";

type Props = {
  list: Mentor[];
  isReadonly: boolean;
  onChangeList: (updater: (prev: Mentor[]) => Mentor[]) => void;
  onSaveRow: (mentor: Mentor) => void;
  onDeleteRow: (mentor: Mentor) => void;
};

export function MentorTable({
  list,
  isReadonly,
  onChangeList,
  onSaveRow,
  onDeleteRow,
}: Props) {
  const disabledAll = isReadonly;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-white/5 text-white/70">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Nama</th>
            <th className="px-4 py-3 text-left font-medium">Angkatan</th>
            <th className="px-4 py-3 text-left font-medium">Prestasi (1–5)</th>
            <th className="px-4 py-3 text-left font-medium">Tampil</th>
            <th className="px-4 py-3 text-left font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {list.map((row) => {
            const disabled = disabledAll;

            return (
              <tr key={row.id} className="bg-white/[0.03]">
                <td className="px-4 py-3">
                  <input
                    className="w-56 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-white/90 outline-none placeholder:text-white/40 disabled:opacity-60"
                    value={row.name}
                    onChange={(e) =>
                      onChangeList((prev) =>
                        prev.map((x) =>
                          x.id === row.id ? { ...x, name: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="Nama"
                    disabled={disabled}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    className="w-28 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-white/90 outline-none disabled:opacity-60"
                    value={row.angkatan}
                    onChange={(e) =>
                      onChangeList((prev) =>
                        prev.map((x) =>
                          x.id === row.id
                            ? { ...x, angkatan: Number(e.target.value) }
                            : x,
                        ),
                      )
                    }
                    disabled={disabled}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {row.achievements.map((a, i) => (
                      <input
                        key={i}
                        className="w-64 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-white/90 outline-none placeholder:text-white/40 disabled:opacity-60"
                        value={a}
                        onChange={(e) =>
                          onChangeList((prev) =>
                            prev.map((x) =>
                              x.id === row.id
                                ? {
                                    ...x,
                                    achievements: x.achievements.map(
                                      (y, yi) =>
                                        yi === i ? e.target.value : y,
                                    ),
                                  }
                                : x,
                            ),
                          )
                        }
                        placeholder={`Prestasi ${i + 1}`}
                        disabled={disabled}
                      />
                    ))}
                    {!disabled && row.achievements.length < 5 && (
                      <button
                        onClick={() =>
                          onChangeList((prev) =>
                            prev.map((x) =>
                              x.id === row.id
                                ? {
                                    ...x,
                                    achievements: [...x.achievements, ""],
                                  }
                                : x,
                            ),
                          )
                        }
                        className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/15"
                      >
                        + Tambah
                      </button>
                    )}
                    {!disabled && row.achievements.length > 1 && (
                      <button
                        onClick={() =>
                          onChangeList((prev) =>
                            prev.map((x) =>
                              x.id === row.id
                                ? {
                                    ...x,
                                    achievements: x.achievements.slice(0, -1),
                                  }
                                : x,
                            ),
                          )
                        }
                        className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/15"
                      >
                        − Hapus terakhir
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-cyan-400"
                    checked={row.visible}
                    onChange={(e) =>
                      onChangeList((prev) =>
                        prev.map((x) =>
                          x.id === row.id
                            ? { ...x, visible: e.target.checked }
                            : x,
                        ),
                      )
                    }
                    disabled={disabled}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={disabled}
                      onClick={() => onSaveRow(row)}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-white/90 hover:bg-white/15 disabled:opacity-60"
                      title="Simpan"
                    >
                      <Save className="h-4 w-4" /> Simpan
                    </button>
                    <button
                      disabled={disabled}
                      onClick={() => onDeleteRow(row)}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-white/90 hover:bg-white/15 disabled:opacity-60"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
