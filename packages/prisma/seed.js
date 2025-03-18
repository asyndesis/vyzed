import { prisma } from "./index";

// Pre-generate CUIDs for all skills
const SKILLS = {
  // Parent: Language
  clqwertyui1: {
    name: "Language",
    framework: "CEFR",
    children: {
      clqwertyui2: { name: "Spanish", framework: "CEFR" },
      clqwertyui3: { name: "English", framework: "CEFR" },
      clqwertyui4: { name: "German", framework: "CEFR" },
    },
  },
  // Parent: Therapy
  clqwertyui9: {
    name: "Therapy",
    children: {
      clqwertyu10: { name: "Cognitive Behavioral Therapy (CBT)" },
      clqwertyu11: { name: "Psychoanalysis" },
      clqwertyu12: { name: "Family Therapy" },
      clqwertyu13: { name: "Art Therapy" },
      clqwertyu14: { name: "Mindfulness-Based Therapy" },
    },
  },
  clqwertyui2: {
    name: "Programming",
    children: {
      clqwertyui21: { name: "Python" },
      clqwertyui22: { name: "JavaScript" },
      clqwertyui23: { name: "Java" },
      clqwertyui24: { name: "C#" },
      clqwertyui25: { name: "Ruby" },
      clqwertyui26: { name: "PHP" },
      clqwertyui27: { name: "Go" },
    },
  },
};

async function main() {
  console.log("🧹 Cleaning database...");
  await prisma.skill.deleteMany({});

  console.log("🌱 Seeding skills...");

  // Process all skills in parallel
  const parentPromises = Object.entries(SKILLS).map(
    async ([parentId, parentData]) => {
      // Create parent skill
      await prisma.skill.create({
        data: {
          id: parentId,
          name: parentData.name,
          framework: parentData.framework || "DEFAULT",

          // Create children inline using nested writes
          children: {
            create: Object.entries(parentData.children).map(
              ([childId, childData]) => ({
                id: childId,
                name: childData.name,
                framework: childData.framework || "DEFAULT",
              })
            ),
          },
        },
      });
    }
  );

  await Promise.all(parentPromises);
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
