import { apiAdminFeedbackDelete, apiAdminFeedbackList } from "./api";

export type FeedbackItem = {
  id: string;
  class_id: string;
  text: string;
  rating?: number | null;
  created_at?: string;
  class_title?: string;
};

export async function fetchFeedback(classId?: string, page = 1, limit = 20) {
  return apiAdminFeedbackList(classId, page, limit) as Promise<{
    total: number;
    data: FeedbackItem[];
  }>;
}

export async function deleteFeedback(id: string) {
  return apiAdminFeedbackDelete(id);
}
