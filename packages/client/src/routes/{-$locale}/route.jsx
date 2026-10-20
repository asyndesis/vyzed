import { Outlet, createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { IntlProvider } from "use-intl";
import { defaultLocale, isLocale } from "@/lib/locale";

// English lives at /, other languages under /de, /es
export const Route = createFileRoute("/{-$locale}")({
  beforeLoad: ({ params: { locale }, location }) => {
    if (locale === undefined) return;
    if (!isLocale(locale)) throw notFound();
    // One URL per page: /en/browse -> /browse
    if (locale === defaultLocale)
      throw redirect({
        href: (location.pathname.slice(defaultLocale.length + 1) || "/") + location.searchStr,
        statusCode: 301,
      });
  },
  loader: async ({ params: { locale = defaultLocale } }) => ({
    messages: (await import(`../../../translations/${locale}.json`)).default,
  }),
  component: LocaleLayout,
});

function LocaleLayout() {
  const { locale = defaultLocale } = Route.useParams();
  const { messages } = Route.useLoaderData();
  return (
    <IntlProvider locale={locale} messages={messages} timeZone="UTC">
      <Outlet />
    </IntlProvider>
  );
}
