import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon"; // Replace with your icon component if needed

export default function Page() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6 text-center">
      <Icon
        iconName="CircleAlert"
        className="h-12 w-12 text-muted-foreground"
      />{" "}
      {/* Replace with your preferred icon */}
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        404 - Page Not Found
      </h1>
      <p className="text-muted-foreground">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="outline" className="px-4 py-2">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}
