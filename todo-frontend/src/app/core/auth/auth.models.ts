export interface JwtResponse {
  token: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
}