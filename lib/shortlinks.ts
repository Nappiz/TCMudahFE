// lib/shortlinks.ts
import { API_BASE, api, patchJSON, postJSON } from "./api";

export type Shortlink = {
  id: string;
  slug: string;
  url: string;
  title?: string | null;
  description?: string | null;
  active: boolean;
  clicks: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ShortlinkInput = {
  slug: string;
  url: string;
  title?: string;
  description?: string;
  active: boolean;
};

export async function apiAdminShortlinksList(
  page = 1,
  limit = 20,
  search = "",
): Promise<{ total: number; data: Shortlink[] }> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  return api<{ total: number; data: Shortlink[] }>(
    `/admin/shortlinks?${params.toString()}`,
  );
}

export async function apiAdminShortlinksCreate(
  payload: ShortlinkInput,
): Promise<Shortlink> {
  // pake helper postJSON lo
  return postJSON<Shortlink>("/admin/shortlinks", payload);
}

export async function apiAdminShortlinksUpdate(
  id: string,
  payload: ShortlinkInput,
): Promise<Shortlink> {
  return patchJSON<Shortlink>(
    `/admin/shortlinks/${encodeURIComponent(id)}`,
    payload,
  );
}

export async function apiAdminShortlinksDelete(id: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/admin/shortlinks/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
}

export async function apiResolveShortlink(
  slug: string,
): Promise<{ url: string }> {
  return api<{ url: string }>(`/shortlinks/${encodeURIComponent(slug)}`);
}
