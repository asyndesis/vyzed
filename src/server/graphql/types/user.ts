import { and, eq } from "drizzle-orm";
import { can } from "@/domain/policies";
import { MAX_LEVEL, MIN_LEVEL } from "@/domain/skills";
import { db } from "../../db";
import { user, userSkill } from "../../db/schema";
import { builder, forbid, viewerOf } from "../builder";
import { SkillKindEnum } from "./enums";

export const User = builder.drizzleObject("user", {
  name: "User",
  fields: (t) => ({
    id: t.exposeID("id"),
    firstName: t.exposeString("firstName", { nullable: true }),
    // Public pages only show the last initial
    lastInitial: t.string({
      select: { columns: { lastName: true } },
      resolve: (u) => u.lastName?.charAt(0) ?? "",
    }),
    image: t.exposeString("image", { nullable: true }),
    bio: t.exposeString("bio", { nullable: true }),
    priceAmount: t.exposeInt("priceAmount"),
    priceCurrency: t.exposeString("priceCurrency"),
    allowBarter: t.exposeBoolean("allowBarter"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    skills: t.relation("skills", {
      args: { kind: t.arg({ type: SkillKindEnum }) },
      query: (args) => ({ where: args.kind ? { kind: args.kind } : {} }),
    }),

    // Private: null unless it's you (or an admin)
    lastName: t.string({
      nullable: true,
      select: { columns: { id: true, lastName: true } },
      resolve: (u, _, ctx) =>
        can(ctx.viewer, "user", "viewPrivate", u) ? u.lastName : null,
    }),
    email: t.string({
      nullable: true,
      select: { columns: { id: true, email: true } },
      resolve: (u, _, ctx) =>
        can(ctx.viewer, "user", "viewPrivate", u) ? u.email : null,
    }),
  }),
});

// Teachers = users with at least one "teaches" skill
const TeacherFilter = builder.inputType("TeacherFilter", {
  fields: (t) => ({
    search: t.string(),
    skillIds: t.idList({ description: "Teaches any of these" }),
    languageIds: t.idList({ description: "Speaks any of these" }),
    swapOnly: t.boolean(),
  }),
});

type TeacherFilterInput = typeof TeacherFilter.$inferInput;

const teacherWhere = (f: TeacherFilterInput | null | undefined) => {
  const search = f?.search?.trim();
  return {
    AND: [
      {
        skills: {
          kind: "teaches" as const,
          ...(f?.skillIds?.length && {
            skillId: { in: f.skillIds.map(String) },
          }),
        },
      },
      ...(f?.languageIds?.length
        ? [
            {
              skills: {
                kind: "speaks" as const,
                skillId: { in: f.languageIds.map(String) },
              },
            },
          ]
        : []),
      ...(f?.swapOnly ? [{ allowBarter: true }] : []),
      ...(search
        ? [
            {
              OR: [
                { firstName: { ilike: `%${search}%` } },
                { lastName: { ilike: `%${search}%` } },
              ],
            },
          ]
        : []),
    ],
  };
};

builder.queryFields((t) => ({
  me: t.drizzleField({
    type: "user",
    nullable: true,
    resolve: (query, _, __, ctx) =>
      ctx.viewer
        ? db.query.user.findFirst(query({ where: { id: ctx.viewer.id } }))
        : null,
  }),

  user: t.drizzleField({
    type: "user",
    nullable: true,
    args: { id: t.arg.id({ required: true }) },
    resolve: (query, _, { id }) =>
      db.query.user.findFirst(query({ where: { id: String(id) } })),
  }),

  teachers: t.drizzleField({
    type: ["user"],
    args: {
      filter: t.arg({ type: TeacherFilter }),
      limit: t.arg.int({ defaultValue: 12 }),
      offset: t.arg.int({ defaultValue: 0 }),
    },
    resolve: (query, _, { filter, limit, offset }) =>
      db.query.user.findMany(
        query({
          where: teacherWhere(filter),
          orderBy: { createdAt: "desc" },
          limit: Math.min(limit ?? 12, 50),
          offset: offset ?? 0,
        }),
      ),
  }),

  teacherCount: t.int({
    args: { filter: t.arg({ type: TeacherFilter }) },
    resolve: async (_, { filter }) =>
      (
        await db.query.user.findMany({
          where: teacherWhere(filter),
          columns: { id: true },
        })
      ).length,
  }),
}));

const UserSkillInput = builder.inputType("UserSkillInput", {
  fields: (t) => ({
    skillId: t.id({ required: true }),
    kind: t.field({ type: SkillKindEnum, required: true }),
    proficiency: t.int({
      required: true,
      description: `${MIN_LEVEL}-${MAX_LEVEL}`,
    }),
  }),
});

const UpdateProfileInput = builder.inputType("UpdateProfileInput", {
  fields: (t) => ({
    firstName: t.string(),
    lastName: t.string(),
    bio: t.string(),
    priceAmount: t.int({ description: "Cents per hour, 0 = free" }),
    allowBarter: t.boolean(),
    skills: t.field({
      type: [UserSkillInput],
      description: "Replaces all of your skills",
    }),
  }),
});

builder.mutationFields((t) => ({
  updateProfile: t.drizzleField({
    type: "user",
    authScopes: { loggedIn: true },
    args: { input: t.arg({ type: UpdateProfileInput, required: true }) },
    resolve: async (query, _, { input }, ctx) => {
      const viewer = viewerOf(ctx);
      if (!can(viewer, "user", "update", { id: viewer.id })) forbid();
      const { skills, ...fields } = input;
      if (fields.priceAmount != null && fields.priceAmount < 0)
        throw new Error("Price must be 0 or more");
      for (const s of skills ?? []) {
        if (s.proficiency < MIN_LEVEL || s.proficiency > MAX_LEVEL)
          throw new Error("Invalid proficiency");
      }

      await db.transaction(async (tx) => {
        const set = Object.fromEntries(
          Object.entries(fields).filter(
            ([, v]) => v !== undefined && v !== null,
          ),
        );
        if (Object.keys(set).length)
          await tx.update(user).set(set).where(eq(user.id, viewer.id));
        if (skills) {
          await tx
            .delete(userSkill)
            .where(and(eq(userSkill.userId, viewer.id)));
          if (skills.length)
            await tx.insert(userSkill).values(
              skills.map((s) => ({
                ...s,
                skillId: String(s.skillId),
                userId: viewer.id,
              })),
            );
        }
      });
      return db.query.user
        .findFirst(query({ where: { id: viewer.id } }))
        .then((u) => u!);
    },
  }),
}));
