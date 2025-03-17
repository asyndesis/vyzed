"use client";

import { ErrorPage } from "@/components/error-page";
import { useEffect } from "react";

export default function Error({ error }) {
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
      actionHref="/"
    />
  );
}
