"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SkillSelectorCompact } from "@/components/skill-selector-compact";
import { BookOpen, GraduationCap } from "lucide-react";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { gql, useQuery } from "@apollo/client";

// Use the same query as the SkillSelectorCompact
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

export const TeacherListFilters = ({ initialFilters = {} }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  // Fetch all skills
  const { data: skillsData } = useQuery(GET_SKILLS);

  // Map to quickly look up skill details
  const [skillMap, setSkillMap] = useState({});

  // Set up form with initial values
  const methods = useForm({
    defaultValues: {
      teachingSkills: [],
      studentSkills: [],
    },
  });

  // Build skill map once on load
  useEffect(() => {
    if (skillsData?.rootSkills && !initialized) {
      // Create a map of all skills for quick lookup
      const map = {};

      // Process root skills and their children
      skillsData.rootSkills.forEach((category) => {
        if (category.children) {
          category.children.forEach((skill) => {
            map[skill.id] = {
              id: skill.id,
              name: skill.name,
              framework: skill.framework,
            };
          });
        }
      });

      setSkillMap(map);

      // Initialize form with filter values
      const teachingSkills = (initialFilters?.teachingSkills || []).map((f) =>
        enhanceSkill(f, map)
      );
      const studentSkills = (initialFilters?.studentSkills || []).map((f) =>
        enhanceSkill(f, map)
      );

      methods.setValue("teachingSkills", teachingSkills);
      methods.setValue("studentSkills", studentSkills);

      setInitialized(true);
    }
  }, [skillsData, initialized, initialFilters, methods]);

  // Helper function to enhance a skill with display data
  function enhanceSkill(filter, map) {
    const skill = map[filter.skillId];
    return {
      skillId: filter.skillId,
      proficiency: parseInt(filter.proficiency || "5", 10),
      skillName: skill?.name || filter.skillId,
      framework: skill?.framework || "DEFAULT",
      skill: skill || {
        id: filter.skillId,
        name: filter.skillId,
        framework: "DEFAULT",
      },
    };
  }

  // Update URL directly (much faster than server actions)
  const updateURL = (teachingSkills, studentSkills) => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams);

    // Update teaching skills param
    if (teachingSkills?.length) {
      params.set(
        "teaching",
        teachingSkills
          .map((skill) => `${skill.skillId}:${skill.proficiency}`)
          .join(",")
      );
    } else {
      params.delete("teaching");
    }

    // Update student skills param
    if (studentSkills?.length) {
      params.set(
        "student",
        studentSkills
          .map((skill) => `${skill.skillId}:${skill.proficiency}`)
          .join(",")
      );
    } else {
      params.delete("student");
    }

    // Reset pagination when filters change
    params.set("offset", "0");

    // Update URL without full navigation - much faster
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle adding a skill
  const handleAddSkill = (filterType, skill) => {
    const currentSkills = methods.getValues(filterType) || [];
    const updatedSkills = [...currentSkills, skill];
    methods.setValue(filterType, updatedSkills);

    // Update URL immediately
    if (filterType === "teachingSkills") {
      updateURL(updatedSkills, methods.getValues("studentSkills"));
    } else {
      updateURL(methods.getValues("teachingSkills"), updatedSkills);
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (filterType, index) => {
    const currentSkills = methods.getValues(filterType) || [];
    const updatedSkills = [...currentSkills];
    updatedSkills.splice(index, 1);
    methods.setValue(filterType, updatedSkills);

    // Update URL immediately
    if (filterType === "teachingSkills") {
      updateURL(updatedSkills, methods.getValues("studentSkills"));
    } else {
      updateURL(methods.getValues("teachingSkills"), updatedSkills);
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
                      onRemoveSkill={(index) =>
                        handleRemoveSkill("teachingSkills", index)
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
                      onRemoveSkill={(index) =>
                        handleRemoveSkill("studentSkills", index)
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
