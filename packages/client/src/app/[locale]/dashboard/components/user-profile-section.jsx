"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { UserCircle, Save, Loader2, AlertCircle, Globe } from "lucide-react";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Tiptap from "@/components/tip-tap";
import { SkillSelector } from "@/components/skill-selector";

// Import the server action
import { saveUserData } from "../actions";

// Language levels for the proficiency selector
const LANGUAGE_LEVELS = [1, 2, 3, 4, 5];

// Form schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
  languages: z
    .array(
      z.object({
        id: z.string().optional(),
        skillId: z.string(),
        proficiency: z.number().min(1).max(5),
        skillName: z.string(),
        framework: z.string().optional(),
        isDeleted: z.boolean().optional(),
        isNew: z.boolean().optional(),
      })
    )
    .optional(),
});

export function UserProfileSection({ user }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);

  // Get languages from user profile or default to empty array
  const userLanguages = user?.userProfile?.languages || [];

  // Use a ref to store initial values to prevent them from changing on re-renders
  const initialValuesRef = useRef({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.userProfile?.bio || "",
    languages:
      userLanguages.map((lang) => ({
        id: lang.id,
        skillId: lang.skill?.id || lang.skillId,
        proficiency: lang.proficiency,
        skillName: lang.skill?.name || "Unknown",
        framework: lang.skill?.framework || "DEFAULT",
        isDeleted: false,
        isNew: false,
      })) || [],
  });

  // Initialize form with profile data
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialValuesRef.current.firstName,
      lastName: initialValuesRef.current.lastName,
      bio: initialValuesRef.current.bio,
      languages: initialValuesRef.current.languages,
    },
  });

  // Watch all form values
  const formValues = form.watch();

  // Use a simple effect to detect changes by comparing with initial values
  useEffect(() => {
    const currentFormValues = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      bio: formValues.bio,
      languages: (formValues.languages || [])
        .filter((lang) => !lang.isDeleted)
        .map((lang) => ({
          id: lang.id,
          skillId: lang.skillId,
          proficiency: lang.proficiency,
        })),
    };

    const initialFormValues = {
      firstName: initialValuesRef.current.firstName,
      lastName: initialValuesRef.current.lastName,
      bio: initialValuesRef.current.bio,
      languages: initialValuesRef.current.languages.map((lang) => ({
        id: lang.id,
        skillId: lang.skillId,
        proficiency: lang.proficiency,
      })),
    };

    // Use JSON.stringify for deep comparison
    const hasChanges =
      JSON.stringify(currentFormValues) !== JSON.stringify(initialFormValues);
    setHasChanges(hasChanges);
  }, [formValues]);

  // Handler for adding a language
  const handleAddLanguage = (language) => {
    const currentLanguages = form.getValues("languages") || [];
    form.setValue("languages", [
      ...currentLanguages,
      { ...language, isNew: true },
    ]);
  };

  // Handler for removing a language
  const handleRemoveLanguage = (index) => {
    const languages = form.getValues("languages") || [];
    const updatedLanguages = [...languages];

    if (updatedLanguages[index].isNew) {
      // If it's a new language, just remove it from the array
      updatedLanguages.splice(index, 1);
    } else {
      // Otherwise mark it as deleted
      updatedLanguages[index].isDeleted = true;
    }

    form.setValue("languages", updatedLanguages);
  };

  // Handler for updating language proficiency
  const handleUpdateLanguageProficiency = (index, newProficiency) => {
    const languages = form.getValues("languages") || [];
    const updatedLanguages = [...languages];
    updatedLanguages[index].proficiency = newProficiency;
    form.setValue("languages", updatedLanguages);
  };

  async function onSubmit(values) {
    startTransition(async () => {
      try {
        // Prepare language skills for the API
        const languageSkills = (values.languages || [])
          .filter((lang) => !lang.isDeleted)
          .map((lang) => ({
            id: lang.isNew ? undefined : lang.id,
            skillId: lang.skillId,
            proficiency: lang.proficiency,
          }));

        await saveUserData({
          userId: user.id,
          firstName: values.firstName,
          lastName: values.lastName,
          bio: values.bio,
          languages: languageSkills,
          userProfile: user.userProfile,
        });

        // Update initial values after successful save
        initialValuesRef.current = {
          firstName: values.firstName,
          lastName: values.lastName,
          bio: values.bio,
          languages: (values.languages || [])
            .filter((lang) => !lang.isDeleted)
            .map((lang) => ({
              ...lang,
              isNew: false,
              isDeleted: false,
            })),
        };

        setHasChanges(false);
        toast.success("Profile updated successfully");
        router.refresh();
      } catch (error) {
        console.error("Error saving user data:", error);
        toast.error("Failed to update profile");
      }
    });
  }

  // Filter out deleted languages for display
  const displayLanguages = (formValues.languages || []).filter(
    (lang) => !lang.isDeleted
  );

  return (
    <section className="space-y-4 col-span-1 lg:col-span-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-semibold">Your Details</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Both students and teachers will see this information.
          </p>
        </div>

        <Badge
          variant="outline"
          className={`bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 px-3 py-1.5 transition-opacity duration-200 ${
            hasChanges ? "opacity-100" : "opacity-0"
          }`}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Unsaved changes</span>
        </Badge>
      </div>

      <Card className="overflow-hidden transition-all">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="pb-2 pt-4"></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your last name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Only your initial will be shown publicly
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Tiptap {...field} />
                    </FormControl>
                    <FormDescription>
                      Tell others about yourself, your interests, and what
                      brings you to our platform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="languages"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <SkillSelector
                        skills={displayLanguages}
                        onAddSkill={handleAddLanguage}
                        onRemoveSkill={handleRemoveLanguage}
                        onUpdateProficiency={handleUpdateLanguageProficiency}
                        buttonLabel="Add Language"
                        dialogTitle="Add Language"
                        dialogDescription="Select a language you speak and your proficiency level."
                        skillCategoryId="clqwertyu00" // Language category ID
                        showProficiency={true}
                        icon={
                          <Globe className="h-5 w-5 text-muted-foreground" />
                        }
                        sectionLabel="Spoken Languages"
                        proficiencyLevels={LANGUAGE_LEVELS}
                      />
                    </FormControl>
                    <FormDescription>
                      Add languages you speak and your proficiency level
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Button
                type="submit"
                className="gap-1.5"
                disabled={isPending || !hasChanges}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </section>
  );
}
