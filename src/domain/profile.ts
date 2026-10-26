import { SKILL_KINDS, type SkillKind } from "./skills";

// The profile editor's form state, and how it maps to and from the API

export const BIO_MAX = 500;

export type ProfileSkill = {
  skillId: string;
  proficiency: number;
  skill: { id: string; name: string; framework: "CEFR" | "DEFAULT" };
};

export type ProfileSource = {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  priceAmount: number;
  allowBarter: boolean;
  skills: Array<ProfileSkill & { kind: SkillKind }>;
};

export type ProfileForm = {
  firstName: string;
  lastName: string;
  bio: string;
  price: string; // whole euros as typed, "" = free
  allowBarter: boolean;
} & Record<SkillKind, ProfileSkill[]>;

export function toProfileForm(me: ProfileSource): ProfileForm {
  const of = (kind: SkillKind) =>
    me.skills
      .filter((s) => s.kind === kind)
      .map(({ skillId, proficiency, skill }) => ({
        skillId,
        proficiency,
        skill,
      }));
  return {
    firstName: me.firstName ?? "",
    lastName: me.lastName ?? "",
    bio: me.bio ?? "",
    price: me.priceAmount ? String(me.priceAmount / 100) : "",
    allowBarter: me.allowBarter,
    speaks: of("speaks"),
    teaches: of("teaches"),
    learns: of("learns"),
  };
}

// Typed euros to cents; blank, negative or garbage means free
export function priceToCents(price: string) {
  const n = parseFloat(price);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
}

export function toProfileInput(f: ProfileForm) {
  return {
    firstName: f.firstName.trim(),
    lastName: f.lastName.trim(),
    bio: f.bio.trim().slice(0, BIO_MAX),
    priceAmount: priceToCents(f.price),
    allowBarter: f.allowBarter,
    skills: SKILL_KINDS.flatMap((kind) =>
      f[kind].map(({ skillId, proficiency }) => ({
        skillId,
        proficiency,
        kind,
      })),
    ),
  };
}

// Compares what would be saved, so whitespace or "20" vs "20.0" doesn't count as a change
export const isProfileDirty = (form: ProfileForm, saved: ProfileForm) =>
  JSON.stringify(toProfileInput(form)) !==
  JSON.stringify(toProfileInput(saved));
