import { db } from "../../db";
import { builder } from "../builder";
import { SkillFrameworkEnum, SkillKindEnum } from "./enums";

export const Skill = builder.drizzleObject("skill", {
  name: "Skill",
  fields: (t) => ({
    id: t.exposeID("id"),
    slug: t.exposeString("slug"),
    name: t.exposeString("name"),
    framework: t.expose("framework", { type: SkillFrameworkEnum }),
    parent: t.relation("parent", { nullable: true }),
    children: t.relation("children", { query: { orderBy: { name: "asc" } } }),
  }),
});

// A user's link to a skill: what they speak, learn, or teach, and how well
export const UserSkill = builder.drizzleObject("userSkill", {
  name: "UserSkill",
  fields: (t) => ({
    kind: t.expose("kind", { type: SkillKindEnum }),
    proficiency: t.exposeInt("proficiency"),
    skillId: t.exposeID("skillId"),
    skill: t.relation("skill"),
  }),
});

builder.queryFields((t) => ({
  // Top-level categories (Language, Therapy, …) with their skills
  skills: t.drizzleField({
    type: ["skill"],
    resolve: (query) =>
      db.query.skill.findMany(
        query({
          where: { parentId: { isNull: true } },
          orderBy: { name: "asc" },
        }),
      ),
  }),
}));
