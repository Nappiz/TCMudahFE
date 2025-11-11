import { api } from "./admin";

export type Mentor = {
  id: string;
  name: string;
  angkatan: number;
  achievements: string[];
  visible: boolean;
};

export type MentorPayload = {
  name: string;
  angkatan: number;
  achievements: string[];
  visible: boolean;
};

export function fetchMentors() {
  return api<Mentor[]>("/admin/mentors");
}

export function createMentor(payload: MentorPayload) {
  return api<Mentor>("/admin/mentors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMentor(id: string, payload: MentorPayload) {
  return api<Mentor>(`/admin/mentors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteMentor(id: string) {
  return api<unknown>(`/admin/mentors/${id}`, {
    method: "DELETE",
  });
}
