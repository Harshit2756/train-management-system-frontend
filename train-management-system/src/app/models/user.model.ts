export interface User {
  id?: number;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  password?: string;
  userType?: 'CUSTOMER' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  userType: 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Passenger {
  passengerId?: number;
  fullName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: string;
  data: T;
  timestamp: string;
} 