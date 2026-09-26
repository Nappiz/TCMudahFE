import { api } from "./admin";

export type OrderStatus = "pending" | "approved" | "rejected" | "expired";
export type FulfillmentMode = "legacy_manual" | "automatic";

export type OrderItem = {
  class_id?: string;
  item_id?: string;
  item_type?: "class" | "package";
  item_title?: string;
  qty: number;
  price: number;
  list_price?: number | null;
  offer_id?: string | null;
  meeting_count?: number | null;
  offer_snapshot?: {
    items?: Array<{
      class_id: string;
      class_title?: string;
      class_offer_id: string;
      meeting_count: number;
      list_price?: number;
      price?: number;
    }>;
  } | null;
};

export type Order = {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  fulfillment_mode: FulfillmentMode;
  proof_url?: string | null;
  sender_name?: string | null;
  note?: string | null;
  created_at?: string;
  user_name?: string | null;
  user_email?: string | null;
};

export function fetchOrders(page = 1, limit = 20, search = "", status = "") {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  return api<{ total: number; data: Order[] }>(
    `/admin/orders?${params.toString()}`,
  );
}

export function updateOrderStatus(
  id: string,
  status: Exclude<OrderStatus, "pending">,
) {
  return api<Order>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
