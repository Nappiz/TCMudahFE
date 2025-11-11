export type Role = "superadmin" | "admin" | "mentor" | "peserta";

export type User = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
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

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });

  if (!r.ok) {
    let msg = r.statusText;
    try {
      const j = await r.json();
      if (j?.detail) msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(msg);
  }

  return r.json() as Promise<T>;
}

export function fetchAdminUsers() {
  return api<User[]>("/admin/users");
}

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
