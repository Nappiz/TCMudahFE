import { api } from "./admin";

export type OrderStatus = "pending" | "approved" | "rejected" | "expired";

export type OrderItem = {
  class_id: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  proof_url?: string | null;
  sender_name?: string | null;
  note?: string | null;
  created_at?: string;
  user_name?: string | null;
  user_email?: string | null;
};

export function fetchOrders() {
  return api<Order[]>("/admin/orders");
}

export function updateOrderStatus(id: string, status: Exclude<OrderStatus, "pending">) {
  return api<Order>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
