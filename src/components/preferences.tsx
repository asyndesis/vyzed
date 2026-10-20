import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useHydrated } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  getLocale,
  isLocale,
  setLocale,
  type Locale,
} from "@/paraglide/runtime";

const LANGUAGES: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
];

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

// Paraglide moves you to the same page under the new locale's URL
const changeLocale = (v: string) => isLocale(v) && setLocale(v);

// The theme only exists in the browser; undefined until mounted keeps SSR in sync
function useThemeValue() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  return [
    hydrated ? theme : undefined,
    (t: string) => t && setTheme(t),
  ] as const;
}

// Header controls ------------------------------------------------------------

export function LanguageMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 px-0 text-xs font-semibold uppercase"
          aria-label="Language"
        >
          {getLocale()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={getLocale()}
          onValueChange={changeLocale}
        >
          {LANGUAGES.map((l) => (
            <DropdownMenuRadioItem key={l.value} value={l.value}>
              {l.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemeMenu() {
  const [theme, setTheme] = useThemeValue();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme">
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {THEMES.map((t) => (
            <DropdownMenuRadioItem key={t.value} value={t.value}>
              {t.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Profile page fields ----------------------------------------------------------

export function PreferenceFields() {
  const [theme, setTheme] = useThemeValue();
  return (
    <>
      <div className="space-y-2">
        <p className="text-sm font-medium">Language</p>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={getLocale()}
          onValueChange={changeLocale}
        >
          {LANGUAGES.map((l) => (
            <ToggleGroupItem key={l.value} value={l.value} className="px-3">
              {l.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Theme</p>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={theme}
          onValueChange={setTheme}
        >
          {THEMES.map((t) => (
            <ToggleGroupItem
              key={t.value}
              value={t.value}
              className="gap-1.5 px-3"
            >
              <t.icon /> {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </>
  );
}
