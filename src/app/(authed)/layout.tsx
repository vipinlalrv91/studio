
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser } = useUser();

  React.useEffect(() => {
    // If there's no user in the context, try to get it from localStorage
    if (!user) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // if no user is found, redirect to login
        router.push('/');
      }
    }
  }, [user, setUser, router]);

  if (!user) {
    return (
       <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
        {children}
    </div>
  );
}
