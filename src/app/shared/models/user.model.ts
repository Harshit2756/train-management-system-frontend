export interface User {
  userId: number;
  username: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string; // Optional as it's not in every response
}

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  authenticated: boolean;
  message: string;
  userId: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  loginTime: string;
}
