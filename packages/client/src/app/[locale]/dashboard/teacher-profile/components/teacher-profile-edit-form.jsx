"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  GraduationCap,
  Save,
  BookOpen,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Euro,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkillSelector } from "@/components/skill-selector";
import { updateTeacherProfile } from "../actions";
import { useRouter } from "next/navigation";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const SKILL_LEVELS = [1, 2, 3, 4, 5, 6, 7];

// Updated form schema
const profileSchema = z.object({
  skills: z.array(
    z.object({
      id: z.string().optional(),
      skillId: z.string(),
      proficiency: z.coerce.number().min(1).max(7),
      skillName: z.string(),
      framework: z.string().optional(),
      isDeleted: z.boolean().optional(),
      isNew: z.boolean().optional(),
    })
  ),
  allowBarter: z.boolean().optional(),
  priceAmount: z.coerce.number().min(0).optional(),
  priceCurrency: z.string().default("EUR"),
});

export function TeacherProfileEditForm({ profile }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Use a ref to store initial values to prevent them from changing on re-renders
  const initialValuesRef = useRef({
    skills:
      profile.skills?.map((skill) => ({
        id: skill.id,
        skillId: skill.skill.id,
        proficiency: skill.proficiency,
        skillName: skill.skill.name,
        framework: skill.skill.framework,
        isDeleted: false,
        isNew: false,
      })) || [],
  });

  // Initialize skills from profile
  const initialSkills = initialValuesRef.current.skills;

  // Initialize form with all profile data
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      skills: initialSkills,
      priceAmount: profile.priceAmount ? profile.priceAmount / 100 : 0,
      priceCurrency: "EUR",
      allowBarter: profile.allowBarter,
    },
  });

  // Watch all form values
  const formValues = form.watch();

  // Use a simple effect to detect changes by comparing with initial values
  useEffect(() => {
    const currentFormValues = {
      skills: (formValues.skills || [])
        .filter((skill) => !skill.isDeleted)
        .map((skill) => ({
          id: skill.id,
          skillId: skill.skillId,
          proficiency: skill.proficiency,
        })),
      priceAmount: formValues.priceAmount,
      priceCurrency: formValues.priceCurrency,
      allowBarter: formValues.allowBarter,
    };

    const initialFormValues = {
      skills: initialValuesRef.current.skills.map((skill) => ({
        id: skill.id,
        skillId: skill.skillId,
        proficiency: skill.proficiency,
      })),
      priceAmount: profile.priceAmount ? profile.priceAmount / 100 : 0,
      priceCurrency: "EUR",
      allowBarter: profile.allowBarter,
    };

    // Use JSON.stringify for deep comparison
    const hasChanges =
      JSON.stringify(currentFormValues) !== JSON.stringify(initialFormValues);
    setHasChanges(hasChanges);
  }, [formValues]);

  // Handler for adding a skill
  const handleAddSkill = (skill) => {
    const currentSkills = form.getValues("skills");
    form.setValue("skills", [...currentSkills, { ...skill, isNew: true }]);
  };

  // Handler for removing a skill
  const handleRemoveSkill = (skillId) => {
    const skills = form.getValues("skills");
    const index = skills.findIndex(
      (skill) => skill.id === skillId || skill.skillId === skillId
    );
    if (index === -1) return;

    const updatedSkills = [...skills];

    if (updatedSkills[index].isNew) {
      // If it's a new skill, just remove it from the array
      updatedSkills.splice(index, 1);
    } else {
      // Otherwise mark it as deleted
      updatedSkills[index].isDeleted = true;
    }

    form.setValue("skills", updatedSkills);
  };

  // Handler for updating skill proficiency
  const handleUpdateSkillProficiency = (skillId, newProficiency) => {
    const skills = form.getValues("skills");
    const index = skills.findIndex(
      (skill) => skill.id === skillId || skill.skillId === skillId
    );
    if (index === -1) return;

    const updatedSkills = [...skills];
    updatedSkills[index].proficiency = newProficiency;
    form.setValue("skills", updatedSkills);
  };

  // Handle form submission
  async function onSubmit(values) {
    try {
      setIsSubmitting(true);

      // Prepare skills input
      const skillsInput = values.skills
        .filter((skill) => !skill.isDeleted)
        .map((skill) => ({
          id: skill.isNew ? undefined : skill.id,
          skillId: skill.skillId,
          proficiency: skill.proficiency,
        }));

      // Convert price from decimal to cents for storage
      const priceAmountInCents = Math.round(values.priceAmount * 100);

      // Update profile using server action
      const result = await updateTeacherProfile(profile.id, {
        skills: skillsInput,
        priceAmount: priceAmountInCents,
        priceCurrency: values.priceCurrency,
        allowBarter: values.allowBarter,
      });

      toast.success("Profile updated successfully");

      // Update form with new data from response
      if (result) {
        const updatedSkills = result.skills.map((skill) => ({
          id: skill.id,
          skillId: skill.skill.id,
          proficiency: skill.proficiency,
          skillName: skill.skill.name,
          framework: skill.skill.framework,
          isDeleted: false,
          isNew: false,
        }));

        // Update the initial values ref with the new data
        initialValuesRef.current = {
          skills: updatedSkills,
          priceAmount: result.priceAmount,
        };

        form.reset({
          skills: updatedSkills,
          priceAmount: result.priceAmount ? result.priceAmount / 100 : 0,
          priceCurrency: result.priceCurrency || "EUR",
          allowBarter: result.allowBarter,
        });

        // Reset the hasChanges state
        setHasChanges(false);
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter out deleted skills for display
  const displaySkills = (formValues.skills || []).filter(
    (skill) => !skill.isDeleted
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Pricing Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="priceAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate (EUR)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        iconLeft={<Euro className="h-4 w-4" />}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowBarter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      Allow Bartering
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            When enabled, students can offer to exchange their
                            skills or services you are interested in learning
                            instead of paying your hourly rate. You can accept
                            or decline these offers individually.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Accept class exchanges instead of money
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Teaching Skills
              </CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <SkillSelector
              skills={displaySkills}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
              onUpdateProficiency={handleUpdateSkillProficiency}
              buttonLabel="Add Skill"
              dialogTitle="Add New Skill"
              dialogDescription="Add a skill that you can teach to students."
              showProficiency={true}
              icon={<GraduationCap className="h-5 w-5 text-muted-foreground" />}
              proficiencyLevels={SKILL_LEVELS}
              emptyMessage="You have not added any teaching skills yet. Click Add Skill to add skills you can teach."
            />
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              className="ml-auto"
              type="submit"
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Profile
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
