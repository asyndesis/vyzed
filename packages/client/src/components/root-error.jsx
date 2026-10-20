import { useEffect } from "react";
import { ErrorPage } from "@/components/error-page";

export function RootError({ error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage
      statusCode={500}
      title="Server Error"
      description="We're sorry, something went wrong on our end."
      iconName="CircleAlert"
      actionText="Go Home"
    />
  );
}
