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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkillSelector } from "@/components/skill-selector";
import { updateTeacherProfile } from "../actions";

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
});

export function TeacherProfileEditForm({ profile }) {
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
    };

    const initialFormValues = {
      skills: initialValuesRef.current.skills.map((skill) => ({
        id: skill.id,
        skillId: skill.skillId,
        proficiency: skill.proficiency,
      })),
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
  const handleRemoveSkill = (index) => {
    const skills = form.getValues("skills");
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
  const handleUpdateSkillProficiency = (index, newProficiency) => {
    const skills = form.getValues("skills");
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

      // Update profile using server action
      const result = await updateTeacherProfile(profile.id, {
        skills: skillsInput,
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
        };

        form.reset({
          skills: updatedSkills,
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
        {/* Form header with unsaved changes indicator */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Edit Teaching Profile</h2>
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

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Teaching Skills
            </CardTitle>
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
        </Card>

        {/* Save button - now disabled when no changes */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t">
          <Button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
