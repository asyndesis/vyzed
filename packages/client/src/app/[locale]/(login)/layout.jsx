import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AuthLayout(props) {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      {props.children}
    </div>
  );
}
