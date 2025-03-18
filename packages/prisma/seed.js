import { prisma } from "./index";

const SKILLS = {
  // Parent: Language
  clqwertyu00: {
    name: "Language",
    framework: "CEFR",
    children: {
      clqwertyu01: { name: "Spanish", framework: "CEFR" },
      clqwertyu02: { name: "English", framework: "CEFR" },
      clqwertyu03: { name: "German", framework: "CEFR" },
    },
  },
  // Parent: Therapy
  clqwertyu10: {
    name: "Therapy",
    children: {
      clqwertyu11: { name: "Cognitive Behavioral Therapy (CBT)" },
      clqwertyu12: { name: "Psychoanalysis" },
      clqwertyu13: { name: "Family Therapy" },
      clqwertyu14: { name: "Art Therapy" },
      clqwertyu15: { name: "Mindfulness-Based Therapy" },
    },
  },
  // Parent: Programming
  clqwertyu20: {
    name: "Programming",
    children: {
      clqwertyu21: { name: "Python" },
      clqwertyu22: { name: "JavaScript" },
      clqwertyu23: { name: "Java" },
      clqwertyu24: { name: "C#" },
      clqwertyu25: { name: "Ruby" },
      clqwertyu26: { name: "PHP" },
      clqwertyu27: { name: "Go" },
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
    }
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
        }
      );
    }
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
