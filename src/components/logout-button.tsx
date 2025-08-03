"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

export function LogoutButton({ variant = "outline", className }: LogoutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <Button 
      variant={variant} 
      onClick={handleSignOut}
      className={className}
    >
      Sign Out
    </Button>
  );
}