import { apiClient } from "./api";
import type { AuthResponse, LoginRequest } from "@/types/authTypes";

export const login = (data: LoginRequest) =>
  apiClient.post<AuthResponse>("/auth/login", data).then((res) => res.data);
