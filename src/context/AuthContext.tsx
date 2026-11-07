"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/user";
import {
  getStoredUser,
  getStoredToken,
  saveSession,
  clearSession,
  apiLogin,
  apiRegister,
  apiVerifyOtp,
  apiResendOtp,
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
} from "@/lib/auth-service";
import { CURRENT_MOCK_USER } from "@/data/users";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<User>;
  register: (data: RegisterInput) => Promise<{ success: boolean; message: string; email: string; requiresOtp: boolean }>;
  verifyOtp: (data: VerifyOtpInput) => Promise<User>;
  resendOtp: (email: string) => Promise<string>;
  logout: () => void;
  loginDemoUser: (demoUser?: User) => void;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage on browser mount
  useEffect(() => {
    try {
      const storedUser = getStoredUser();
      const storedToken = getStoredToken();
      if (storedUser) {
        setUser(storedUser);
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginInput): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await apiLogin(credentials);
      setUser(res.user);
      setToken(res.accessToken);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      return await apiRegister(data);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (data: VerifyOtpInput): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await apiVerifyOtp(data);
      setUser(res.user);
      setToken(res.accessToken);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string): Promise<string> => {
    return await apiResendOtp(email);
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setToken(null);
  };

  const loginDemoUser = (demoUser?: User) => {
    const active = demoUser || CURRENT_MOCK_USER;
    saveSession(active, "demo-jwt-token-stayup");
    setUser(active);
    setToken("demo-jwt-token-stayup");
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveSession(updated, token || undefined);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        loginDemoUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
