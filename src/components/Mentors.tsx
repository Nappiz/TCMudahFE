import MentorsClient from "./MentorsClient";

type Mentor = {
  id: string;
  name: string;
  angkatan: number;
  achievements: string[];
};

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";

export default async function Mentors() {
  let data: Mentor[] | null = null;
  try {
    const res = await fetch(`${API_BASE}/mentors`, { 
        next: { revalidate: 0 } 
    });
    const json = await res.json();
    data = Array.isArray(json) ? json : [];
  } catch {
      data = [];
  }

  return <MentorsClient data={data} />;
}