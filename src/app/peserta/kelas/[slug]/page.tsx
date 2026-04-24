"use client";

import { useParams } from "next/navigation";
import KelasDetailPage from "./components/KelasDetailPage";

export default function Page() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return null;

  return <KelasDetailPage slug={slug} />;
}
