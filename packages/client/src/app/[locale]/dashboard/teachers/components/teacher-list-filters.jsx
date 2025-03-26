"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { SkillSelectorCompact } from "@/components/skill-selector-compact";
import { BookOpen, GraduationCap, Globe } from "lucide-react";
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
      languages: [],
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
        languages:
          filterType === "languages"
            ? updatedSkills
            : methods.getValues("languages"),
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
        languages:
          filterType === "languages"
            ? updatedSkills
            : methods.getValues("languages"),
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
        languages:
          filterType === "languages"
            ? updatedSkills
            : methods.getValues("languages"),
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
                      label="I would like to learn"
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
                      label="I can offer these skills"
                      dialogTitle="Skills I can offer"
                      dialogDescription="Some teachers offer class bartering"
                      icon={<GraduationCap className="h-4 w-4 text-primary" />}
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
                      label="Should speak at least"
                      dialogTitle="Filter by Languages"
                      dialogDescription="Select languages you want teachers to speak"
                      icon={<Globe className="h-4 w-4 text-primary" />}
                      showProficiency={true}
                      defaultProficiency={5}
                      placeholder="Select languages..."
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
