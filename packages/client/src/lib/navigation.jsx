import { forwardRef, useMemo } from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { defaultLocale, isLocale } from "@/lib/locale";

// Every URL lives under /:locale. These wrappers let the rest of the app use
// plain paths ("/browse", "/dashboard?tab=x") and add the current locale.

export const stripLocale = (path) => path.replace(/^\/(en|de|es)(?=\/|$)/, "") || "/";

export function useLocale() {
  const { locale } = useParams({ strict: false });
  return isLocale(locale) ? locale : defaultLocale;
}

// Current path without the locale prefix
export const usePathname = () => stripLocale(useLocation().pathname);

export function useSearchParams() {
  const search = useSearch({ strict: false });
  return useMemo(() => new URLSearchParams(search), [search]);
}

// "/browse?q=a" -> { to: "/en/browse", search: { q: "a" } }
const localize = (locale, href) => {
  const [path, query = ""] = href.split("?");
  return {
    to: `/${locale}${path === "/" ? "" : path}`,
    search: Object.fromEntries(new URLSearchParams(query)),
  };
};

export const Link = forwardRef(function Link({ href, ...props }, ref) {
  return <RouterLink ref={ref} {...localize(useLocale(), href)} {...props} />;
});

// push/replace take a plain path, or "?query" to stay on the current page
export function useRouter() {
  const navigate = useNavigate();
  const locale = useLocale();
  const pathname = usePathname();
  return useMemo(() => {
    const go =
      (replace) =>
      (href, { scroll = true } = {}) =>
        navigate({
          ...localize(locale, href.startsWith("?") ? pathname + href : href),
          replace,
          resetScroll: scroll,
        });
    return { push: go(false), replace: go(true) };
  }, [navigate, locale, pathname]);
}
