import apiClient from "./apiClient";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "admin" | "user";
  organization_name: string;
  organization_address?: string;
  organization_phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
