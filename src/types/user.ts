export type Role = "superadmin" | "admin" | "mentor" | "peserta";

export interface User {
  id: string;
  email: string;
  full_name: string;
  nim?: string | null;
  role: Role;
}
