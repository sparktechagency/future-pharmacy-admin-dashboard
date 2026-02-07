"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status
  const checkAuth = (): boolean => {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem("PharmacyAdmin");
    const isValid = !!token && token !== "null" && token !== "undefined";

    return isValid;
  };

  // Initialize authentication state
  useEffect(() => {
    const isValid = checkAuth();
    setIsAuthenticated(isValid);

    // Ensure cookie is in sync with localStorage to prevent middleware redirect loops
    if (isValid) {
      const token = localStorage.getItem("PharmacyAdmin");
      if (token) {
        document.cookie = `PharmacyAdmin=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
    }

    setIsLoading(false);

    // Set up storage event listener for cross-tab logout
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "PharmacyAdmin") {
        const newValue = e.newValue;
        if (!newValue || newValue === "null" || newValue === "undefined") {
          setIsAuthenticated(false);
          router.replace("/auth/login");
        } else {
          setIsAuthenticated(true);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  // Login function
  const login = (token: string) => {
    localStorage.setItem("PharmacyAdmin", token);

    // Also set as cookie for middleware
    document.cookie = `PharmacyAdmin=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("PharmacyAdmin");

    // Remove cookie
    document.cookie = "PharmacyAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    setIsAuthenticated(false);
    router.replace("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
