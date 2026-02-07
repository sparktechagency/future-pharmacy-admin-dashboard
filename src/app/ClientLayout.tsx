"use client";

import type { ReactNode } from 'react';
import { Provider } from "react-redux";
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import { store } from "../utils/store";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </AuthProvider>
    </Provider>
  );
}