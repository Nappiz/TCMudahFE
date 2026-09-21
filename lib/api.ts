import type {
  Catalog,
  CheckoutInfo,
  ClassItem,
  ClassMaterial,
  Enrollment,
} from "@/types/catalog";
import type { User } from "@/types/user";

export const API_BASE =
  typeof window === "undefined"
    ? process.env.BACKEND_URL || "http://localhost:8000"
    : "/api";

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

export async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j?.detail)
        msg =
          typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json() as Promise<T>;
}

export async function patchJSON<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json() as Promise<T>;
}

export async function deleteJSON<T = { ok: boolean }>(
  path: string,
): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json() as Promise<T>;
}

export async function uploadFile(file: File): Promise<string> {
  const intent = await postJSON<{
    signed_url: string;
    path: string;
    expires_at: string;
    max_size_bytes: number;
  }>("/orders/upload-intent", {
    content_type: file.type,
    size_bytes: file.size,
  });

  const form = new FormData();
  form.append("file", file);
  const upload = await fetch(intent.signed_url, {
    method: "PUT",
    body: form,
  });
  if (!upload.ok) {
    throw new Error("Gagal mengunggah bukti pembayaran ke storage.");
  }
  return intent.path;
}

export async function fetchCatalog(): Promise<Catalog> {
  const response = await fetch(`${API_BASE}/catalog`, {
    credentials: "omit",
    cache: "default",
  });
  return json<Catalog>(response);
}

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
  const res = await fetch(`${API_BASE}/enrollments/me`, {
    credentials: "include",
  });
  return json<Enrollment[]>(res);
}

export async function apiMaterialsByClass(
  classId: string,
): Promise<ClassMaterial[]> {
  const res = await fetch(
    `${API_BASE}/materials?class_id=${encodeURIComponent(classId)}`,
    {
      credentials: "include",
    },
  );
  return json<ClassMaterial[]>(res);
}

export async function apiSetUserEnrollmentsByPackage(payload: {
  user_id: string;
  package_id: string;
}): Promise<Enrollment[]> {
  const res = await fetch(`${API_BASE}/admin/enrollments/set-by-package`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<Enrollment[]>(res);
}

export async function apiAdminMaterialsByClass(
  classId: string,
): Promise<ClassMaterial[]> {
  const res = await fetch(
    `${API_BASE}/admin/materials?class_id=${encodeURIComponent(classId)}`,
    {
      credentials: "include",
    },
  );
  return json<ClassMaterial[]>(res);
}

export async function apiCreateMaterial(payload: {
  class_id: string;
  title: string;
  type: "video" | "ppt";
  url: string;
  visible?: boolean;
}): Promise<ClassMaterial> {
  const res = await fetch(`${API_BASE}/admin/materials`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<ClassMaterial>(res);
}

export async function apiUpdateMaterial(
  id: string,
  patch: { title?: string; visible?: boolean },
): Promise<ClassMaterial> {
  const res = await fetch(
    `${API_BASE}/admin/materials/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
  return json<ClassMaterial>(res);
}

export async function apiDeleteMaterial(id: string) {
  const res = await fetch(
    `${API_BASE}/admin/materials/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  return json<{ ok: boolean }>(res);
}

export async function apiAdminClassById(id: string): Promise<ClassItem> {
  const res = await fetch(
    `${API_BASE}/admin/classes/${encodeURIComponent(id)}`,
    {
      credentials: "include",
    },
  );
  return json<ClassItem>(res);
}

// ==== FEEDBACK (anon) ====

export async function apiCreateOrUpdateFeedback(payload: {
  class_id: string;
  text: string;
  rating?: number | null;
}) {
  const r = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json();
}

export async function apiMyFeedbacks() {
  const r = await fetch(`${API_BASE}/feedback/me`, { credentials: "include" });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json();
}

export async function apiAdminFeedbackList(
  classId?: string,
  page = 1,
  limit = 20,
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (classId) params.set("class_id", classId);
  const r = await fetch(`${API_BASE}/admin/feedback?${params.toString()}`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json() as Promise<{ total: number; data: unknown[] }>;
}

export async function apiAdminFeedbackDelete(id: string) {
  const r = await fetch(
    `${API_BASE}/admin/feedback/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json();
}
