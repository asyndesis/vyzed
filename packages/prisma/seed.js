import { prisma } from "./index";

// Pre-generate CUIDs for all skills
const SKILLS = {
  // Parent: Language
  clqwertyui1: {
    name: "Language",
    children: {
      clqwertyui2: { name: "Spanish" },
      clqwertyui3: { name: "English" },
      clqwertyui4: { name: "German" },
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
};

async function main() {
  // Create or update parent skills with pre-generated CUIDs
  for (const [parentId, parentData] of Object.entries(SKILLS)) {
    await prisma.skill.upsert({
      where: { id: parentId },
      update: { name: parentData.name },
      create: {
        id: parentId,
        name: parentData.name,
      },
    });

    // Create or update child skills with pre-generated CUIDs
    for (const [childId, childData] of Object.entries(parentData.children)) {
      await prisma.skill.upsert({
        where: { id: childId },
        update: {
          name: childData.name,
          parentId: parentId,
        },
        create: {
          id: childId,
          name: childData.name,
          parentId: parentId,
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
