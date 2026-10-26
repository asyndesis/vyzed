// npm run db:seed — skills plus dummy teachers. Safe to re-run.
import "dotenv/config";
import { inArray, like } from "drizzle-orm";
import { db } from "./index";
import { skill, user, userSkill } from "./schema";

type SkillSeed = { name: string; cefr?: boolean; children: string[] };

const SKILLS: Record<string, SkillSeed> = {
  language: {
    name: "Language",
    cefr: true,
    children: ["Spanish", "English", "German"],
  },
  therapy: {
    name: "Therapy",
    children: [
      "Cognitive Behavioral Therapy (CBT)",
      "Psychoanalysis",
      "Family Therapy",
      "Art Therapy",
      "Mindfulness-Based Therapy",
    ],
  },
  programming: {
    name: "Programming",
    children: ["Python", "JavaScript", "Java", "C#", "Ruby", "PHP", "Go"],
  },
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const DOMAIN = "@dummy.vyzed.test";

type Level = [slug: string, proficiency: number];
const TEACHERS: Array<{
  firstName: string;
  lastName: string;
  price: number;
  barter: boolean;
  bio: string;
  speaks: Level[];
  teaches: Level[];
  learns: Level[];
}> = [
  {
    firstName: "Lucía",
    lastName: "Fernández",
    price: 2500,
    barter: true,
    bio: "Native speaker from Sevilla. Conversation-first lessons, lots of laughing, minimal grammar drills.",
    speaks: [
      ["spanish", 7],
      ["english", 5],
    ],
    teaches: [["spanish", 7]],
    learns: [["python", 1]],
  },
  {
    firstName: "Jonas",
    lastName: "Becker",
    price: 3500,
    barter: false,
    bio: "Backend engineer in Berlin, 10 years of Go and Python. I help people ship their first real project.",
    speaks: [
      ["german", 7],
      ["english", 5],
    ],
    teaches: [
      ["go", 6],
      ["python", 5],
    ],
    learns: [["spanish", 2]],
  },
  {
    firstName: "Amara",
    lastName: "Okafor",
    price: 0,
    barter: true,
    bio: "Frontend dev who loves teaching JavaScript from scratch. Happy to swap for language practice.",
    speaks: [["english", 7]],
    teaches: [["javascript", 6]],
    learns: [
      ["german", 1],
      ["spanish", 2],
    ],
  },
  {
    firstName: "Mateo",
    lastName: "Rossi",
    price: 4000,
    barter: false,
    bio: "Licensed therapist trained in CBT and mindfulness-based approaches. Sessions in English or Spanish.",
    speaks: [
      ["english", 5],
      ["spanish", 7],
    ],
    teaches: [
      ["cognitive-behavioral-therapy", 6],
      ["mindfulness-based-therapy", 5],
    ],
    learns: [],
  },
  {
    firstName: "Hannah",
    lastName: "Schmidt",
    price: 2000,
    barter: true,
    bio: "German teacher for beginners and travelers. Patient, structured, and big on real-life phrases.",
    speaks: [
      ["german", 7],
      ["english", 6],
    ],
    teaches: [
      ["german", 7],
      ["english", 5],
    ],
    learns: [["javascript", 1]],
  },
  {
    firstName: "Kenji",
    lastName: "Watanabe",
    price: 3000,
    barter: false,
    bio: "Java and C# developer, enterprise background. Great for interview prep and clean architecture.",
    speaks: [["english", 4]],
    teaches: [
      ["java", 6],
      ["csharp", 5],
    ],
    learns: [["german", 2]],
  },
  {
    firstName: "Sofia",
    lastName: "Almeida",
    price: 1500,
    barter: true,
    bio: "Art therapist working with adults and teens. Expressive, gentle sessions — no art skills needed.",
    speaks: [
      ["spanish", 5],
      ["english", 5],
    ],
    teaches: [
      ["art-therapy", 6],
      ["family-therapy", 4],
    ],
    learns: [["python", 1]],
  },
  {
    firstName: "Oliver",
    lastName: "Brooks",
    price: 0,
    barter: true,
    bio: "Ruby and PHP old-timer. I'll teach you to build web apps for free in exchange for Spanish practice.",
    speaks: [["english", 7]],
    teaches: [
      ["ruby", 6],
      ["php", 5],
    ],
    learns: [["spanish", 1]],
  },
  {
    firstName: "Elena",
    lastName: "Petrova",
    price: 5000,
    barter: false,
    bio: "Psychoanalyst with a private practice. Long-form, reflective sessions.",
    speaks: [
      ["english", 5],
      ["german", 4],
    ],
    teaches: [["psychoanalysis", 6]],
    learns: [],
  },
  {
    firstName: "Diego",
    lastName: "Morales",
    price: 1800,
    barter: true,
    bio: "Spanish from Mexico City, plus beginner Python. Lessons are relaxed and practical.",
    speaks: [
      ["spanish", 7],
      ["english", 4],
    ],
    teaches: [
      ["spanish", 7],
      ["python", 3],
    ],
    learns: [["german", 1]],
  },
];

async function seedSkills() {
  for (const [slug, parent] of Object.entries(SKILLS)) {
    const framework = parent.cefr ? "CEFR" : "DEFAULT";
    const [row] = await db
      .insert(skill)
      .values({ slug, name: parent.name, framework })
      .onConflictDoUpdate({
        target: skill.slug,
        set: { name: parent.name, framework },
      })
      .returning();
    for (const name of parent.children) {
      await db
        .insert(skill)
        .values({ slug: slugify(name), name, framework, parentId: row.id })
        .onConflictDoUpdate({
          target: skill.slug,
          set: { name, framework, parentId: row.id },
        });
    }
  }
}

async function seedTeachers() {
  const skills = await db
    .select({ id: skill.id, slug: skill.slug })
    .from(skill);
  const idOf = new Map(skills.map((s) => [s.slug, s.id]));

  // Cascades remove their user_skill rows
  await db.delete(user).where(like(user.email, `%${DOMAIN}`));

  for (const [i, t] of TEACHERS.entries()) {
    const id = crypto.randomUUID();
    const handle = t.firstName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z]/g, "");
    await db.insert(user).values({
      id,
      email: handle + DOMAIN,
      name: `${t.firstName} ${t.lastName}`,
      firstName: t.firstName,
      lastName: t.lastName,
      emailVerified: true,
      role: "user",
      image: `https://i.pravatar.cc/200?img=${i + 10}`,
      bio: t.bio,
      priceAmount: t.price,
      allowBarter: t.barter,
    });
    const rows = (kind: "speaks" | "teaches" | "learns", list: Level[]) =>
      list.map(([slug, proficiency]) => {
        const skillId = idOf.get(slug);
        if (!skillId) throw new Error(`Unknown skill slug: ${slug}`);
        return { userId: id, skillId, kind, proficiency };
      });
    const all = [
      ...rows("speaks", t.speaks),
      ...rows("teaches", t.teaches),
      ...rows("learns", t.learns),
    ];
    if (all.length) await db.insert(userSkill).values(all);
  }
  const count = await db.$count(
    user,
    inArray(
      user.email,
      TEACHERS.map(
        (t) =>
          t.firstName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[^a-z]/g, "") + DOMAIN,
      ),
    ),
  );
  console.log(`✓ ${count} dummy teachers`);
}

await seedSkills();
console.log("✓ skills");
await seedTeachers();
await db.$client.end();
