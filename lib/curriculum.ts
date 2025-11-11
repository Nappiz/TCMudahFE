import { api } from "./admin";

export type CurriculumItem = {
  id: string;
  code: string;
  name: string;
  sem: 1 | 2;
  blurb: string;
  created_at?: string;
};

export type CurriculumForm = {
  code: string;
  name: string;
  sem: 1 | 2;
  blurb: string;
};

export function fetchCurriculum() {
  return api<CurriculumItem[]>("/curriculum");
}

export function createCurriculumItem(body: CurriculumForm) {
  return api<CurriculumItem>("/curriculum", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateCurriculumItem(id: string, body: CurriculumForm) {
  return api<CurriculumItem>(`/curriculum/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteCurriculumItem(id: string) {
  // responsenya di-abaikan, sama kayak kode lama
  return api<unknown>(`/curriculum/${id}`, {
    method: "DELETE",
  });
}
