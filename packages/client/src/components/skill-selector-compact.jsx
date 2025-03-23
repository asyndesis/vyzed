"use client";

import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import UserSkillBadge from "@/components/user-skill-badge";
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
import { FormLabel } from "@/components/ui/form";
import { Loader2, Plus } from "lucide-react";
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

export function SkillSelectorCompact({
  skills = [],
  onAddSkill,
  onRemoveSkill,
  label = "Skills",
  skillCategoryId = null, // If provided, will filter to only this category
  dialogTitle = "Add New Skill",
  dialogDescription = "Select a skill to add.",
  showProficiency = true,
  proficiencyLevels = [1, 2, 3, 4, 5, 6, 7],
  defaultProficiency = 3,
  icon,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [skillCategory, setSkillCategory] = useState(skillCategoryId || "");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [proficiency, setProficiency] = useState(defaultProficiency);

  // Use the skills query
  const { data: skillsData, loading: skillsLoading } = useQuery(GET_SKILLS, {
    skip: !isOpen, // Only fetch if open
  });

  // Get categories for selection
  const getCategories = () => {
    return skillsData?.rootSkills || [];
  };

  // Get filtered categories if categoryId is provided
  const getFilteredCategories = () => {
    if (!skillCategoryId) {
      return getCategories();
    }
    return getCategories().filter(
      (category) => category.id === skillCategoryId
    );
  };

  // Get available skills for the selected category
  const getAvailableSkills = (categoryId) => {
    if (!categoryId) return [];

    const category = skillsData?.rootSkills?.find((r) => r.id === categoryId);
    if (!category || !category.children) return [];

    const currentSkillIds = skills.map((s) => s.skillId);
    return category.children.filter(
      (child) => !currentSkillIds.includes(child.id)
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
          // Add the skill
          onAddSkill({
            skillId: skill.id,
            proficiency: proficiency,
            skillName: skill.name,
            framework: skill.framework,
            skill: {
              id: skill.id,
              name: skill.name,
              framework: skill.framework,
            },
            id: `temp-${Math.random().toString(36).substr(2, 9)}`,
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

  // Handle removing a skill by skillId
  const handleRemoveSkill = (skillIdToRemove) => {
    const index = skills.findIndex(
      (skill) => skill.skillId === skillIdToRemove
    );
    if (index !== -1) {
      onRemoveSkill(index);
    }
  };

  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>

      <div className="flex flex-wrap gap-2 items-center">
        {skills.map((skill) => (
          <div
            key={skill.skillId}
            onClick={() => handleRemoveSkill(skill.skillId)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            title="Click to remove"
          >
            <UserSkillBadge userSkill={skill} />
          </div>
        ))}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full h-8 w-8 p-0"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only">Add skill</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[400px]">
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
                      {getFilteredCategories().map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <FormLabel>Skill</FormLabel>
                <Select
                  value={selectedSkillId}
                  onValueChange={setSelectedSkillId}
                  disabled={
                    !skillCategory ||
                    getAvailableSkills(skillCategory).length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        skillCategory
                          ? "Select a skill"
                          : "First select a category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSkills(skillCategory).map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name}
                      </SelectItem>
                    ))}
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
                  Add Skill
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
