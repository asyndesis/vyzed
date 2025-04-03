export const studentProfileResolvers = {
  StudentProfile: {
    skills: async (parent, _, { prisma }) => {
      return prisma.studentSkill.findMany({
        where: { studentProfileId: parent.id },
        include: { skill: true },
      });
    },
  },
  Query: {
    studentProfileById: async (parent, args, { prisma }) => {
      const { id } = args;
      try {
        return await prisma.studentProfile.findUnique({ where: { id } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    studentProfiles: async (parent, args, { prisma }) => {
      try {
        return await prisma.studentProfile.findMany();
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  Mutation: {
    updateStudentProfile: async (_, { id, input }, { user, prisma }) => {
      const { skills } = input;

      // Start a transaction to handle all updates atomically
      return await prisma.$transaction(async (tx) => {
        // Update profile data
        await tx.studentProfile.update({
          where: { id },
          data: {
            updatedBy: user?.id,
          },
        });

        // Handle skills if provided
        if (skills && skills.length > 0) {
          // Get existing skills for this profile
          const existingSkills = await tx.studentSkill.findMany({
            where: { studentProfileId: id },
          });
          const existingSkillIds = existingSkills.map((s) => s.id);

          // Process each skill
          for (const skill of skills) {
            if (skill.id) {
              // Update existing skill
              await tx.studentSkill.update({
                where: { id: skill.id },
                data: {
                  proficiency: skill.proficiency,
                },
              });

              // Remove from existingSkillIds
              const index = existingSkillIds.indexOf(skill.id);
              if (index > -1) {
                existingSkillIds.splice(index, 1);
              }
            } else {
              // Create new skill
              await tx.studentSkill.create({
                data: {
                  studentProfileId: id,
                  skillId: skill.skillId,
                  proficiency: skill.proficiency,
                  createdBy: user?.id,
                  updatedBy: user?.id,
                },
              });
            }
          }

          // Delete skills that weren't included in the update
          if (existingSkillIds.length > 0) {
            await tx.studentSkill.deleteMany({
              where: {
                id: { in: existingSkillIds },
              },
            });
          }
        }

        // Return the updated profile with fresh data
        return await tx.studentProfile.findUnique({
          where: { id },
          include: {
            user: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        });
      });
    },
  },
};
