// Authentication and User Models

export interface LoginRequest {
  username: string;
  password: string;
  captchaCode?: string;
  captchaToken?: string;
}

export interface PhoneLoginRequest {
  phone: string;
  code: string;
  captchaCode?: string;
  captchaToken?: string;
}

export interface CaptchaChallenge {
  token: string;
  question: string;
  options?: string[];
}

export interface VerificationCodeRequest {
  phone: string;
  captchaToken: string;
  captchaCode: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id: number;
  username: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  organizationId: number;
  status: UserStatus;
  roles: string[];
  permissions: Permission[];
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  SUSPENDED = 'SUSPENDED'
}

export interface UserProfile {
  id: number;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  language: string;
  timezone: string;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
}

export interface CaptchaResponse {
  token: string;
  question: string;
  options?: string[];
}

export interface VerificationCodeResponse {
  success: boolean;
  message: string;
  expiresAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}