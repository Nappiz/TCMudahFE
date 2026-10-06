import { API_BASE } from "../../lib/api";
import MentorsClient from "./MentorsClient";

type Mentor = {
  id: string;
  name: string;
  angkatan: number;
  achievements: string[];
};

type CatalogResponse = { mentors: Mentor[] };

export default async function Mentors() {
  let data: Mentor[] | null = null;
  try {
    const res = await fetch(`${API_BASE}/catalog?_=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
    const json = (await res.json()) as CatalogResponse;
    data = Array.isArray(json.mentors) ? json.mentors : [];
  } catch {
    data = [];
  }

  return <MentorsClient data={data} />;
}
