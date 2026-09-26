import ProgramGridClient from "./ProgramGridClient";

type Item = {
  id: string;
  code: string;
  name: string;
  sem: 1 | 2;
  blurb: string;
};

type CatalogResponse = { curriculum: Item[] };

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";

export default async function ProgramGrid() {
  let items: Item[] = [];
  try {
    const res = await fetch(`${API_BASE}/catalog?_=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
    if (res.ok) {
      const data = (await res.json()) as CatalogResponse;
      items = Array.isArray(data.curriculum) ? data.curriculum : [];
    }
  } catch (e) {
    console.error("Gagal load kurikulum", e);
  }

  return <ProgramGridClient initialItems={items} />;
}
