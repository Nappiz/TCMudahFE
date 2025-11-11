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

export type OrderStatus = "pending" | "approved" | "rejected" | "expired";

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
};

export type Enrollment = {
  id: string;
  user_id: string;
  class_id: string;
  active: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
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

export function fetchAdminUsers() {
  return api<User[]>("/admin/users");
}

/* ========= ROLE MANAGEMENT ========= */

export function updateUserRole(userId: string, role: Role) {
  return api<User>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

/* ========= ENROLLMENTS / CLASSES ========= */

export function fetchAdminClasses() {
  return api<ClassItem[]>("/admin/classes");
}

export function fetchApprovedOrders() {
  return api<Order[]>("/admin/orders?status=approved");
}

export function fetchUserEnrollments(userId: string) {
  return api<Enrollment[]>(`/admin/enrollments?user_id=${encodeURIComponent(userId)}`);
}

export function setUserEnrollments(userId: string, classIds: string[]) {
  return api<Enrollment[]>("/admin/enrollments/set", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, class_ids: classIds }),
  });
}
