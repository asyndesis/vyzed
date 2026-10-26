import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useHydrated, useRouter } from "@tanstack/react-router";
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
  localizeUrl,
  type Locale,
} from "@/generated/paraglide/runtime";

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

// The locale lives in the URL, so switching is a client-side move to the same page under
// the new locale's prefix (paraglide's setLocale would do a full document reload instead)
function useChangeLocale() {
  const router = useRouter();
  return (v: string) => {
    if (!isLocale(v) || v === getLocale()) return;
    const { pathname, search, hash } = localizeUrl(window.location.href, {
      locale: v,
    });
    router.history.push(pathname + search + hash);
    void router.invalidate();
  };
}

// The theme only exists in the browser; empty until mounted keeps SSR in sync
// (and keeps the groups controlled rather than flipping from undefined)
function useThemeValue() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  return [(hydrated && theme) || "", (t: string) => t && setTheme(t)] as const;
}

// Header controls ------------------------------------------------------------

export function LanguageMenu() {
  const changeLocale = useChangeLocale();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" aria-label="Language" />}
      >
        {getLocale()}
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
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label="Theme" />}
      >
        <Sun className="dark:hidden" />
        <Moon className="hidden dark:block" />
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
  const changeLocale = useChangeLocale();
  const [theme, setTheme] = useThemeValue();
  return (
    <>
      <div className="space-y-2">
        <p className="text-sm font-medium">Language</p>
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[getLocale()]}
          onValueChange={([v]) => v && changeLocale(v)}
        >
          {LANGUAGES.map((l) => (
            <ToggleGroupItem key={l.value} value={l.value}>
              {l.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Theme</p>
        <ToggleGroup
          variant="outline"
          size="sm"
          value={theme ? [theme] : []}
          onValueChange={([t]) => t && setTheme(t)}
        >
          {THEMES.map((t) => (
            <ToggleGroupItem key={t.value} value={t.value}>
              <t.icon /> {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </>
  );
}
