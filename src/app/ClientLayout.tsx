'use client';

import type { ReactNode } from 'react';
import { Provider } from "react-redux";
import { store } from "../utils/store";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}