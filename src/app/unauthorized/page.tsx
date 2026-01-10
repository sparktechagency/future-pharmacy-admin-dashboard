"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 text-center">
      <h1 className="text-4xl font-bold text-red-600">Unauthorized Access</h1>
      <p className="text-lg text-muted-foreground">
        You do not have permission to access this page.
      </p>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
