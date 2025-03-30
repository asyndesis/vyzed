export const userProfileResolvers = {
  UserProfile: {
    languages: async (parent, _, { prisma }) => {
      return prisma.userLanguage.findMany({
        where: { userProfileId: parent.id },
        include: { skill: true },
      });
    },
  },
  Query: {
    userProfileById: async (parent, args, { prisma }) => {
      const { id } = args;
      return prisma.userProfile.findUnique({ where: { id } });
    },
    userProfileByUserId: async (parent, args, { prisma }) => {
      const { userId } = args;
      return prisma.userProfile.findUnique({ where: { userId } });
    },
    userProfiles: async (parent, args, { prisma }) => {
      return prisma.userProfile.findMany();
    },
  },
  Mutation: {
    createUserProfile: async (_, { input }, { user, prisma }) => {
      const { userId, bio, languages = [] } = input;

      return await prisma.$transaction(async (tx) => {
        const userProfile = await tx.userProfile.create({
          data: {
            userId,
            bio,
            createdBy: user?.id,
            updatedBy: user?.id,
          },
        });

        if (languages && languages.length > 0) {
          for (const lang of languages) {
            await tx.userLanguage.create({
              data: {
                userProfileId: userProfile.id,
                skillId: lang.skillId,
                proficiency: lang.proficiency,
                createdBy: user?.id,
                updatedBy: user?.id,
              },
            });
          }
        }

        return await tx.userProfile.findUnique({
          where: { id: userProfile.id },
          include: {
            user: true,
            languages: {
              include: {
                skill: true,
              },
            },
          },
        });
      });
    },
    updateUserProfile: async (_, { id, input }, { user, prisma }) => {
      const { bio, languages } = input;

      return await prisma.$transaction(async (tx) => {
        await tx.userProfile.update({
          where: { id },
          data: {
            bio,
            updatedBy: user?.id,
          },
        });

        if (languages) {
          const existingLanguages = await tx.userLanguage.findMany({
            where: { userProfileId: id },
          });
          const existingLanguageIds = existingLanguages.map((l) => l.id);

          for (const lang of languages) {
            if (lang.id) {
              await tx.userLanguage.update({
                where: { id: lang.id },
                data: {
                  skillId: lang.skillId,
                  proficiency: lang.proficiency,
                  updatedBy: user?.id,
                },
              });

              const index = existingLanguageIds.indexOf(lang.id);
              if (index > -1) {
                existingLanguageIds.splice(index, 1);
              }
            } else {
              await tx.userLanguage.create({
                data: {
                  userProfileId: id,
                  skillId: lang.skillId,
                  proficiency: lang.proficiency,
                  createdBy: user?.id,
                  updatedBy: user?.id,
                },
              });
            }
          }

          if (existingLanguageIds.length > 0) {
            await tx.userLanguage.deleteMany({
              where: {
                id: { in: existingLanguageIds },
              },
            });
          }
        }

        return await tx.userProfile.findUnique({
          where: { id },
          include: {
            user: true,
            languages: {
              include: {
                skill: true,
              },
            },
          },
        });
      });
    },
    deleteUserProfile: async (parent, args, { prisma }) => {
      const { id } = args;
      await prisma.userProfile.delete({ where: { id } });
      return true;
    },
  },
};
