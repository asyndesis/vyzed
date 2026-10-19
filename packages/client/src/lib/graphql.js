import { gql } from "@apollo/client";

// Shared fragments --------------------------------------------------------

export const SKILL_FIELDS = gql`
  fragment SkillFields on Skill {
    id
    name
    framework
  }
`;

const LESSON_FIELDS = gql`
  fragment LessonFields on Lesson {
    id
    startTime
    endTime
    status
    proficiency
    teacherId
    teacher {
      id
      firstName
      lastInitial
      imageUrl
    }
    skill {
      ...SkillFields
    }
    enrollments {
      id
      status
      paymentType
      teacherPaymentAt
      studentPaymentAt
      student {
        id
        firstName
        lastInitial
        imageUrl
      }
    }
  }
  ${SKILL_FIELDS}
`;

const PUBLIC_USER_FIELDS = gql`
  fragment PublicUserFields on PublicUser {
    id
    firstName
    lastInitial
    imageUrl
    createdAt
    userProfile {
      id
      bio
      languages {
        id
        proficiency
        skill {
          ...SkillFields
        }
      }
    }
    teacherProfile {
      id
      priceAmount
      priceCurrency
      allowBarter
      skills {
        id
        proficiency
        skill {
          ...SkillFields
        }
      }
    }
    studentProfile {
      id
      skills {
        id
        proficiency
        skill {
          ...SkillFields
        }
      }
    }
  }
  ${SKILL_FIELDS}
`;

// Queries -----------------------------------------------------------------

export const ME = gql`
  query Me {
    me {
      id
      firstName
      lastName
      email
      imageUrl
      userProfile {
        id
        bio
        languages {
          id
          skillId
          proficiency
          skill {
            ...SkillFields
          }
        }
      }
      studentProfile {
        id
        skills {
          id
          skillId
          proficiency
          skill {
            ...SkillFields
          }
        }
      }
      teacherProfile {
        id
        priceAmount
        priceCurrency
        allowBarter
        skills {
          id
          skillId
          proficiency
          skill {
            ...SkillFields
          }
        }
      }
    }
  }
  ${SKILL_FIELDS}
`;

export const MY_LESSONS = gql`
  query MyLessons {
    myLessonsAsTeacher {
      ...LessonFields
    }
    myLessonsAsStudent {
      ...LessonFields
    }
  }
  ${LESSON_FIELDS}
`;

export const ROOT_SKILLS = gql`
  query RootSkills {
    rootSkills {
      ...SkillFields
      children {
        ...SkillFields
      }
    }
  }
  ${SKILL_FIELDS}
`;

export const TEACHERS = gql`
  query Teachers($pagination: PaginationInput, $filters: TeacherUserFilters) {
    publicTeacherUsers(pagination: $pagination, filters: $filters) {
      users {
        ...PublicUserFields
      }
      pagination {
        total
        limit
        offset
        hasMore
      }
    }
  }
  ${PUBLIC_USER_FIELDS}
`;

export const PUBLIC_USER = gql`
  query PublicUser($id: PostgresID!) {
    publicUserById(id: $id) {
      ...PublicUserFields
    }
  }
  ${PUBLIC_USER_FIELDS}
`;

// Mutations ---------------------------------------------------------------

export const UPDATE_USER = gql`
  mutation UpdateUser($id: PostgresID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      firstName
      lastName
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($id: PostgresID!, $input: UpdateUserProfileInput!) {
    updateUserProfile(id: $id, input: $input) {
      id
      bio
    }
  }
`;

export const UPDATE_STUDENT_PROFILE = gql`
  mutation UpdateStudentProfile(
    $id: PostgresID!
    $input: UpdateStudentProfileInput!
  ) {
    updateStudentProfile(id: $id, input: $input) {
      id
    }
  }
`;

export const UPDATE_TEACHER_PROFILE = gql`
  mutation UpdateTeacherProfile(
    $id: PostgresID!
    $input: UpdateTeacherProfileInput!
  ) {
    updateTeacherProfile(id: $id, input: $input) {
      id
      priceAmount
      priceCurrency
      allowBarter
    }
  }
`;

export const REQUEST_LESSON = gql`
  mutation RequestLesson($input: RequestLessonInput!) {
    requestLesson(input: $input) {
      id
    }
  }
`;

export const CHANGE_LESSON_STATUS = gql`
  mutation ChangeLessonStatus($lessonId: PostgresID!, $status: LessonStatus!) {
    changeLessonStatus(lessonId: $lessonId, status: $status) {
      id
      status
    }
  }
`;

export const CHANGE_ENROLLMENT_STATUS = gql`
  mutation ChangeEnrollmentStatus(
    $enrollmentId: PostgresID!
    $status: LessonStatus!
  ) {
    changeEnrollmentStatus(enrollmentId: $enrollmentId, status: $status) {
      id
      status
    }
  }
`;

export const SET_PAID = gql`
  mutation SetPaid($enrollmentId: PostgresID!, $isPaid: Boolean!) {
    updateEnrollmentPaymentStatus(enrollmentId: $enrollmentId, isPaid: $isPaid) {
      id
      teacherPaymentAt
      studentPaymentAt
    }
  }
`;
