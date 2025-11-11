import { api } from "./admin";

export type ClassItem = {
  id: string;
  title: string;
  description: string;
  mentor_ids: string[];
  curriculum_ids: string[];
  price: number;
  visible: boolean;
  created_at?: string;
};

export type ClassForm = {
  title: string;
  description: string;
  mentor_ids: string[];
  curriculum_ids: string[];
  price: number;
  visible: boolean;
};

export function fetchClasses() {
  return api<ClassItem[]>("/admin/classes");
}

export function createClassItem(body: ClassForm) {
  return api<ClassItem>("/admin/classes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateClassItem(id: string, body: ClassForm) {
  return api<ClassItem>(`/admin/classes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function patchClassVisibility(id: string, visible: boolean) {
  return api<ClassItem>(`/admin/classes/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ visible }),
  });
}

export function deleteClassItem(id: string) {
  return api<unknown>(`/admin/classes/${id}`, {
    method: "DELETE",
  });
}
