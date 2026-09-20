export type Role = "superadmin" | "admin" | "mentor" | "peserta";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  // field lain (nim, dsb) biarin aja implicit.
};

export type ClassItem = {
  id: string;
  title: string;
};

export type Enrollment = {
  id: string;
  user_id: string;
  class_id: string;
  active: boolean;
};

export type EnrollmentBootstrap = {
  participants: User[];
  classes: ClassItem[];
  packages: PackageItem[];
  selected_user: User | null;
  active_class_ids: string[];
  next_cursor: string | null;
  has_more: boolean;
};

export type EnrollmentCandidates = {
  participants: User[];
  next_cursor: string | null;
  has_more: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail ?? res.statusText;
    } catch {
      detail = res.statusText;
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

/* ========= GENERAL ADMIN ========= */

export function fetchMe() {
  return api<User>("/me");
}

export function fetchAdminUsers(page = 1, limit = 20, search = "", role = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  return api<{ total: number; data: User[] }>(
    `/admin/users?${params.toString()}`,
  );
}

/* ========= ROLE MANAGEMENT ========= */

export function updateUserRole(userId: string, role: Role) {
  return api<User>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

/* ========= ENROLLMENTS / CLASSES ========= */

export type PackageItem = {
  id: string;
  title: string;
  class_ids: string[];
};

export function fetchEnrollmentBootstrap(options?: {
  userId?: string;
  q?: string;
  limit?: number;
  cursor?: string;
}) {
  const params = new URLSearchParams({ limit: String(options?.limit ?? 50) });
  if (options?.userId) params.set("user_id", options.userId);
  if (options?.q) params.set("q", options.q);
  if (options?.cursor) params.set("cursor", options.cursor);
  return api<EnrollmentBootstrap>(
    `/admin/enrollments/bootstrap?${params.toString()}`,
  );
}

export function fetchEnrollmentCandidates(options?: {
  q?: string;
  limit?: number;
  cursor?: string;
}) {
  const params = new URLSearchParams({ limit: String(options?.limit ?? 50) });
  if (options?.q) params.set("q", options.q);
  if (options?.cursor) params.set("cursor", options.cursor);
  return api<EnrollmentCandidates>(
    `/admin/enrollments/candidates?${params.toString()}`,
  );
}

export function fetchActiveClassIds(userId: string) {
  return api<{ class_ids: string[] }>(
    `/admin/enrollments/active-class-ids?user_id=${encodeURIComponent(userId)}`,
  );
}

export function setUserEnrollments(userId: string, classIds: string[]) {
  return api<Enrollment[]>("/admin/enrollments/set", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, class_ids: classIds }),
  });
}
