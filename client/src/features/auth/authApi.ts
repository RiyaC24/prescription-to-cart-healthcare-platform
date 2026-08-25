import { api } from "@/lib/axios";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth";

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", { refreshToken });
}
