import { TeacherProfile } from "@/components/teacher-profile";

export default async function BrowseTeacherPage({ params }) {
  const { id } = await params;
  return <TeacherProfile id={id} basePath="/browse" />;
}
