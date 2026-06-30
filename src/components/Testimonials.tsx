import TestimonialsClient from "./TestimonialsClient";

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";

export default async function Testimonials() {
  let items: any[] = [];
  try {
    const res = await fetch(`${API_BASE}/testimonials`, {
      next: { revalidate: 3600 },
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
        const data = await res.json();
        if(Array.isArray(data) && data.length > 0) items = data;
    }
  } catch (e) {
      console.error("Gagal load testimoni:", e);
  }

  if (items.length === 0) {
    return null;
  }

  return <TestimonialsClient items={items} />;
}