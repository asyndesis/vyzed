"use client";

import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, X } from "lucide-react";
import UserSkillBadge from "@/components/user-skill-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormLabel } from "@/components/ui/form";
import { Loader2, Plus, Edit } from "lucide-react";
import { renderProficiency } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  onUpdateSkill,
  label = "Skills",
  skillCategoryId = null,
  dialogTitle = "Add New Skill",
  dialogDescription = "Select a skill to add.",
  showProficiency = true,
  proficiencyLevels = [1, 2, 3, 4, 5, 6, 7],
  defaultProficiency = 3,
  placeholder = "Select skills...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [skillCategory, setSkillCategory] = useState(skillCategoryId || "");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [proficiency, setProficiency] = useState(defaultProficiency);
  const [popoverOpen, setPopoverOpen] = useState(false);

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
      (category) => category.id === skillCategoryId,
    );
  };

  // Get available skills for the selected category
  const getAvailableSkills = (categoryId) => {
    if (!categoryId) return [];

    const category = skillsData?.rootSkills?.find((r) => r.id === categoryId);
    if (!category || !category.children) return [];

    // When editing, exclude all skills except the one being edited
    const excludedSkillIds = skills
      .filter((s) => (isEditing ? s.skillId !== editingSkillId : true))
      .map((s) => s.skillId);

    return category.children.filter(
      (child) => !excludedSkillIds.includes(child.id),
    );
  };

  // Find the skill category for a given skillId
  const findSkillCategory = (skillId) => {
    if (!skillId || !skillsData?.rootSkills) return null;

    for (const category of skillsData.rootSkills) {
      if (category.children) {
        const match = category.children.find((s) => s.id === skillId);
        if (match) return category.id;
      }
    }
    return null;
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

  // Find skill by ID in the skills array
  const findSkillById = (skillId) => {
    return skills.find((skill) => skill.skillId === skillId);
  };

  // Open dialog for adding a new skill
  const openAddDialog = () => {
    setIsEditing(false);
    setEditingSkillId(null);
    setSelectedSkillId("");
    setSkillCategory(skillCategoryId || "");
    setProficiency(defaultProficiency);
    setIsOpen(true);
  };

  // Open dialog for editing an existing skill
  const openEditDialog = (skillId) => {
    const skill = findSkillById(skillId);
    if (!skill) return;

    setIsEditing(true);
    setEditingSkillId(skillId);
    setSelectedSkillId(""); // Clear it to allow selecting a new skill

    // Find and set the category
    if (skillsData?.rootSkills) {
      const categoryId = findSkillCategory(skillId);
      if (categoryId) {
        setSkillCategory(categoryId);
      }
    }

    setProficiency(skill.proficiency);
    setIsOpen(true);
  };

  // Handle adding or updating a skill
  const handleSaveSkill = () => {
    if (!selectedSkillId && !isEditing) return;

    // If we're editing but no new skill is selected, just update proficiency
    const skillIdToUse = selectedSkillId || editingSkillId;

    const categories = getCategories();
    for (const category of categories) {
      if (category.children) {
        const skill = category.children.find((s) => s.id === skillIdToUse);
        if (skill) {
          const skillData = {
            skillId: skill.id,
            proficiency: proficiency,
            skillName: skill.name,
            framework: skill.framework,
            skill: {
              id: skill.id,
              name: skill.name,
              framework: skill.framework,
            },
            id:
              isEditing && findSkillById(editingSkillId)?.id
                ? findSkillById(editingSkillId).id
                : `temp-${Math.random().toString(36).substr(2, 9)}`,
          };

          if (isEditing) {
            onUpdateSkill(editingSkillId, skillData);
          } else {
            onAddSkill(skillData);
          }

          // Reset form and close dialog
          resetForm();
          return;
        }
      }
    }
  };

  // Reset form fields and close dialog
  const resetForm = () => {
    setSelectedSkillId("");
    setSkillCategory(skillCategoryId || "");
    setProficiency(defaultProficiency);
    setIsEditing(false);
    setEditingSkillId(null);
    setIsOpen(false);
  };

  // Handle removing a skill
  const handleRemoveSkill = () => {
    if (isEditing && editingSkillId) {
      onRemoveSkill(editingSkillId);
      resetForm();
    }
  };

  // Handle clearing all skills
  const handleClearAll = () => {
    skills.forEach((skill) => onRemoveSkill(skill.skillId));
    setPopoverOpen(false);
  };

  return (
    <div className="space-y-0">
      <FormLabel className="text-sm font-medium mb-2 block">{label}</FormLabel>
      {skills.length === 0 ? (
        <div
          className="flex items-center h-10 px-3 py-2 border rounded-md relative cursor-pointer"
          onClick={openAddDialog}
        >
          <span className="text-muted-foreground truncate overflow-hidden">
            {placeholder}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto rounded-full h-7 w-7 p-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only">Add skill</span>
          </Button>
        </div>
      ) : skills.length === 1 ? (
        <div className="flex items-center h-10 px-3 py-2 border rounded-md relative">
          <UserSkillBadge
            userSkill={skills[0]}
            onClick={() => openEditDialog(skills[0].skillId)}
            onRemove={() => onRemoveSkill(skills[0].skillId)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto rounded-full h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              openAddDialog();
            }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only">Add skill</span>
          </Button>
        </div>
      ) : (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center h-10 px-3 py-2 border rounded-md cursor-pointer relative">
              <span>{skills.length} skills selected</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto rounded-full h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  openAddDialog();
                }}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only">Add skill</span>
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 min-w-[250px]">
            <div className="flex justify-between items-center mb-2 pb-1">
              <span className="text-sm font-medium">Selected Skills</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-xs h-7 px-2 flex items-center"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {skills.map((skill) => (
                <div
                  key={skill.skillId}
                  onClick={() => {
                    openEditDialog(skill.skillId);
                    setPopoverOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <UserSkillBadge
                    userSkill={skill}
                    onRemove={() => onRemoveSkill(skill.skillId)}
                  />
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          else setIsOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Skill" : dialogTitle}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update skill details" : dialogDescription}
            </DialogDescription>
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
                      isEditing
                        ? findSkillById(editingSkillId)?.skillName ||
                          "Change skill"
                        : skillCategory
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
                  onValueChange={(value) => setProficiency(parseInt(value, 10))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {proficiencyLevels.map((level) => (
                      <SelectItem key={level} value={String(level)}>
                        {renderProficiency({
                          proficiency: level,
                          framework:
                            isEditing && !selectedSkillId
                              ? findSkillById(editingSkillId)?.framework
                              : getSkillFramework(selectedSkillId),
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <DialogFooter className="mt-6">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRemoveSkill}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
              <Button
                type="button"
                onClick={handleSaveSkill}
                disabled={!selectedSkillId && !isEditing}
              >
                {isEditing ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
