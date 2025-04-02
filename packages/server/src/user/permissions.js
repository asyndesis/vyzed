import { isAdmin, isAuthed, isClerkAuthed, isPublic } from "../rules";

export const userPermissions = {
  Query: {
    me: isAuthed,
    userById: isAdmin,
    userByAuthId: isAdmin,
    users: isAdmin,
    checkUserExistsByAuthId: isAuthed,
    publicTeacherUsers: isPublic,
    publicUserById: isPublic,
  },
  Mutation: {
    createUser: isAdmin,
    createMyUser: isClerkAuthed,
  },
};
