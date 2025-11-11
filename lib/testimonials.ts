import { api } from "./admin";

export type Testimonial = {
  id: string;
  name: string;
  text: string;
  visible: boolean;
  created_at?: string;
};

export type TestimonialForm = {
  name: string;
  text: string;
  visible: boolean;
};

export function fetchTestimonials() {
  return api<Testimonial[]>("/admin/testimonials");
}

export function createTestimonial(body: TestimonialForm) {
  return api<Testimonial>("/admin/testimonials", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateTestimonial(id: string, body: Partial<TestimonialForm>) {
  return api<Testimonial>(`/admin/testimonials/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteTestimonial(id: string) {
  return api<unknown>(`/admin/testimonials/${id}`, {
    method: "DELETE",
  });
}
