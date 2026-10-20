import { useQuery } from "@apollo/client/react";
import { useSession } from "@/lib/auth-client";
import { ME } from "@/lib/graphql";

// The signed-in user (with all profiles), or null when signed out
export function useMe() {
  const { data: session, isPending } = useSession();
  const { data, loading, refetch } = useQuery(ME, { skip: !session });
  return {
    me: data?.me ?? null,
    signedIn: !!session,
    sessionPending: isPending,
    loading: isPending || (!!session && loading && !data),
    refetch,
  };
}
