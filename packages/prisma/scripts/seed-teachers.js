// Dummy teachers for local testing. Safe to re-run: wipes previous dummies
// (emails ending in @dummy.vyzed.test) before recreating them.
// Requires skills to be seeded first (npm run seed).
import { prisma } from "../index.js";

const DOMAIN = "@dummy.vyzed.test";

const S = {
  spanish: "65f000000000000000000001",
  english: "65f000000000000000000002",
  german: "65f000000000000000000003",
  cbt: "65f000000000000000000011",
  psychoanalysis: "65f000000000000000000012",
  family: "65f000000000000000000013",
  art: "65f000000000000000000014",
  mindfulness: "65f000000000000000000015",
  python: "65f000000000000000000021",
  javascript: "65f000000000000000000022",
  java: "65f000000000000000000023",
  csharp: "65f000000000000000000024",
  ruby: "65f000000000000000000025",
  php: "65f000000000000000000026",
  go: "65f000000000000000000027",
};

// [skill, proficiency 0–6]
const TEACHERS = [
  {
    firstName: "Lucía", lastName: "Fernández", price: 2500, barter: true,
    bio: "Native speaker from Sevilla. Conversation-first lessons, lots of laughing, minimal grammar drills.",
    speaks: [["spanish", 6], ["english", 5]],
    teaches: [["spanish", 6]],
    learns: [["python", 1]],
  },
  {
    firstName: "Jonas", lastName: "Becker", price: 3500, barter: false,
    bio: "Backend engineer in Berlin, 10 years of Go and Python. I help people ship their first real project.",
    speaks: [["german", 6], ["english", 5]],
    teaches: [["go", 6], ["python", 5]],
    learns: [["spanish", 2]],
  },
  {
    firstName: "Amara", lastName: "Okafor", price: 0, barter: true,
    bio: "Frontend dev who loves teaching JavaScript from scratch. Happy to swap for language practice.",
    speaks: [["english", 6]],
    teaches: [["javascript", 6]],
    learns: [["german", 1], ["spanish", 2]],
  },
  {
    firstName: "Mateo", lastName: "Rossi", price: 4000, barter: false,
    bio: "Licensed therapist trained in CBT and mindfulness-based approaches. Sessions in English or Spanish.",
    speaks: [["english", 5], ["spanish", 6]],
    teaches: [["cbt", 6], ["mindfulness", 5]],
    learns: [],
  },
  {
    firstName: "Hannah", lastName: "Schmidt", price: 2000, barter: true,
    bio: "German teacher for beginners and travelers. Patient, structured, and big on real-life phrases.",
    speaks: [["german", 6], ["english", 6]],
    teaches: [["german", 6], ["english", 5]],
    learns: [["javascript", 1]],
  },
  {
    firstName: "Kenji", lastName: "Watanabe", price: 3000, barter: false,
    bio: "Java and C# developer, enterprise background. Great for interview prep and clean architecture.",
    speaks: [["english", 4]],
    teaches: [["java", 6], ["csharp", 5]],
    learns: [["german", 2]],
  },
  {
    firstName: "Sofia", lastName: "Almeida", price: 1500, barter: true,
    bio: "Art therapist working with adults and teens. Expressive, gentle sessions — no art skills needed.",
    speaks: [["spanish", 5], ["english", 5]],
    teaches: [["art", 6], ["family", 4]],
    learns: [["python", 1]],
  },
  {
    firstName: "Oliver", lastName: "Brooks", price: 0, barter: true,
    bio: "Ruby and PHP old-timer. I'll teach you to build web apps for free in exchange for Spanish practice.",
    speaks: [["english", 6]],
    teaches: [["ruby", 6], ["php", 5]],
    learns: [["spanish", 1]],
  },
  {
    firstName: "Elena", lastName: "Petrova", price: 5000, barter: false,
    bio: "Psychoanalyst with a private practice. Long-form, reflective sessions.",
    speaks: [["english", 5], ["german", 4]],
    teaches: [["psychoanalysis", 6]],
    learns: [],
  },
  {
    firstName: "Diego", lastName: "Morales", price: 1800, barter: true,
    bio: "Spanish from Mexico City, plus beginner Python. Lessons are relaxed and practical.",
    speaks: [["spanish", 6], ["english", 4]],
    teaches: [["spanish", 6], ["python", 3]],
    learns: [["german", 1]],
  },
];

const rows = (list) => list.map(([k, proficiency]) => ({ skillId: S[k], proficiency }));

async function main() {
  const skillCount = await prisma.skill.count();
  if (!skillCount) throw new Error("No skills found — run `npm run seed` first.");

  console.log("🧹 Removing old dummy teachers...");
  const old = await prisma.user.findMany({
    where: { email: { endsWith: DOMAIN } },
    select: { id: true },
  });
  const ids = old.map((u) => u.id);
  // relationMode = "prisma" doesn't cascade on Mongo, so delete children explicitly
  const [ups, sps, tps] = await Promise.all([
    prisma.userProfile.findMany({ where: { userId: { in: ids } }, select: { id: true } }),
    prisma.studentProfile.findMany({ where: { userId: { in: ids } }, select: { id: true } }),
    prisma.teacherProfile.findMany({ where: { userId: { in: ids } }, select: { id: true } }),
  ]);
  await prisma.userLanguage.deleteMany({ where: { userProfileId: { in: ups.map((p) => p.id) } } });
  await prisma.studentSkill.deleteMany({ where: { studentProfileId: { in: sps.map((p) => p.id) } } });
  await prisma.teacherSkill.deleteMany({ where: { teacherProfileId: { in: tps.map((p) => p.id) } } });
  await prisma.userProfile.deleteMany({ where: { userId: { in: ids } } });
  await prisma.studentProfile.deleteMany({ where: { userId: { in: ids } } });
  await prisma.teacherProfile.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });

  console.log(`🌱 Creating ${TEACHERS.length} dummy teachers...`);
  for (const [i, t] of TEACHERS.entries()) {
    const email = `${t.firstName.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}${DOMAIN}`;
    await prisma.user.create({
      data: {
        email,
        name: `${t.firstName} ${t.lastName}`,
        firstName: t.firstName,
        lastName: t.lastName,
        emailVerified: true,
        imageUrl: `https://i.pravatar.cc/200?img=${i + 10}`,
        userProfile: { create: { bio: t.bio, languages: { create: rows(t.speaks) } } },
        studentProfile: { create: { skills: { create: rows(t.learns) } } },
        teacherProfile: {
          create: {
            priceAmount: t.price,
            priceCurrency: "EUR",
            allowBarter: t.barter,
            skills: { create: rows(t.teaches) },
          },
        },
      },
    });
    console.log(`  ✓ ${t.firstName} ${t.lastName}`);
  }
}

main()
  .then(() => console.log("✅ Done"))
  .catch((e) => {
    console.error("❌ Seeding teachers failed:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
