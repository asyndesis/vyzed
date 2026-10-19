import { TeacherProfile } from "@/components/teacher-profile";

export default async function TeacherPage({ params }) {
  const { id } = await params;
  return <TeacherProfile id={id} basePath="/dashboard/teachers" />;
}
