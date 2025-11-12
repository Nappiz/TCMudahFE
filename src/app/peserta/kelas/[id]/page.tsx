"use client";

import { useParams } from "next/navigation";
import KelasDetailPage from "./components/KelasDetailPage";

export default function Page() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return <KelasDetailPage classId={id} />;
}
