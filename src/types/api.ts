export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  errors?: Record<string, string[]>;
}

export interface RegisterPayload {
  username: string;
  email: string;
}
