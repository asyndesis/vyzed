"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { SkillSelectorCompact } from "@/components/skill-selector-compact";
import { BookOpen, Languages, ArrowLeftRight, HelpCircle } from "lucide-react";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { gql, useQuery } from "@apollo/client";
import { Switch } from "@/components/ui/switch";
import { FormLabel } from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    me {
      id
      firstName
      lastName
      lastInitial
      email
      teacherProfile {
        id
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
  }
`;

export const TeacherListFilters = ({ initialFilters = {}, onFilterChange }) => {
  const [initialized, setInitialized] = useState(false);
  const [offerMySkills, setOfferMySkills] = useState(
    !!initialFilters?.allowBarter
  );
  const { data: skillsData } = useQuery(GET_SKILLS);
  const { data: profileData } = useQuery(GET_MY_PROFILE);

  // Set up form with initial values
  const methods = useForm({
    defaultValues: {
      teachingSkills: [],
      studentSkills: [],
      languages: [],
      allowBarter: false,
    },
  });

  // Initialize form values from initialFilters
  useEffect(() => {
    if (skillsData?.rootSkills && !initialized) {
      const enhanceSkill = (filter) => {
        // Find the skill details in the skills data
        let skillDetails = null;

        for (const category of skillsData.rootSkills) {
          if (category.children) {
            const found = category.children.find(
              (s) => s.id === filter.skillId
            );
            if (found) {
              skillDetails = found;
              break;
            }
          }
        }

        return {
          skillId: filter.skillId,
          proficiency: parseInt(filter.proficiency || "5", 10),
          skillName: skillDetails?.name || filter.skillId,
          framework: skillDetails?.framework || "DEFAULT",
          skill: skillDetails || {
            id: filter.skillId,
            name: filter.skillId,
            framework: "DEFAULT",
          },
        };
      };

      // Initialize form with filter values
      if (initialFilters?.teachingSkills?.length) {
        const teachingSkills = initialFilters.teachingSkills.map(enhanceSkill);
        methods.setValue("teachingSkills", teachingSkills);
      }

      if (initialFilters?.studentSkills?.length) {
        const studentSkills = initialFilters.studentSkills.map(enhanceSkill);
        methods.setValue("studentSkills", studentSkills);
      }

      if (initialFilters?.languages?.length) {
        const languages = initialFilters.languages.map(enhanceSkill);
        methods.setValue("languages", languages);
      }

      if (initialFilters?.allowBarter) {
        methods.setValue("allowBarter", initialFilters.allowBarter);
      }

      setInitialized(true);
    }
  }, [skillsData, initialized, initialFilters, methods]);

  // Update handlers to notify parent
  const handleAddSkill = (filterType, skill) => {
    const currentSkills = methods.getValues(filterType) || [];
    const updatedSkills = [...currentSkills, skill];
    methods.setValue(filterType, updatedSkills);
    notifyFilterChange(filterType, updatedSkills);
  };

  const handleUpdateSkill = (filterType, skillId, updatedSkill) => {
    const currentSkills = methods.getValues(filterType) || [];
    const updatedSkills = currentSkills.map((skill) =>
      skill.skillId === skillId ? updatedSkill : skill
    );
    methods.setValue(filterType, updatedSkills);
    notifyFilterChange(filterType, updatedSkills);
  };

  const handleRemoveSkill = (filterType, skillId) => {
    const currentSkills = methods.getValues(filterType) || [];
    const updatedSkills = currentSkills.filter(
      (skill) => skill.skillId !== skillId
    );
    methods.setValue(filterType, updatedSkills);
    notifyFilterChange(filterType, updatedSkills);
  };

  const handleToggleOfferMySkills = (checked) => {
    setOfferMySkills(checked);
    methods.setValue("allowBarter", checked);

    let studentSkills = [];
    if (checked && profileData?.me?.teacherProfile?.skills) {
      // Convert teacher profile skills to student skills format
      studentSkills = profileData.me.teacherProfile.skills.map((skill) => ({
        skillId: skill.skill.id,
        proficiency: skill.proficiency,
        skillName: skill.skill.name,
        framework: skill.skill.framework,
        skill: skill.skill,
      }));
    }

    methods.setValue("studentSkills", studentSkills);
    notifyFilterChange("studentSkills", studentSkills, checked);
  };

  // Helper function to avoid repeating the same pattern
  const notifyFilterChange = (
    filterType,
    updatedSkills,
    barterOverride = undefined
  ) => {
    if (!onFilterChange) return;

    const allowBarter =
      barterOverride !== undefined
        ? barterOverride
        : methods.getValues("allowBarter");

    onFilterChange({
      teachingSkills:
        filterType === "teachingSkills"
          ? updatedSkills
          : methods.getValues("teachingSkills"),
      studentSkills:
        filterType === "studentSkills"
          ? updatedSkills
          : methods.getValues("studentSkills"),
      languages:
        filterType === "languages"
          ? updatedSkills
          : methods.getValues("languages"),
      allowBarter,
    });
  };

  if (!initialized) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="h-20 flex items-center justify-center">
            <p className="text-muted-foreground">Loading filters...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormProvider {...methods}>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Form {...methods}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <FormField
                control={methods.control}
                name="teachingSkills"
                render={() => (
                  <FormItem>
                    <SkillSelectorCompact
                      skills={methods.getValues("teachingSkills") || []}
                      onAddSkill={(skill) =>
                        handleAddSkill("teachingSkills", skill)
                      }
                      onRemoveSkill={(skillId) =>
                        handleRemoveSkill("teachingSkills", skillId)
                      }
                      onUpdateSkill={(skillId, skill) =>
                        handleUpdateSkill("teachingSkills", skillId, skill)
                      }
                      label={
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          Offers classes in
                        </div>
                      }
                      dialogTitle="Filter by Teaching Skills"
                      dialogDescription="Select skills you want teachers to have"
                      showProficiency={true}
                      defaultProficiency={5}
                    />
                  </FormItem>
                )}
              />

              {/* Language Filter */}
              <FormField
                control={methods.control}
                name="languages"
                render={() => (
                  <FormItem>
                    <SkillSelectorCompact
                      skills={methods.getValues("languages") || []}
                      onAddSkill={(skill) => handleAddSkill("languages", skill)}
                      onRemoveSkill={(skillId) =>
                        handleRemoveSkill("languages", skillId)
                      }
                      onUpdateSkill={(skillId, skill) =>
                        handleUpdateSkill("languages", skillId, skill)
                      }
                      skillCategoryId="clqwertyu00" // Language category ID
                      label={
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4 text-muted-foreground" />
                          Can speak
                        </div>
                      }
                      dialogTitle="Filter by Languages"
                      dialogDescription="Select languages you want teachers to speak"
                      showProficiency={true}
                      defaultProficiency={5}
                      placeholder="Select languages..."
                    />
                  </FormItem>
                )}
              />

              {/* Student Skills section with toggle */}
              <FormField
                control={methods.control}
                name="studentSkills"
                render={() => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                        <span>Is interested in bartering</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              When enabled, we will show you teachers who are
                              willing to barter their classes or sessions for
                              your classes or sessions.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Accept class exchanges instead of money
                      </div>
                    </div>
                    <Switch
                      checked={offerMySkills}
                      onCheckedChange={handleToggleOfferMySkills}
                      id="offer-my-skills"
                    />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};
