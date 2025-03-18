import { prisma } from "@vyzed/prisma";

export const teacherProfileResolvers = {
  TeacherProfile: {
    user: async (parent) => {
      const user = await prisma.user.findUnique({
        where: { id: parent.userId },
        select: {
          firstName: true,
          lastName: true,
          id: true,
          imageUrl: true,
          createdAt: true,
        },
      });

      return user;
    },
    skills: async (parent) => {
      return prisma.teacherSkill.findMany({
        where: { teacherProfileId: parent.id },
        include: { skill: true },
      });
    },
  },
  Query: {
    teacherProfileById: async (parent, args) => {
      const { id } = args;
      try {
        return await prisma.teacherProfile.findUnique({ where: { id } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    teacherProfiles: async () => {
      try {
        return await prisma.teacherProfile.findMany();
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  Mutation: {
    createTeacherProfile: async (_, { input }, { user }) => {
      const { userId, bio } = input;

      return prisma.teacherProfile.create({
        data: {
          userId,
          bio,
          createdBy: user?.id,
          updatedBy: user?.id,
        },
        include: {
          user: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });
    },
    updateTeacherProfile: async (_, { id, input }, { user }) => {
      const { bio, skills } = input;

      // Start a transaction to handle all updates atomically
      return await prisma.$transaction(async (tx) => {
        // Update profile data
        await tx.teacherProfile.update({
          where: { id },
          data: {
            bio,
            updatedBy: user?.id,
          },
        });

        // Handle skills if provided
        if (skills && skills.length > 0) {
          // Get existing skills for this profile
          const existingSkills = await tx.teacherSkill.findMany({
            where: { teacherProfileId: id },
          });
          const existingSkillIds = existingSkills.map((s) => s.id);

          // Process each skill
          for (const skill of skills) {
            if (skill.id) {
              // Update existing skill
              await tx.teacherSkill.update({
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
              await tx.teacherSkill.create({
                data: {
                  teacherProfileId: id,
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
            await tx.teacherSkill.deleteMany({
              where: {
                id: { in: existingSkillIds },
              },
            });
          }
        }

        // Return the updated profile with fresh data
        return await tx.teacherProfile.findUnique({
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
    deleteTeacherProfile: async (parent, args) => {
      const { id } = args;
      try {
        await prisma.teacherProfile.delete({ where: { id } });
        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
