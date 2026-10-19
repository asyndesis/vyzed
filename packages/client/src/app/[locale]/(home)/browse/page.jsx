import { TeacherBrowser } from "@/components/teacher-browser";
import { TeachCallout } from "@/components/teach-callout";

export default function BrowsePage() {
  return (
    <>
      <TeacherBrowser
        basePath="/browse"
        title="Browse teachers"
        description="Book a lesson with someone local, or swap what you know for what you want to learn."
      />
      <TeachCallout />
    </>
  );
}
