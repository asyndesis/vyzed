"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe, Languages } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
];

export function LanguageSwitcher({ className }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale) => {
    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.split("/").slice(2).join("/");
    // Construct new path with the selected locale
    const newPath = `/${locale}/${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <span className="h-[1.2rem] w-[1.2rem] flex items-center justify-center font-medium">
              {pathname.split("/")[1].toUpperCase()}
            </span>
            <span className="sr-only">Select language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
