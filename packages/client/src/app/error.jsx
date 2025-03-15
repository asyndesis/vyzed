"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function GlobalError({ error, reset }) {
  console.log(error);

  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
            <div className="w-full max-w-md bg-card rounded-xl shadow-lg overflow-hidden border border-border/40">
              <div className="p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    500
                  </h1>
                  <p className="text-lg text-muted-foreground text-center">
                    We encountered an unexpected error.
                  </p>
                  <p className="text-sm text-muted-foreground/70 text-center">
                    Our team has been notified and is working on a fix.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-muted/30 border-t border-border/40">
                <div className="flex justify-between items-center gap-4">
                  <button
                    onClick={() => reset()}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background hover:bg-background/80 rounded-md transition-colors border border-border/40"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
