// Who may do what. One place, plain functions, used by GraphQL resolvers and by the UI.
//
// Each rule gets the viewer and (optionally) the record. Add a resource by adding a key;
// TypeScript makes every call site name a real resource and action.

export type Role = "user" | "admin";
export type Viewer = { id: string; role: Role };

type Rule<T> = (viewer: Viewer, record: T) => boolean;

type LessonRecord = { teacherId: string };
type EnrollmentRecord = { studentId: string; lesson: { teacherId: string } };
type UserRecord = { id: string };

const isAdmin = (v: Viewer) => v.role === "admin";

export const policies = {
  user: {
    // Email and other private fields
    viewPrivate: ((v, u) => isAdmin(v) || v.id === u.id) as Rule<UserRecord>,
    update: ((v, u) => isAdmin(v) || v.id === u.id) as Rule<UserRecord>,
  },
  skill: {
    manage: ((v) => isAdmin(v)) as Rule<unknown>,
  },
  lesson: {
    // Teachers run their lessons
    update: ((v, l) =>
      isAdmin(v) || v.id === l.teacherId) as Rule<LessonRecord>,
  },
  enrollment: {
    view: ((v, e) =>
      isAdmin(v) ||
      v.id === e.studentId ||
      v.id === e.lesson.teacherId) as Rule<EnrollmentRecord>,
    // Students change their own enrollment
    update: ((v, e) =>
      isAdmin(v) || v.id === e.studentId) as Rule<EnrollmentRecord>,
    // Either side confirms payment
    markPaid: ((v, e) =>
      v.id === e.studentId ||
      v.id === e.lesson.teacherId) as Rule<EnrollmentRecord>,
  },
};

type Policies = typeof policies;

export function can<R extends keyof Policies, A extends keyof Policies[R]>(
  viewer: Viewer | null | undefined,
  resource: R,
  action: A,
  record: Policies[R][A] extends Rule<infer T> ? T : never,
): boolean {
  if (!viewer) return false;
  const rule = policies[resource][action] as Rule<unknown>;
  return rule(viewer, record);
}
