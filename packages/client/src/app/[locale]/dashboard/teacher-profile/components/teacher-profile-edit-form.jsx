"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  Trash2,
  Plus,
  Loader2,
  GraduationCap,
  Save,
  User,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { renderProficiency } from "@/lib/utils";
import Tiptap from "@/components/tip-tap";

const SKILL_LEVELS = [1, 2, 3, 4, 5, 6, 7];

// Single GraphQL mutation for updating the entire profile
const UPDATE_TEACHER_PROFILE = gql`
  mutation UpdateTeacherProfile(
    $id: PostgresID!
    $input: UpdateTeacherProfileInput!
  ) {
    updateTeacherProfile(id: $id, input: $input) {
      id
      bio
      skills {
        id
        proficiency
        skill {
          id
          name
          framework
        }
      }
    }
  }
`;

// GraphQL query for skill categories and skills
const GET_SKILLS = gql`
  query GetSkills {
    rootSkills {
      id
      name
      framework
      children {
        id
        name
        framework
      }
    }
  }
`;

// Combined form schema - remove name field
const profileSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(
    z.object({
      id: z.string().optional(),
      skillId: z.string(),
      proficiency: z.coerce.number().min(1).max(5),
      isDeleted: z.boolean().optional(),
      isNew: z.boolean().optional(),
    })
  ),
});

