"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Wraps a single child and signs the user out when it is clicked
export function SignOutButton({ children }) {
  const router = useRouter();
  const onSelect = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.replace("/sign-in") },
    });
  };
  return (
    <div onClick={onSelect} role="presentation">
      {children}
    </div>
  );
}
