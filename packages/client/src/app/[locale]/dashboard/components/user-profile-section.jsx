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
import { UserCircle, Save, Loader2, AlertCircle } from "lucide-react";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Tiptap from "@/components/tip-tap";

// Import the server action
import { saveUserData } from "../actions";

// Form schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
});

export function UserProfileSection({ user }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);

  // Use a ref to store initial values to prevent them from changing on re-renders
  const initialValuesRef = useRef({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.userProfile?.bio || "",
  });

  // Initialize form with profile data
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialValuesRef.current.firstName,
      lastName: initialValuesRef.current.lastName,
      bio: initialValuesRef.current.bio,
    },
  });

  // Watch for form changes to enable/disable save button
  const formValues = form.watch();

  // Check if the form has changed from initial values
  const checkFormChanges = () => {
    return (
      formValues.firstName !== initialValuesRef.current.firstName ||
      formValues.lastName !== initialValuesRef.current.lastName ||
      formValues.bio !== initialValuesRef.current.bio
    );
  };

  // Use a custom hook for debounced value
  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }, [value, delay]);

    return debouncedValue;
  }

  const hasFormChanges = checkFormChanges();
  const debouncedHasChanges = useDebounce(hasFormChanges, 300);

  // Update the state when the debounced value changes
  useEffect(() => {
    setHasChanges(debouncedHasChanges);
  }, [debouncedHasChanges]);

  async function onSubmit(values) {
    startTransition(async () => {
      try {
        await saveUserData({
          userId: user.id,
          firstName: values.firstName,
          lastName: values.lastName,
          bio: values.bio,
          userProfile: user.userProfile,
        });

        // Update initial values after successful save
        initialValuesRef.current = {
          firstName: values.firstName,
          lastName: values.lastName,
          bio: values.bio,
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
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-lg sm:text-xl">
                {user.firstName
                  ? `${user.firstName} ${user.lastName}`
                  : "Complete Your Profile"}
              </CardTitle>
              <CardDescription>
                {user.firstName
                  ? "Update your personal information"
                  : "Tell us a bit about yourself"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
