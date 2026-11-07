import axios from "axios";
import { User, UserRole } from "@/types/user";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// -----------------------------------------------------------------------------
// Axios Client Instance with Interceptors
// -----------------------------------------------------------------------------

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject stored Bearer token into outgoing requests
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Backend Auth Types (Exact Match to backend auth.validation.ts & auth.controller.ts)

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role?: "user" | "property_owner";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface ResendOtpInput {
  email: string;
}

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "user" | "property_owner" | "admin" | string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    name: string;
    isVerified: boolean;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
    accessToken: string;
    refreshToken?: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
    accessToken: string;
  };
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
  };
}

export interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  otp?: string;
  general?: string;
}

// -----------------------------------------------------------------------------
// Validation Utilities (Frontend Mirror of Backend Zod Schemas)
// -----------------------------------------------------------------------------

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Email address is required";
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return "Please enter a valid email address (e.g. name@example.com)";
  }
  return null;
}

export function validatePassword(password: string, isRegister = false): string | null {
  if (!password) {
    return "Password is required";
  }
  if (isRegister && password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  if (password.length > 100) {
    return "Password cannot exceed 100 characters";
  }
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Full name is required";
  }
  if (trimmed.length < 2) {
    return "Name must be at least 2 characters long";
  }
  if (trimmed.length > 50) {
    return "Name must not exceed 50 characters";
  }
  return null;
}

export function validatePhone(phone?: string | null): string | null {
  if (!phone || !phone.trim()) return null; // optional
  const phoneRegex = /^[0-9+\s\-()]{7,20}$/;
  if (!phoneRegex.test(phone.trim())) {
    return "Please enter a valid phone number format";
  }
  return null;
}

export function validateOtp(otp: string): string | null {
  const trimmed = otp.trim();
  if (!trimmed) {
    return "Verification code is required";
  }
  if (!/^\d{6}$/.test(trimmed)) {
    return "Verification code must be exactly 6 digits";
  }
  return null;
}

export interface PasswordStrength {
  score: number;
  label: string;
  colorClass: string;
  widthPercent: number;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "Too short", colorClass: "bg-slate-200", widthPercent: 5 };
  }

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 1:
      return { score: 1, label: "Weak", colorClass: "bg-rose-500", widthPercent: 25 };
    case 2:
      return { score: 2, label: "Fair", colorClass: "bg-amber-500", widthPercent: 50 };
    case 3:
      return { score: 3, label: "Good", colorClass: "bg-sky-500", widthPercent: 75 };
    case 4:
      return { score: 4, label: "Strong", colorClass: "bg-emerald-500", widthPercent: 100 };
    default:
      return { score: 0, label: "Too weak", colorClass: "bg-slate-200", widthPercent: 10 };
  }
}

// -----------------------------------------------------------------------------
// Local Storage Session Management
// -----------------------------------------------------------------------------

const STORAGE_KEY_USER = "stayup_auth_user";
const STORAGE_KEY_TOKEN = "stayup_auth_token";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

export function saveSession(user: User, accessToken?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    if (accessToken) {
      localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);
    }
  } catch (err) {
    console.error("Failed to save auth session:", err);
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_TOKEN);
}

// -----------------------------------------------------------------------------
// Backend Mapping & API Client
// -----------------------------------------------------------------------------

function normalizeRole(backendRole?: string): UserRole {
  if (!backendRole) return "customer";
  const lower = backendRole.toLowerCase();
  if (lower === "property_owner" || lower === "owner") return "owner";
  if (lower === "admin") return "admin";
  return "customer";
}

export function mapBackendUserToFrontend(raw: BackendUser | any): User {
  return {
    id: raw.id || raw._id || `usr-${Date.now()}`,
    name: raw.name || "StayUp Traveler",
    email: raw.email || "",
    phone: raw.phone || "",
    role: normalizeRole(raw.role),
    avatar:
      raw.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    joinedDate: raw.createdAt
      ? new Date(raw.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    status: raw.isVerified === false ? "pending_verification" : "active",
    isVerified: Boolean(raw.isVerified ?? true),
  };
}

/**
 * Helper to make authenticated requests with JWT Bearer header and cookies.
 */
export async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getStoredToken();
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}

