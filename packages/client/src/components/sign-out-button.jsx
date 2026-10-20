import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

// Wraps a single child and signs the user out when it is clicked
export function SignOutButton({ children }) {
  const navigate = useNavigate();
  const onSelect = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/{-$locale}/sign-in", replace: true }) },
    });
  };
  return (
    <div onClick={onSelect} role="presentation">
      {children}
    </div>
  );
}
