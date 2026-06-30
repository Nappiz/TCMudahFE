import ProgramGridClient from "./ProgramGridClient";

type Item = {
  id: string;
  code: string;
  name: string;
  sem: 1 | 2;
  blurb: string;
};

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";

export default async function ProgramGrid() {
  let items: Item[] = [];
  try {
    const res = await fetch(`${API_BASE}/curriculum`, {
      next: { revalidate: 3600 },
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
        const data = await res.json();
        items = Array.isArray(data) ? data : [];
    }
  } catch (e) {
     console.error("Gagal load kurikulum", e);
  }

  return <ProgramGridClient initialItems={items} />;
}