import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export type NotificationsSummary = {
  new_orders: number;
  new_users: number;
  new_feedbacks: number;
};

export function useNotifications() {
  const [data, setData] = useState<NotificationsSummary>({ new_orders: 0, new_users: 0, new_feedbacks: 0 });
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      // Default to 7 days ago if not set
      const defaultDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      let lastSeenUsers = localStorage.getItem("cms_last_seen_users");
      let lastSeenFeedbacks = localStorage.getItem("cms_last_seen_feedbacks");
      
      if (!lastSeenUsers) {
        lastSeenUsers = defaultDate;
        localStorage.setItem("cms_last_seen_users", defaultDate);
      }
      if (!lastSeenFeedbacks) {
        lastSeenFeedbacks = defaultDate;
        localStorage.setItem("cms_last_seen_feedbacks", defaultDate);
      }
      
      let url = "/admin/notifications/summary";
      const params = new URLSearchParams();
      params.append("last_seen_users", lastSeenUsers);
      params.append("last_seen_feedbacks", lastSeenFeedbacks);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await api<NotificationsSummary>(url);
      setData(res);
    } catch (error) {
      console.error("Failed to fetch notifications summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, fetchNotifications };
}
