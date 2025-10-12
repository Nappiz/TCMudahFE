import type { User } from "@/types/user";
import type {
  Catalog,
  Mentor,
  Curriculum,
  ClassItem,
  CheckoutInfo,
  Enrollment,
  ClassMaterial,
} from "@/types/catalog";

export const API_BASE = "/api";

/** Low-level JSON helper used by some auth calls */
async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const body = await res.json();
      msg = (body?.detail as string) || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/** Generic GET helper (includes credentials) */
export async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j?.detail) msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

/** Generic POST JSON helper (includes credentials) */
export async function postJSON<T>(path: string, body: any): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json() as Promise<T>;
}

/** Upload file (payment proof) -> returns public URL */
export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${API_BASE}/orders/upload`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  const j = await r.json();
  return j.url as string;
}

/** Fetch public catalog for daftar-kelas */
export async function fetchCatalog(): Promise<Catalog> {
  const [mentors, curriculum, classes] = await Promise.all([
    api<Mentor[]>("/mentors"),
    api<Curriculum[]>("/curriculum"),
    api<ClassItem[]>("/classes"),
  ]);
  return { mentors, curriculum, classes };
}

/** Fetch checkout info (bank, account, holder, group link) */
export async function fetchCheckoutInfo(): Promise<CheckoutInfo> {
  return api<CheckoutInfo>("/checkout/info");
}

/* =========================
 * Auth-specific functions
 * ========================= */

export async function apiRegister(payload: {
  full_name: string;
  nim?: string;
  email: string;
  password: string;
}): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return json<User>(res);
}

export async function apiLogin(payload: {
  email: string;
  password: string;
}): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return json<User>(res);
}

export async function apiLogout(): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return json<{ ok: boolean }>(res);
}

export async function apiMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/me`, {
    method: "GET",
    credentials: "include",
  });
  return json<User>(res);
}

/* =========================
 * Enrollments / Materials
 * ========================= */

export async function apiMyEnrollments(): Promise<Enrollment[]> {
  const res = await fetch(`${API_BASE}/enrollments/me`, { credentials: "include" });
  return json<Enrollment[]>(res);
}

/** PESERTA: ambil materi visible untuk kelas tertentu */
export async function apiMaterialsByClass(classId: string): Promise<ClassMaterial[]> {
  const res = await fetch(`${API_BASE}/materials?class_id=${encodeURIComponent(classId)}`, {
    credentials: "include",
  });
  return json<ClassMaterial[]>(res);
}

/** ADMIN / MENTOR */
export async function apiSetUserEnrollments(payload: { user_id: string; class_ids: string[] }) {
  const res = await fetch(`${API_BASE}/admin/enrollments/set`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<any>(res);
}

/** ADMIN: list materials by class */
export async function apiAdminMaterialsByClass(classId: string): Promise<ClassMaterial[]> {
  const res = await fetch(`${API_BASE}/admin/materials?class_id=${encodeURIComponent(classId)}`, {
    credentials: "include",
  });
  return json<ClassMaterial[]>(res);
}

/** ADMIN: create material (link Drive/YouTube/Slides) */
export async function apiCreateMaterial(payload: {
  class_id: string;
  title: string;
  type: "video" | "ppt";
  url: string;
  visible?: boolean;
}) {
  const res = await fetch(`${API_BASE}/admin/materials`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<any>(res);
}

/** ADMIN: update material (title/visible) */
export async function apiUpdateMaterial(id: string, patch: { title?: string; visible?: boolean }) {
  const res = await fetch(`${API_BASE}/admin/materials/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return json<any>(res);
}

/** ADMIN: delete material */
export async function apiDeleteMaterial(id: string) {
  const res = await fetch(`${API_BASE}/admin/materials/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  return json<{ ok: boolean }>(res);
}

/** ADMIN: get 1 class by id (dipakai CMS materials header) */
export async function apiAdminClassById(id: string): Promise<ClassItem> {
  const res = await fetch(`${API_BASE}/admin/classes/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  return json<ClassItem>(res);
}
