"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { SkillSelectorCompact } from "@/components/skill-selector-compact";
import { BookOpen, GraduationCap } from "lucide-react";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { gql, useQuery } from "@apollo/client";

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

export const TeacherListFilters = ({ initialFilters = {}, onFilterChange }) => {
  const [initialized, setInitialized] = useState(false);
  const { data: skillsData } = useQuery(GET_SKILLS);

  // Set up form with initial values
  const methods = useForm({
    defaultValues: {
      teachingSkills: [],
      studentSkills: [],
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

      setInitialized(true);
    }
  }, [skillsData, initialized, initialFilters, methods]);

  // Update handlers to notify parent
  const handleAddSkill = (filterType, skill) => {
    const currentSkills = methods.getValues(filterType) || [];
    const updatedSkills = [...currentSkills, skill];
    methods.setValue(filterType, updatedSkills);

    if (onFilterChange) {
      onFilterChange({
        teachingSkills:
          filterType === "teachingSkills"
            ? updatedSkills
            : methods.getValues("teachingSkills"),
        studentSkills:
          filterType === "studentSkills"
            ? updatedSkills
            : methods.getValues("studentSkills"),
      });
    }
  };

  const handleUpdateSkill = (filterType, skillId, updatedSkill) => {
    const currentSkills = methods.getValues(filterType) || [];
    const updatedSkills = currentSkills.map((skill) =>
      skill.skillId === skillId ? updatedSkill : skill
    );
    methods.setValue(filterType, updatedSkills);

    if (onFilterChange) {
      onFilterChange({
        teachingSkills:
          filterType === "teachingSkills"
            ? updatedSkills
            : methods.getValues("teachingSkills"),
        studentSkills:
          filterType === "studentSkills"
            ? updatedSkills
            : methods.getValues("studentSkills"),
      });
    }
  };

  const handleRemoveSkill = (filterType, skillId) => {
    const currentSkills = methods.getValues(filterType) || [];
    const updatedSkills = currentSkills.filter(
      (skill) => skill.skillId !== skillId
    );
    methods.setValue(filterType, updatedSkills);

    if (onFilterChange) {
      onFilterChange({
        teachingSkills:
          filterType === "teachingSkills"
            ? updatedSkills
            : methods.getValues("teachingSkills"),
        studentSkills:
          filterType === "studentSkills"
            ? updatedSkills
            : methods.getValues("studentSkills"),
      });
    }
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Teaching Skills Filter */}
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
                      label="Teaching Skills"
                      dialogTitle="Filter by Teaching Skills"
                      dialogDescription="Select skills you want teachers to have"
                      icon={<BookOpen className="h-4 w-4 text-primary" />}
                      showProficiency={true}
                      defaultProficiency={5}
                    />
                  </FormItem>
                )}
              />

              {/* Student Skills Filter */}
              <FormField
                control={methods.control}
                name="studentSkills"
                render={() => (
                  <FormItem>
                    <SkillSelectorCompact
                      skills={methods.getValues("studentSkills") || []}
                      onAddSkill={(skill) =>
                        handleAddSkill("studentSkills", skill)
                      }
                      onRemoveSkill={(skillId) =>
                        handleRemoveSkill("studentSkills", skillId)
                      }
                      onUpdateSkill={(skillId, skill) =>
                        handleUpdateSkill("studentSkills", skillId, skill)
                      }
                      label="Learning Skills"
                      dialogTitle="Filter by Learning Skills"
                      dialogDescription="Select skills students want to learn"
                      icon={<GraduationCap className="h-4 w-4 text-primary" />}
                      showProficiency={true}
                      defaultProficiency={5}
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
