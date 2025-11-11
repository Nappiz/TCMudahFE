import { apiAdminFeedbackList, apiAdminFeedbackDelete } from "./api";

export type FeedbackItem = {
  id: string;
  class_id: string;
  text: string;
  rating?: number | null;
  created_at?: string;
  class_title?: string;
};

export async function fetchFeedback(classId?: string) {
  return apiAdminFeedbackList(classId) as Promise<FeedbackItem[]>;
}

export async function deleteFeedback(id: string) {
  return apiAdminFeedbackDelete(id);
}
