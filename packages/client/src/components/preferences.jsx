import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { defaultLocale } from "@/lib/locale";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
];

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function useLanguage() {
  const { locale = defaultLocale } = useParams({ strict: false });
  const navigate = useNavigate();
  // Same page, same filters, other language. English has no prefix.
  const setLocale = (next) =>
    next &&
    navigate({
      to: ".",
      params: (prev) => ({ ...prev, locale: next === defaultLocale ? undefined : next }),
      search: (prev) => prev,
    });
  return [locale, setLocale];
}

// Theme is only known on the client; undefined until mounted keeps SSR in sync
function useThemeValue() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return [mounted ? theme : undefined, (t) => t && setTheme(t)];
}

function Menu({ trigger, label, value, onChange, options }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label={label}>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Header controls ---------------------------------------------------------

export function LanguageMenu() {
  const [locale, setLocale] = useLanguage();
  return (
    <Menu
      label="Language"
      value={locale}
      onChange={setLocale}
      options={LANGUAGES}
      trigger={
        <Button variant="ghost" size="sm" className="w-10 px-0 text-xs font-semibold uppercase text-muted-foreground">
          {locale}
        </Button>
      }
    />
  );
}

export function ThemeMenu() {
  const [theme, setTheme] = useThemeValue();
  return (
    <Menu
      label="Theme"
      value={theme}
      onChange={setTheme}
      options={THEMES}
      trigger={
        <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Theme">
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      }
    />
  );
}

// Profile page fields -----------------------------------------------------

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {children}
    </div>
  );
}

export function PreferenceFields() {
  const [locale, setLocale] = useLanguage();
  const [theme, setTheme] = useThemeValue();
  return (
    <>
      <Field label="Language">
        <ToggleGroup type="single" variant="outline" size="sm" value={locale} onValueChange={setLocale} className="justify-start">
          {LANGUAGES.map((l) => (
            <ToggleGroupItem key={l.value} value={l.value} className="px-3">
              {l.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
      <Field label="Theme">
        <ToggleGroup type="single" variant="outline" size="sm" value={theme} onValueChange={setTheme} className="justify-start">
          {THEMES.map((t) => (
            <ToggleGroupItem key={t.value} value={t.value} className="gap-1.5 px-3">
              <t.icon className="h-4 w-4" />
              {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
    </>
  );
}
