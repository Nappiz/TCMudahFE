import { api } from "./admin";

export type ClassItem = {
  id: string;
  title: string;
  description: string;
  mentor_ids: string[];
  curriculum_ids: string[];
  price: number;
  base_price_per_meeting: number;
  offers: ClassOffer[];
  visible: boolean;
  created_at?: string;
};

export type ClassOffer = {
  id?: string;
  class_id?: string;
  meeting_count: number;
  list_price: number;
  price: number;
  is_recommended: boolean;
  visible: boolean;
  sort_order: number;
};

export type ClassForm = {
  title: string;
  description: string;
  mentor_ids: string[];
  curriculum_ids: string[];
  price?: number;
  base_price_per_meeting: number;
  offers: ClassOffer[];
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
