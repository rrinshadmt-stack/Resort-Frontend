import { User, UserRole } from "@/types/user";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// -----------------------------------------------------------------------------
// Backend Auth Types (Exact Match to backend auth.validation.ts & auth.controller.ts)
// -----------------------------------------------------------------------------

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role?: "CUSTOMER" | "OWNER";
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
  role: "CUSTOMER" | "OWNER" | "ADMIN" | string;
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

export function validatePassword(password: string, isSignUp = false): string | null {
  if (!password) {
    return "Password is required";
  }
  if (isSignUp) {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (password.length > 100) {
      return "Password cannot exceed 100 characters";
    }
  }
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Full name is required";
  }
  if (trimmed.length < 2) {
    return "Full name must be at least 2 characters long";
  }
  if (trimmed.length > 50) {
    return "Full name cannot exceed 50 characters";
  }
  return null;
}

export function validatePhone(phone?: string | null): string | null {
  if (!phone) return null; // Optional in backend schema
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const phoneRegex = /^[0-9+\s\-()]{7,20}$/;
  if (!phoneRegex.test(trimmed)) {
    return "Invalid phone format (must be 7-20 digits with +, -, () allowed)";
  }
  return null;
}

export function validateOtp(otp: string): string | null {
  const trimmed = otp.trim();
  if (!trimmed) {
    return "6-digit OTP code is required";
  }
  if (!/^\d{6}$/.test(trimmed)) {
    return "OTP must be exactly 6 digits";
  }
  return null;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: "Too Short" | "Weak" | "Fair" | "Good" | "Strong";
  colorClass: string;
  widthPercent: number;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 6) {
    return {
      score: 0,
      label: "Too Short",
      colorClass: "bg-rose-500",
      widthPercent: password.length > 0 ? 20 : 0,
    };
  }

  let score = 1;
  if (password.length >= 8) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  switch (score) {
    case 1:
      return { score: 1, label: "Weak", colorClass: "bg-amber-500", widthPercent: 35 };
    case 2:
      return { score: 2, label: "Fair", colorClass: "bg-yellow-500", widthPercent: 60 };
    case 3:
      return { score: 3, label: "Good", colorClass: "bg-sky-500", widthPercent: 80 };
    default:
      return { score: 4, label: "Strong", colorClass: "bg-emerald-500", widthPercent: 100 };
  }
}

// -----------------------------------------------------------------------------
// Session & Local Storage Management
// -----------------------------------------------------------------------------

export const STORAGE_KEY_USER = "stayup_auth_user";
export const STORAGE_KEY_TOKEN = "stayup_access_token";

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
  if (lower === "owner") return "owner";
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
 * Ready for future backend endpoint connections!
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
// Backend Functions (POST /api/auth/register, /login, /verify-otp, /resend-otp)
// -----------------------------------------------------------------------------

/**
 * 1. Register a new user & trigger 6-digit OTP verification email
 * Backend Endpoint: POST /api/auth/register
 */
export async function apiRegister(
  payload: RegisterInput
): Promise<{ success: boolean; message: string; email: string; requiresOtp: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: payload.name.trim(),
        email: payload.email.toLowerCase().trim(),
        password: payload.password,
        phone: payload.phone ? payload.phone.trim() : undefined,
        role: payload.role || "CUSTOMER",
      }),
    });

    const json = await res.json().catch(() => ({
      success: false,
      message: `Server returned HTTP ${res.status}`,
    }));

    if (!res.ok || !json.success) {
      const errMsg =
        json.errors?.map((e: any) => e.message).join(", ") ||
        json.message ||
        "Registration failed. Please check your details.";
      throw new Error(errMsg);
    }

    return {
      success: true,
      message: json.message || "Verification code sent to your email.",
      email: payload.email.toLowerCase().trim(),
      requiresOtp: true,
    };
  } catch (err: any) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        `Backend server at ${API_BASE_URL} is currently offline. You can use Instant Demo User Login to test.`
      );
    }
    throw err;
  }
}

/**
 * 2. Verify 6-digit OTP code, activate account, and obtain auth tokens
 * Backend Endpoint: POST /api/auth/verify-otp
 */
export async function apiVerifyOtp(
  payload: VerifyOtpInput
): Promise<{ user: User; accessToken: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: payload.email.toLowerCase().trim(),
        otp: payload.otp.trim(),
      }),
    });

    const json = await res.json().catch(() => ({
      success: false,
      message: `Server returned HTTP ${res.status}`,
    }));

    if (!res.ok || !json.success) {
      throw new Error(json.message || "Invalid OTP code. Please check and try again.");
    }

    const user = mapBackendUserToFrontend(json.data.user);
    saveSession(user, json.data.accessToken);

    return {
      user,
      accessToken: json.data.accessToken,
    };
  } catch (err: any) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(`Backend server at ${API_BASE_URL} is currently offline.`);
    }
    throw err;
  }
}

/**
 * 3. Resend fresh 6-digit OTP code to an unverified email
 * Backend Endpoint: POST /api/auth/resend-otp
 */
export async function apiResendOtp(email: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
      }),
    });

    const json = await res.json().catch(() => ({
      success: false,
      message: `Server returned HTTP ${res.status}`,
    }));

    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to resend OTP code.");
    }

    return json.message || "A new 6-digit verification code has been sent to your email.";
  } catch (err: any) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(`Backend server at ${API_BASE_URL} is currently offline.`);
    }
    throw err;
  }
}

/**
 * 4. Authenticate an existing user and create a session
 * Backend Endpoint: POST /api/auth/login
 */
export async function apiLogin(
  payload: LoginInput
): Promise<{ user: User; accessToken: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: payload.email.toLowerCase().trim(),
        password: payload.password,
      }),
    });

    const json = await res.json().catch(() => ({
      success: false,
      message: `Server returned HTTP ${res.status}`,
    }));

    if (!res.ok || !json.success) {
      // Check if user is unverified (403: "Please verify your email before logging in.")
      if (
        res.status === 403 ||
        json.message?.toLowerCase().includes("verify your email")
      ) {
        const error: any = new Error(
          json.message || "Please verify your email before logging in."
        );
        error.requiresVerification = true;
        error.email = payload.email.toLowerCase().trim();
        throw error;
      }
      throw new Error(json.message || "Invalid email or password.");
    }

    const user = mapBackendUserToFrontend(json.data.user);
    saveSession(user, json.data.accessToken);

    return {
      user,
      accessToken: json.data.accessToken,
    };
  } catch (err: any) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        `Backend server at ${API_BASE_URL} is currently offline. You can use Instant Demo User Login to test.`
      );
    }
    throw err;
  }
}
