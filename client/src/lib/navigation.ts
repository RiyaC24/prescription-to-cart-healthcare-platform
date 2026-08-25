import type { Role } from "@/types/auth";

export function roleToDashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "DOCTOR":
      return "/doctor";
    case "PATIENT":
    default:
      return "/patient";
  }
}
