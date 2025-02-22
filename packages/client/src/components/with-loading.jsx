import { cn } from "@/lib/utils"; // Replace with the actual path to your `cn` utility
import { AlertCircle, Loader2 } from "lucide-react"; // Replace if using a different icon system
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const WithLoading = ({
  isLoading = false,
  error,
  className,
  children,
}) => {
  if (isLoading || error) {
    return (
      <div
        className={cn(
          "flex flex-1 w-full h-full items-center justify-center bg-background/70",
          className
        )}
      >
        {isLoading && (
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        )}
        {error && (
          <div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error?.message}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    );
  }
  return children;
};