export function TeacherProfileEditForm({ profile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Use a ref to store initial values to prevent them from changing on re-renders
  const initialValuesRef = useRef({
    bio: profile.bio || "",
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

  // Mutation for updating the entire profile
  const [updateProfile] = useMutation(UPDATE_TEACHER_PROFILE);

  // Query for skills
  const { data: skillsData, loading: skillsLoading } = useQuery(GET_SKILLS);

  // Initialize form with all profile data
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: initialValuesRef.current.bio,
      skills: initialSkills,
    },
  });

  // Watch for form changes to enable/disable save button
  const formValues = form.watch();

  // Replace the useEffect with this cleaner implementation
  const checkFormChanges = () => {
    // Compare bio
    const bioChanged = formValues.bio !== initialValuesRef.current.bio;

    // Create a map of initial skills for efficient lookup
    const initialSkillsMap = new Map(
      initialValuesRef.current.skills.map((skill) => [skill.id, skill])
    );

    // Count active skills (not deleted)
    const activeSkillsCount = formValues.skills.filter(
      (s) => !s.isDeleted
    ).length;
    const initialSkillsCount = initialValuesRef.current.skills.length;

    // Check if skills have changed
    const skillsChanged =
      // Length check (quick first check)
      activeSkillsCount !== initialSkillsCount ||
      // Detailed comparison
      formValues.skills.some(
        (skill) =>
          skill.isNew ||
          skill.isDeleted ||
          (skill.id && !initialSkillsMap.has(skill.id)) ||
          (skill.id &&
            initialSkillsMap.has(skill.id) &&
            skill.proficiency !== initialSkillsMap.get(skill.id).proficiency)
      );

    return bioChanged || skillsChanged;
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

  // Replace the useEffect block with this
  const hasFormChanges = checkFormChanges();
  const debouncedHasChanges = useDebounce(hasFormChanges, 300);

  // Update the state when the debounced value changes
  useEffect(() => {
    setHasChanges(debouncedHasChanges);
  }, [debouncedHasChanges]);

  // Get available skills for the modal
  const getAvailableSkills = (categoryId) => {
    if (!categoryId || !skillsData?.rootSkills) return [];

    const category = skillsData.rootSkills.find((r) => r.id === categoryId);
    if (!category || !category.children) return [];

    const currentSkillIds = formValues.skills
      .filter((s) => !s.isDeleted)
      .map((s) => s.skillId);

    return category.children.filter(
      (child) => !currentSkillIds.includes(child.id)
    );
  };

  // Create a helper function to find the framework for a skill
  const getSkillFramework = (skillId) => {
    // Check if skillsData exists and has rootSkills
    if (!skillsData?.rootSkills) return null;

    // Look through all skill categories
    for (const category of skillsData.rootSkills) {
      // Check if the category has children
      if (category.children) {
        // Look for our skill in this category's children
        const skill = category.children.find((s) => s.id === skillId);
        if (skill) {
          return skill.framework;
        }
      }
    }

    // If not found
    return null;
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

      // Update profile with all data
      const result = await updateProfile({
        variables: {
          id: profile.id,
          input: {
            bio: values.bio,
            skills: skillsInput,
          },
        },
      });

      toast.success("Profile updated successfully");

      // Update form with new data from response
      if (result.data?.updateTeacherProfile) {
        const updatedProfile = result.data.updateTeacherProfile;
        const updatedSkills = updatedProfile.skills.map((skill) => ({
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
          bio: updatedProfile.bio || "",
          skills: updatedSkills,
        };

        form.reset({
          bio: updatedProfile.bio || "",
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

  // Add a new skill to the form
  function addSkill(categoryId, skillId, proficiency) {
    const selectedSkill = getAvailableSkills(categoryId).find(
      (s) => s.id === skillId
    );
    if (!selectedSkill) return;

    const newSkill = {
      skillId,
      proficiency,
      skillName: selectedSkill.name,
      framework: selectedSkill.framework,
      isNew: true,
      isDeleted: false,
    };

    const currentSkills = form.getValues("skills");
    form.setValue("skills", [...currentSkills, newSkill]);
    setIsSkillModalOpen(false);
  }

  // Remove a skill from the form
  function removeSkill(index) {
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
  }

  // Update skill proficiency
  function updateSkillProficiency(index, newProficiency) {
    const skills = form.getValues("skills");
    const updatedSkills = [...skills];
    updatedSkills[index].proficiency = parseInt(newProficiency, 10);
    form.setValue("skills", updatedSkills);
  }

  // New skill form
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [newSkillId, setNewSkillId] = useState("");
  const [newSkillProficiency, setNewSkillProficiency] = useState(3);

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

        {/* Side-by-side layout for larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      Describe your teaching style, experience, and what
                      students can expect
                    </FormDescription>
                    <FormMessage />
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
                <Dialog
                  open={isSkillModalOpen}
                  onOpenChange={setIsSkillModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Add Skill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Skill</DialogTitle>
                      <DialogDescription>
                        Add a skill that you can teach to students.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <FormLabel>Skill Category</FormLabel>
                        <Select
                          value={newSkillCategory}
                          onValueChange={setNewSkillCategory}
                          disabled={skillsLoading}
                        >
                          <SelectTrigger>
                            {skillsLoading ? (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Select a category" />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {skillsData?.rootSkills?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Specific Skill</FormLabel>
                        <Select
                          value={newSkillId}
                          onValueChange={setNewSkillId}
                          disabled={
                            !newSkillCategory ||
                            getAvailableSkills(newSkillCategory).length === 0
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                newSkillCategory
                                  ? "Select a skill"
                                  : "First select a category"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableSkills(newSkillCategory).map(
                              (skill) => (
                                <SelectItem key={skill.id} value={skill.id}>
                                  {skill.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Proficiency Level</FormLabel>
                        <Select
                          value={String(newSkillProficiency)}
                          onValueChange={(value) =>
                            setNewSkillProficiency(parseInt(value, 10))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SKILL_LEVELS.map((proficiency) => (
                              <SelectItem
                                key={proficiency}
                                value={String(proficiency)}
                              >
                                {renderProficiency({
                                  proficiency,
                                  framework: getSkillFramework(newSkillId),
                                })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <DialogFooter className="mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsSkillModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={() =>
                            addSkill(
                              newSkillCategory,
                              newSkillId,
                              newSkillProficiency
                            )
                          }
                          disabled={!newSkillId}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {formValues.skills.filter((s) => !s.isDeleted).length > 0 ? (
                  formValues.skills.map(
                    (skillItem, index) =>
                      !skillItem.isDeleted && (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <GraduationCap className="h-5 w-5 text-muted-foreground" />
                              <div className="font-medium">
                                {skillItem.skillName}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Select
                                value={String(skillItem.proficiency)}
                                onValueChange={(value) =>
                                  updateSkillProficiency(index, value)
                                }
                              >
                                <SelectTrigger className="w-[220px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SKILL_LEVELS.map((proficiency) => (
                                    <SelectItem
                                      key={proficiency}
                                      value={String(proficiency)}
                                    >
                                      {renderProficiency({
                                        proficiency,
                                        framework: getSkillFramework(
                                          skillItem.skillId
                                        ),
                                      })}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSkill(index)}
                                className="h-8 w-8 rounded-full"
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                  )
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-8 flex flex-col items-center justify-center">
                      <GraduationCap className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground text-center">
                        You have not added any teaching skills yet.
                        <br />
                        Click Add Skill to add skills you can teach.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
