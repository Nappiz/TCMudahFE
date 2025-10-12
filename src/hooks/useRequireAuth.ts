"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { Me } from "@/types/catalog";

export function useRequireAuth() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        await api<Me>("/me");
        if (!cancel) setChecked(true);
      } catch {
        router.replace("/login");
      }
    })();
    return () => {
      cancel = true;
    };
  }, [router]);

  return checked;
}
