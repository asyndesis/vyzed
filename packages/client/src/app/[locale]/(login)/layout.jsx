import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PublicShell } from "@/components/public-shell";
import { PitchPoints, SplitLayout } from "@/components/split-layout";

export default async function AuthLayout({ children }) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <PublicShell>
      <SplitLayout
        aside={
          <>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight">
              Learn from people,
              <br />
              <span className="text-muted-foreground">not playlists.</span>
            </h2>
            <PitchPoints />
          </>
        }
      >
        {children}
      </SplitLayout>
    </PublicShell>
  );
}
