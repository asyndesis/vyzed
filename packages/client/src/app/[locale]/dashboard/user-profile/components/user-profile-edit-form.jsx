"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  UserCircle,
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  AlertCircle,
  Languages,
} from "lucide-react";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import Tiptap from "@/components/tip-tap";
import { SkillSelector } from "@/components/skill-selector";

// Import the server action
import { saveUserData } from "../actions";

// Language levels for the proficiency selector
const LANGUAGE_LEVELS = [1, 2, 3, 4, 5, 6, 7];

// Define language schema separately for clarity
const languageSchema = z.object({
  id: z.string().optional(),
  skillId: z.string(),
  proficiency: z.number().min(1).max(7),
  skillName: z.string(),
  framework: z.string().optional(),
  isDeleted: z.boolean().optional(),
  isNew: z.boolean().optional(),
});

// Updated Form schema with nested structure
const profileSchema = z.object({
  user: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  }),
  userProfile: z.object({
    bio: z.string().optional(),
    languages: z.array(languageSchema).optional(),
  }),
});

export function UserProfileEditForm({ user: userData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Get languages from user profile or default to empty array
  const userLanguages = userData?.userProfile?.languages || [];

  // Use a ref to store initial values with the nested structure
  const initialValuesRef = useRef({
    user: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
    },
    userProfile: {
      bio: userData?.userProfile?.bio || "",
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
    },
  });

  // Initialize form with profile data using the nested structure
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValuesRef.current,
  });

  // Handler for adding a language - updates userProfile.languages
  const handleAddLanguage = (language) => {
    const currentLanguages = form.getValues("userProfile.languages") || [];
    form.setValue(
      "userProfile.languages",
      [...currentLanguages, { ...language, isNew: true }],
      { shouldDirty: true, shouldTouch: true },
    );
  };

  // Handler for removing a language - updates userProfile.languages
  const handleRemoveLanguage = (skillId) => {
    const languages = form.getValues("userProfile.languages") || [];
    const updatedLanguages = languages
      .map((lang) =>
        lang.skillId === skillId ? { ...lang, isDeleted: true } : lang,
      )
      .filter((lang) => !(lang.isNew && lang.skillId === skillId));
    form.setValue("userProfile.languages", updatedLanguages, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // Handler for updating language proficiency - updates userProfile.languages
  const handleUpdateLanguageProficiency = (skillId, newProficiency) => {
    const languages = form.getValues("userProfile.languages") || [];
    const updatedLanguages = languages.map((lang) => {
      if (lang.skillId === skillId && !lang.isDeleted) {
        return { ...lang, proficiency: newProficiency };
      }
      return lang;
    });
    form.setValue("userProfile.languages", updatedLanguages, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  async function onSubmit(values) {
    startTransition(async () => {
      try {
        const payload = {
          userId: userData.id,
        };

        // Use form.formState.dirtyFields to check which fields have changed
        const dirtyFields = form.formState.dirtyFields;

        // Add user data only if user fields have changed
        if (dirtyFields.user?.firstName || dirtyFields.user?.lastName) {
          payload.user = values.user;
        }

        // Add userProfile data only if profile fields have changed
        if (
          dirtyFields.userProfile?.bio ||
          dirtyFields.userProfile?.languages
        ) {
          // Process languages for submission
          const languageSkills = (values.userProfile?.languages || [])
            .filter((lang) => !lang.isDeleted)
            .map((lang) => ({
              id: lang.isNew ? undefined : lang.id,
              skillId: lang.skillId,
              proficiency: lang.proficiency,
            }));

          payload.userProfile = {
            id: userData.userProfile.id,
            bio: values.userProfile.bio,
            languages: languageSkills,
          };
        }

        // Only call saveUserData if there are changes
        if (payload.user || payload.userProfile) {
          await saveUserData(payload);
        }

        // Update initialValuesRef with new values
        const savedLanguagesState = (values.userProfile?.languages || [])
          .filter((lang) => !lang.isDeleted)
          .map((lang) => ({
            id: lang.id,
            skillId: lang.skillId,
            proficiency: lang.proficiency,
            skillName: lang.skillName,
            framework: lang.framework,
            isDeleted: false,
            isNew: false,
          }));

        initialValuesRef.current = {
          user: {
            firstName: values.user.firstName,
            lastName: values.user.lastName,
          },
          userProfile: {
            bio: values.userProfile?.bio,
            languages: savedLanguagesState,
          },
        };

        // Reset the form with the new initial values to clear dirty state
        form.reset(initialValuesRef.current);

        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("Error saving user data:", error);
        toast.error("Failed to update profile");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full pb-20">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">
              <UserCircle className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="languages">
              <Languages className="h-4 w-4 mr-2" />
              Languages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-0 flex-1">
            <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="user.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="user.lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="userProfile.bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Tiptap
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Write a short introduction about yourself. Both
                          teachers and students will see this.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="languages" className="mt-0">
            <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
              <FormField
                control={form.control}
                name="userProfile.languages"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <SkillSelector
                        skills={(
                          form.getValues("userProfile.languages") || []
                        ).filter((lang) => !lang.isDeleted)}
                        onAddSkill={handleAddLanguage}
                        onRemoveSkill={handleRemoveLanguage}
                        onUpdateProficiency={handleUpdateLanguageProficiency}
                        buttonLabel="Add Language"
                        dialogTitle="Add Language"
                        dialogDescription="Select a language you speak and your proficiency level."
                        skillCategoryId="clqwertyu00"
                        showProficiency={true}
                        icon={
                          <Globe className="h-5 w-5 text-muted-foreground" />
                        }
                        sectionLabel="Spoken Languages"
                        proficiencyLevels={LANGUAGE_LEVELS}
                        emptyMessage="You have not added any languages yet. Click Add Language to add languages you speak."
                      />
                    </FormControl>
                    <FormDescription>
                      Add languages you speak and rate your proficiency level.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
        <div className="fixed bottom-0 md:left-[--sidebar-width] left-0 right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className={`bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 px-3 py-1.5 transition-opacity duration-200 ${
                  form.formState.isDirty ? "opacity-100" : "opacity-0"
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Unsaved changes</span>
              </Badge>
              <Button
                type="submit"
                disabled={!form.formState.isDirty || isPending}
                className="flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