// -----------------------------------------------------------------------------
// Axios Backend Auth Functions (/api/v1/auth/register, /login, /verify-otp, /resend-otp)
// -----------------------------------------------------------------------------

/**
 * 1. Register a new user & trigger 6-digit OTP verification email
 * Backend Endpoint: POST /api/v1/auth/register
 */
export async function apiRegister(
  payload: RegisterInput
): Promise<{ success: boolean; message: string; email: string; requiresOtp: boolean }> {
  try {
    const res = await api.post<RegisterResponse>("/api/v1/auth/register", {
      name: payload.name.trim(),
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
      phone: payload.phone ? payload.phone.trim() : undefined,
      role: payload.role || "user",
    });

    return {
      success: true,
      message: res.data.message || "Verification code sent to your email.",
      email: payload.email.toLowerCase().trim(),
      requiresOtp: true,
    };
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        throw new Error(
          `Backend server at ${API_BASE_URL} is currently unreachable. Please ensure the server is running.`
        );
      }
      const data: any = err.response.data;
      const errMsg =
        data?.errors?.map((e: any) => e.message).join(", ") ||
        data?.message ||
        "Registration failed. Please check your details.";
      throw new Error(errMsg);
    }
    throw err;
  }
}

/**
 * 2. Verify 6-digit OTP code, activate account, and obtain auth tokens
 * Backend Endpoint: POST /api/v1/auth/verify-otp
 */
export async function apiVerifyOtp(
  payload: VerifyOtpInput
): Promise<{ user: User; accessToken: string }> {
  try {
    const res = await api.post<VerifyOtpResponse>("/api/v1/auth/verify-otp", {
      email: payload.email.toLowerCase().trim(),
      otp: payload.otp.trim(),
    });

    const user = mapBackendUserToFrontend(res.data.data.user);
    saveSession(user, res.data.data.accessToken);

    return {
      user,
      accessToken: res.data.data.accessToken,
    };
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        throw new Error(`Backend server at ${API_BASE_URL} is currently unreachable.`);
      }
      const data: any = err.response.data;
      throw new Error(data?.message || "Invalid OTP code. Please check and try again.");
    }
    throw err;
  }
}

/**
 * 3. Resend fresh 6-digit OTP code to an unverified email
 * Backend Endpoint: POST /api/v1/auth/resend-otp
 */
export async function apiResendOtp(email: string): Promise<string> {
  try {
    const res = await api.post<ResendOtpResponse>("/api/v1/auth/resend-otp", {
      email: email.toLowerCase().trim(),
    });

    return res.data.message || "A new 6-digit verification code has been sent to your email.";
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        throw new Error(`Backend server at ${API_BASE_URL} is currently unreachable.`);
      }
      const data: any = err.response.data;
      throw new Error(data?.message || "Failed to resend OTP code.");
    }
    throw err;
  }
}

/**
 * 4. Authenticate an existing user and create a session
 * Backend Endpoint: POST /api/v1/auth/login
 */
export async function apiLogin(
  payload: LoginInput
): Promise<{ user: User; accessToken: string }> {
  try {
    const res = await api.post<LoginResponse>("/api/v1/auth/login", {
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
    });

    const user = mapBackendUserToFrontend(res.data.data.user);
    saveSession(user, res.data.data.accessToken);

    return {
      user,
      accessToken: res.data.data.accessToken,
    };
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        throw new Error(
          `Backend server at ${API_BASE_URL} is currently unreachable. You can use Instant Demo User Login to test.`
        );
      }

      const status = err.response.status;
      const data: any = err.response.data;

      // Handle unverified account (403 Forbidden: "Please verify your email before logging in.")
      if (
        status === 403 ||
        data?.message?.toLowerCase().includes("verify your email")
      ) {
        const error: any = new Error(
          data?.message || "Please verify your email before logging in."
        );
        error.requiresVerification = true;
        error.email = payload.email.toLowerCase().trim();
        throw error;
      }

      throw new Error(data?.message || "Invalid email or password.");
    }
    throw err;
  }
}
