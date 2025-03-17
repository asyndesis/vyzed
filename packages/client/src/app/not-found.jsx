import { ErrorPage } from "@/components/error-page";

export default function NotFound() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      iconName="FileQuestion"
      actionText="Back to Home"
      actionHref="/"
    />
  );
}
