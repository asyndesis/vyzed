"use client";

import { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Update the query to fetch parent-child relationships
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

export function SkillSelector({ value, onChange, existingSkills = [] }) {
  const { data, loading } = useQuery(GET_SKILLS);
  const [selectedRootSkill, setSelectedRootSkill] = useState(null);
  const [availableChildSkills, setAvailableChildSkills] = useState([]);

  // Filter out skills that are already selected
  const getFilteredChildren = (children) => {
    if (!children) return [];
    return children.filter(
      (child) =>
        !existingSkills.some((existing) => existing.skill.id === child.id)
    );
  };

  // Get available root skills (those with available children)
  const availableRootSkills =
    data?.rootSkills.filter(
      (root) => getFilteredChildren(root.children).length > 0
    ) || [];

  // Update available child skills when root skill changes
  useEffect(() => {
    if (selectedRootSkill && data) {
      const rootSkill = data.rootSkills.find((r) => r.id === selectedRootSkill);
      if (rootSkill) {
        setAvailableChildSkills(getFilteredChildren(rootSkill.children));
      } else {
        setAvailableChildSkills([]);
      }
    } else {
      setAvailableChildSkills([]);
    }
  }, [selectedRootSkill, data, existingSkills]);

  // Reset child selection when root changes
  useEffect(() => {
    if (value && !availableChildSkills.some((child) => child.id === value)) {
      onChange("");
    }
  }, [selectedRootSkill]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Skill Category</Label>
          <Select
            value={selectedRootSkill || ""}
            onValueChange={setSelectedRootSkill}
            disabled={loading || availableRootSkills.length === 0}
          >
            <SelectTrigger id="category" className="w-full">
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading categories...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select a skill category" />
              )}
            </SelectTrigger>
            <SelectContent>
              {availableRootSkills.length === 0 ? (
                <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                  No categories available
                </div>
              ) : (
                <SelectGroup>
                  <SelectLabel>Skill Categories</SelectLabel>
                  {availableRootSkills.map((rootSkill) => (
                    <SelectItem key={rootSkill.id} value={rootSkill.id}>
                      {rootSkill.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skill">Specific Skill</Label>
          <Select
            value={value || ""}
            onValueChange={onChange}
            disabled={!selectedRootSkill || availableChildSkills.length === 0}
          >
            <SelectTrigger id="skill" className="w-full">
              <SelectValue
                placeholder={
                  selectedRootSkill
                    ? "Select a skill"
                    : "First select a category"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {!selectedRootSkill ? (
                <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                  First select a category
                </div>
              ) : availableChildSkills.length === 0 ? (
                <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                  No skills available in this category
                </div>
              ) : (
                <SelectGroup>
                  <SelectLabel>Available Skills</SelectLabel>
                  {availableChildSkills.map((childSkill) => (
                    <SelectItem key={childSkill.id} value={childSkill.id}>
                      {childSkill.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
