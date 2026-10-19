import { prisma } from "../index.js";

const SKILLS = {
  // Parent: Language
  "65f000000000000000000000": {
    name: "Language",
    framework: "CEFR",
    children: {
      "65f000000000000000000001": { name: "Spanish", framework: "CEFR" },
      "65f000000000000000000002": { name: "English", framework: "CEFR" },
      "65f000000000000000000003": { name: "German", framework: "CEFR" },
    },
  },
  // Parent: Therapy
  "65f000000000000000000010": {
    name: "Therapy",
    children: {
      "65f000000000000000000011": { name: "Cognitive Behavioral Therapy (CBT)" },
      "65f000000000000000000012": { name: "Psychoanalysis" },
      "65f000000000000000000013": { name: "Family Therapy" },
      "65f000000000000000000014": { name: "Art Therapy" },
      "65f000000000000000000015": { name: "Mindfulness-Based Therapy" },
    },
  },
  // Parent: Programming
  "65f000000000000000000020": {
    name: "Programming",
    children: {
      "65f000000000000000000021": { name: "Python" },
      "65f000000000000000000022": { name: "JavaScript" },
      "65f000000000000000000023": { name: "Java" },
      "65f000000000000000000024": { name: "C#" },
      "65f000000000000000000025": { name: "Ruby" },
      "65f000000000000000000026": { name: "PHP" },
      "65f000000000000000000027": { name: "Go" },
    },
  },
};

async function main() {
  console.log("🧹 Cleaning database...");
  await prisma.skill.deleteMany();

  console.log("🌱 Seeding skills...");

  // First create all parent skills
  const parentPromises = Object.entries(SKILLS).map(
    async ([parentId, parentData]) => {
      // Create parent skill without children relationship
      await prisma.skill.create({
        data: {
          id: parentId,
          name: parentData.name,
          framework: parentData.framework || "DEFAULT",
          // No parentId for parent skills
        },
      });
    },
  );

  await Promise.all(parentPromises);

  // Then create all child skills with parentId references
  const childPromises = Object.entries(SKILLS).flatMap(
    ([parentId, parentData]) => {
      return Object.entries(parentData.children).map(
        async ([childId, childData]) => {
          await prisma.skill.create({
            data: {
              id: childId,
              name: childData.name,
              framework: childData.framework || "DEFAULT",
              parentId: parentId, // Set the parentId reference
            },
          });
        },
      );
    },
  );

  await Promise.all(childPromises);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("✅ Seeding complete");
    await prisma.$disconnect();
  });
