import { prisma } from "./index";

const SKILLS = {
  Language: ["Spanish", "English", "German"],
  Programming: ["JavaScript", "Python", "Java"],
  Therapy: [
    "Cognitive Behavioral Therapy (CBT)",
    "Psychoanalysis",
    "Family Therapy",
    "Art Therapy",
    "Mindfulness-Based Therapy",
  ],
};

async function main() {
  for (const [parentSkill, childSkills] of Object.entries(SKILLS)) {
    const parent = await prisma.skill.upsert({
      where: { name: parentSkill },
      update: {},
      create: { name: parentSkill },
    });

    for (const childSkill of childSkills) {
      await prisma.skill.upsert({
        where: { name: childSkill },
        update: {},
        create: {
          name: childSkill,
          parentId: parent.id,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("✅ Seeding complete...");
    await prisma.$disconnect();
  });
