"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { CustomLoading } from '../hooks/CustomLoading';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("PharmacyAdmin");


      if (!token || token === null) {
        router.replace("/auth/login");
      }

      setIsChecking(false);
    }, 2000); // ⏱️ 2 seconds

    return () => clearTimeout(timer);
  }, [router]);

  if (isChecking) {
    return (
      <div className='h-[600px] flex justify-center items-center'>
        <CustomLoading />
      </div>
    );
  }

  return <>{children}</>;
}
