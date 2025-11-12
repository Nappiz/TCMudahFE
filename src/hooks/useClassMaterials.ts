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

export function useClassMaterials(classId: string | undefined): UseClassMaterialsResult {
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) return;

    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [m, c] = await Promise.all([
          apiMaterialsByClass(classId),
          fetchCatalog(),
        ]);
        if (cancel) return;
        setMaterials(m);
        setCatalog(c);
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
  }, [classId]);

  return { materials, catalog, loading, error };
}
