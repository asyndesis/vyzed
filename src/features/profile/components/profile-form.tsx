import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useBlocker } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ProfileForm,
  isProfileDirty,
  toProfileForm,
  toProfileInput,
} from "../lib/rules";
import { SaveFooter } from "../components/settings";
import { gqlRequest, graphql } from "@/lib/gql";
import { meQuery } from "../lib/queries";

const UpdateProfile = graphql(`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
    }
  }
`);

// Each profile settings page edits part of the profile, but saves the whole of it
export function useProfileForm() {
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

  useBlocker({
    shouldBlockFn: () => !window.confirm("Discard your unsaved changes?"),
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
