"use client";

import { useEffect, useState } from "react";
import { apiMaterialsByClass, fetchCatalog } from "../../lib/api";
import type { ClassMaterial, Catalog } from "@/types/catalog";

type UseClassMaterialsResult = {
  materials: ClassMaterial[];
  catalog: Catalog | null;
  loading: boolean;
  error: string | null;
};

export function useClassMaterials(ident: { id?: string; slug?: string } | undefined): UseClassMaterialsResult {
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ident || (!ident.id && !ident.slug)) return;

    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const c = await fetchCatalog();
        if (cancel) return;

        let resolvedId = ident.id;
        if (!resolvedId && ident.slug) {
            const decoded = decodeURIComponent(ident.slug);
            const found = c.classes.find(cls => 
                cls.title.toLowerCase().replace(/\s+/g, '-') === decoded ||
                encodeURIComponent(cls.title.toLowerCase().replace(/\s+/g, '-')) === ident.slug
            );
            if (!found) {
                setError("Kelas tidak ditemukan");
                setLoading(false);
                return;
            }
            resolvedId = found.id;
        }

        if (resolvedId) {
            const m = await apiMaterialsByClass(resolvedId);
            if (!cancel) {
                setMaterials(m);
                setCatalog(c);
            }
        }
      } catch (e: any) {
        if (cancel) return;
        setError(e?.message || "Gagal memuat materi.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [ident?.id, ident?.slug]);

  return { materials, catalog, loading, error };
}
