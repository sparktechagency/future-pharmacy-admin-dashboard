"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Public routes that don't require authentication
const publicRoutes = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/unauthorized",
];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [initFinished, setInitFinished] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setInitFinished(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading || !initFinished) return;

    // Check if current route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (!isAuthenticated && !isPublicRoute) {
      // Not authenticated and trying to access protected route
      router.replace("/auth/login");
    } else if (isAuthenticated && pathname.startsWith("/auth/")) {
      // Authenticated and trying to access auth pages
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, initFinished, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading || !initFinished) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-purple-600 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Verifying Access</h2>
            <p className="text-sm text-gray-500 font-medium">Please wait while we authenticate your session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only render children if authenticated or on public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!isAuthenticated && !isPublicRoute) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
}
