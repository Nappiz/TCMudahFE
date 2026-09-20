"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../../lib/api";

export type NotificationsSummary = {
  new_orders: number;
  new_users: number;
  new_feedbacks: number;
};

type NotificationsContextValue = {
  data: NotificationsSummary;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);
const EMPTY_SUMMARY: NotificationsSummary = {
  new_orders: 0,
  new_users: 0,
  new_feedbacks: 0,
};
const POLL_INTERVAL_MS = 60_000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [data, setData] = useState<NotificationsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const inFlightRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (inFlightRef.current || document.visibilityState === "hidden") return;
    inFlightRef.current = true;
    try {
      const defaultDate = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const lastSeenUsers =
        localStorage.getItem("cms_last_seen_users") ?? defaultDate;
      const lastSeenFeedbacks =
        localStorage.getItem("cms_last_seen_feedbacks") ?? defaultDate;
      localStorage.setItem("cms_last_seen_users", lastSeenUsers);
      localStorage.setItem("cms_last_seen_feedbacks", lastSeenFeedbacks);

      const params = new URLSearchParams({
        last_seen_users: lastSeenUsers,
        last_seen_feedbacks: lastSeenFeedbacks,
      });
      setData(
        await api<NotificationsSummary>(
          `/admin/notifications/summary?${params.toString()}`,
        ),
      );
    } catch (error) {
      console.error("Failed to fetch notifications summary:", error);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const now = new Date().toISOString();
    if (pathname === "/cms/user-role")
      localStorage.setItem("cms_last_seen_users", now);
    if (pathname === "/cms/feedback")
      localStorage.setItem("cms_last_seen_feedbacks", now);

    void fetchNotifications();
    const intervalId = window.setInterval(
      () => void fetchNotifications(),
      POLL_INTERVAL_MS,
    );
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void fetchNotifications();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchNotifications, pathname]);

  return (
    <NotificationsContext.Provider
      value={{ data, loading, fetchNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value)
    throw new Error(
      "useNotifications must be used inside NotificationsProvider",
    );
  return value;
}
