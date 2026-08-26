export type UserRole = "DISPATCHER" | "DRIVER";

export interface AuthResponse {
  token: string;
  username: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}
