import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { CircleAlert, FileQuestion, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function Message({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link to="/" />} nativeButton={false}>
            Back to home
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}

export function ErrorPage({ error }: ErrorComponentProps) {
  console.error(error);
  return (
    <Message
      icon={CircleAlert}
      title="Something went wrong"
      description="We're sorry, something broke on our end. Try again in a moment."
    />
  );
}

export function NotFoundPage() {
  return (
    <Message
      icon={FileQuestion}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
    />
  );
}
