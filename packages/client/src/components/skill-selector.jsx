
import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Loader2, Plus, Trash2, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { renderProficiency } from "@/lib/utils";

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

// Query a specific skill category by ID
const GET_SKILL_BY_ID = gql`
  query GetSkillById($id: PostgresID!) {
    skillById(id: $id) {
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

export function SkillSelector({
  skills = [],
  onAddSkill,
  onRemoveSkill,
  onUpdateProficiency,
  buttonLabel = "Add Skill",
  dialogTitle = "Add New Skill",
  dialogDescription = "Add a skill to your profile.",
  skillCategoryId = null, // If provided, will fetch only this category
  showProficiency = true,
  icon,
  proficiencyLevels = [1, 2, 3, 4, 5, 6, 7],
  defaultProficiency = 3,
  sectionLabel = skillCategoryId ? "Languages" : "Skills", // New prop for section label
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [skillCategory, setSkillCategory] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [proficiency, setProficiency] = useState(defaultProficiency);

  // Use the appropriate query based on whether a specific category ID is provided
  const { data: skillsData, loading: skillsLoading } = useQuery(
    skillCategoryId ? GET_SKILL_BY_ID : GET_SKILLS,
    {
      variables: skillCategoryId ? { id: skillCategoryId } : {},
      skip: skillCategoryId === null && !isOpen, // Only fetch if open or if specific category
    },
  );

  // Get categories for selection or use the single category if specified
  const getCategories = () => {
    if (skillCategoryId) {
      return skillsData?.skillById ? [skillsData.skillById] : [];
    }
    return skillsData?.rootSkills || [];
  };

  // Get available skills for the selected category
  const getAvailableSkills = (categoryId) => {
    if (!categoryId) return [];

    let category;
    if (skillCategoryId) {
      category = skillsData?.skillById;
    } else {
      category = skillsData?.rootSkills?.find((r) => r.id === categoryId);
    }

    if (!category || !category.children) return [];

    const currentSkillIds = skills.map((s) => s.skillId);
    return category.children.filter(
      (child) => !currentSkillIds.includes(child.id),
    );
  };

  // Find the framework for a given skill
  const getSkillFramework = (skillId) => {
    if (!skillId) return null;

    const categories = getCategories();
    for (const category of categories) {
      if (category.children) {
        const skill = category.children.find((s) => s.id === skillId);
        if (skill) {
          return skill.framework;
        }
      }
    }
    return null;
  };

  // Handle adding a new skill
  const handleAddSkill = () => {
    if (!selectedSkillId) return;

    const categories = getCategories();
    for (const category of categories) {
      if (category.children) {
        const skill = category.children.find((s) => s.id === selectedSkillId);
        if (skill) {
          onAddSkill({
            skillId: skill.id,
            proficiency,
            skillName: skill.name,
            framework: skill.framework,
          });

          // Reset form
          setSelectedSkillId("");
          setProficiency(defaultProficiency);
          setIsOpen(false);
          return;
        }
      }
    }
  };

  return (
    <div>
      {/* Display selected skills */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between mb-3">
            <FormLabel>{sectionLabel}</FormLabel>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                {buttonLabel}
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>{dialogDescription}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {!skillCategoryId && (
                <div className="space-y-2">
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={skillCategory}
                    onValueChange={setSkillCategory}
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
                      {getCategories().map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <FormLabel>
                  {skillCategoryId ? "Language" : "Specific Skill"}
                </FormLabel>
                <Select
                  value={selectedSkillId}
                  onValueChange={setSelectedSkillId}
                  disabled={
                    (!skillCategory && !skillCategoryId) ||
                    getAvailableSkills(skillCategory || skillCategoryId)
                      .length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        skillCategoryId || skillCategory
                          ? "Select a skill"
                          : "First select a category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSkills(skillCategory || skillCategoryId).map(
                      (skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {showProficiency && (
                <div className="space-y-2">
                  <FormLabel>Proficiency Level</FormLabel>
                  <Select
                    value={String(proficiency)}
                    onValueChange={(value) =>
                      setProficiency(parseInt(value, 10))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {proficiencyLevels.map((level) => (
                        <SelectItem key={level} value={String(level)}>
                          {renderProficiency({
                            proficiency: level,
                            framework: getSkillFramework(selectedSkillId),
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!selectedSkillId}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {skillCategoryId ? "Language" : "Skill"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
        {skills.length > 0 ? (
          skills.map((skillItem) => (
            <Card key={skillItem.skillId} className="overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {icon || <div className="h-5 w-5" />}
                  <div className="font-medium">{skillItem.skillName}</div>
                </div>

                <div className="flex items-center gap-2">
                  {showProficiency && (
                    <Select
                      value={String(skillItem.proficiency)}
                      onValueChange={(value) =>
                        onUpdateProficiency(
                          skillItem.skillId,
                          parseInt(value, 10),
                        )
                      }
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {proficiencyLevels.map((level) => (
                          <SelectItem key={level} value={String(level)}>
                            {renderProficiency({
                              proficiency: level,
                              framework: skillItem.framework,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveSkill(skillItem.skillId)}
                    className="h-8 w-8 rounded-full"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center justify-center">
              {icon || <div className="h-10 w-10 text-muted-foreground mb-3" />}
              <p className="text-muted-foreground text-center">
                No {skillCategoryId ? "languages" : "skills"} added yet.
                <br />
                Click {buttonLabel} to add{" "}
                {skillCategoryId ? "languages" : "skills"}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
