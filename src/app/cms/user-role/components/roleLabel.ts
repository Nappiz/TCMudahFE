import type { Role } from "../../../../../lib/admin";

export function labelRole(r: Role) {
  switch (r) {
    case "superadmin":
      return "Superadmin";
    case "admin":
      return "Admin";
    case "mentor":
      return "Mentor";
    default:
      return "Peserta";
  }
}
