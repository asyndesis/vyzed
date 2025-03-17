"use client"; // Note: error.js must be a Client Component

import { ErrorPage } from "@/components/error-page";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <ErrorPage
      statusCode={500}
      title="Server Error"
      description="We're sorry, something went wrong on our end."
      iconName="CircleAlert"
      actionText="Try Again"
      actionHref="#"
      // We can't use the Button component with onClick in a server component,
      // so we'd need to handle this differently if we want a retry button
    />
  );
}
