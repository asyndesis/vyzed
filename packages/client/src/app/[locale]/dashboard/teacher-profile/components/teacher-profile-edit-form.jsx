"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { renderProficiency, getProficiencyBadge, cn } from "@/lib/utils";

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
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Loader2,
  GraduationCap,
  Save,
  User,
  BookOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Single GraphQL mutation for updating the entire profile
const UPDATE_TEACHER_PROFILE = gql`
  mutation UpdateTeacherProfile(
    $id: PostgresID!
    $input: UpdateTeacherProfileInput!
  ) {
    updateTeacherProfile(id: $id, input: $input) {
      id
      name
      bio
      skills {
        id
        proficiency
        skill {
          id
          name
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
      children {
        id
        name
      }
    }
  }
`;

// Combined form schema
const profileSchema = z.object({
  name: z.string().optional(),
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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  // Initialize skills from profile
  const initialSkills =
    profile.skills?.map((skill) => ({
      id: skill.id,
      skillId: skill.skill.id,
      proficiency: skill.proficiency,
      skillName: skill.skill.name,
      isDeleted: false,
      isNew: false,
    })) || [];

  // Mutation for updating the entire profile
  const [updateProfile] = useMutation(UPDATE_TEACHER_PROFILE);

  // Query for skills
  const { data: skillsData, loading: skillsLoading } = useQuery(GET_SKILLS);

  // Initialize form with all profile data
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || "",
      bio: profile.bio || "",
      skills: initialSkills,
    },
  });

  // Watch skills array for changes
  const watchedSkills = form.watch("skills");

  // Get available skills for the modal
  const getAvailableSkills = (categoryId) => {
    if (!categoryId || !skillsData?.rootSkills) return [];

    const category = skillsData.rootSkills.find((r) => r.id === categoryId);
    if (!category || !category.children) return [];

    const currentSkillIds = watchedSkills
      .filter((s) => !s.isDeleted)
      .map((s) => s.skillId);

    return category.children.filter(
      (child) => !currentSkillIds.includes(child.id)
    );
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
            name: values.name,
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
          isDeleted: false,
          isNew: false,
        }));

        form.reset({
          name: updatedProfile.name || "",
          bio: updatedProfile.bio || "",
          skills: updatedSkills,
        });
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
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile Information
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Teaching Skills
              </TabsTrigger>
            </TabsList>

            {/* Profile Information Tab */}
            <TabsContent value="profile" className="mt-6">
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={`${profile.user?.firstName || ""} ${profile.user?.lastName || ""}'s Teaching Profile`}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A name for your teaching profile that students will
                            see
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell students about your teaching experience and approach..."
                              className="min-h-32"
                              {...field}
                            />
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
              </div>
            </TabsContent>

            {/* Teaching Skills Tab */}
            <TabsContent value="skills" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Your Teaching Skills</h2>
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
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
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
                              {[1, 2, 3, 4, 5].map((level) => (
                                <SelectItem key={level} value={String(level)}>
                                  {renderProficiency({ proficiency: level })}
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

                {watchedSkills.filter((s) => !s.isDeleted).length > 0 ? (
                  <div className="space-y-2">
                    {watchedSkills.map(
                      (skillItem, index) =>
                        !skillItem.isDeleted && (
                          <Card key={index} className="overflow-hidden">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">
                                    {skillItem.skillName}
                                  </div>
                                  <Badge
                                    className={cn(
                                      "mt-1 text-xs font-normal",
                                      getProficiencyBadge(skillItem.proficiency)
                                    )}
                                  >
                                    {renderProficiency({
                                      proficiency: skillItem.proficiency,
                                    })}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Select
                                  value={String(skillItem.proficiency)}
                                  onValueChange={(value) =>
                                    updateSkillProficiency(index, value)
                                  }
                                >
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <SelectItem
                                        key={level}
                                        value={String(level)}
                                      >
                                        {renderProficiency({
                                          proficiency: level,
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
                    )}
                  </div>
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
            </TabsContent>
          </Tabs>

          {/* Consistent footer with save and done buttons */}
          <div className="flex justify-between pt-4 mt-6 border-t">
            <Button asChild variant="outline">
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Profile
              </Button>
              <Button asChild variant="default">
                <Link href="/dashboard">Done</Link>
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
