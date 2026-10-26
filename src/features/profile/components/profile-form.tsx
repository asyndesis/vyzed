import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useBlocker } from "@tanstack/react-router";
import { createContext, use, useState } from "react";
import { toast } from "sonner";
import {
  type ProfileForm,
  isProfileDirty,
  toProfileForm,
  toProfileInput,
} from "@/features/profile/lib/rules";
import { SaveFooter } from "@/features/profile/components/settings";
import { gqlRequest, graphql } from "@/lib/gql";
import { meQuery } from "@/features/profile/lib/queries";

const UpdateProfile = graphql(`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
    }
  }
`);

function useProfileFormState() {
  const { data } = useSuspenseQuery(meQuery);
  const me = data.me!; // the layout only renders for signed-in users
  const queryClient = useQueryClient();
  const saved = toProfileForm(me);
  const [form, setForm] = useState<ProfileForm>(saved);
  const set = (patch: Partial<ProfileForm>) =>
    setForm((f) => ({ ...f, ...patch }));
  const dirty = isProfileDirty(form, saved);

  const save = useMutation({
    mutationFn: (f: ProfileForm) =>
      gqlRequest(UpdateProfile, { input: toProfileInput(f) }),
    onSuccess: async () => {
      // Teacher listings and lesson cards show my name too
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: meQuery.queryKey }),
        queryClient.invalidateQueries({ queryKey: ["MyLessons"] }),
        queryClient.invalidateQueries({ queryKey: ["TeacherList"] }),
      ]);
      // Reset to what the server now has, so the form is clean again
      const fresh = queryClient.getQueryData(meQuery.queryKey)?.me;
      if (fresh) setForm(toProfileForm(fresh));
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(e.message),
  });

  // Edits carry over between the profile pages, so only leaving them loses work
  useBlocker({
    shouldBlockFn: ({ next }) =>
      !next.pathname.startsWith("/dashboard/profile") &&
      !window.confirm("Discard your unsaved changes?"),
    enableBeforeUnload: () => dirty,
    disabled: !dirty || save.isPending,
  });

  const footer = (hint?: React.ReactNode) => (
    <SaveFooter
      hint={hint}
      dirty={dirty}
      pending={save.isPending}
      onSave={() => save.mutate(form)}
      onDiscard={() => setForm(saved)}
    />
  );

  return { me, form, saved, set, footer };
}

const ProfileFormContext = createContext<ReturnType<
  typeof useProfileFormState
> | null>(null);

// One form shared by every profile page, so edits survive switching pages and the
// preview beside them stays live
export function ProfileFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileFormContext value={useProfileFormState()}>
      {children}
    </ProfileFormContext>
  );
}

export function useProfileForm() {
  const ctx = use(ProfileFormContext);
  if (!ctx) throw new Error("useProfileForm needs a ProfileFormProvider");
  return ctx;
}
