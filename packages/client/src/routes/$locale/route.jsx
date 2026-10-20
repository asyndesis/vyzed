import { Outlet, createFileRoute } from "@tanstack/react-router";
import { IntlProvider } from "use-intl";

export const Route = createFileRoute("/$locale")({
  loader: async ({ params: { locale } }) => ({
    messages: (await import(`../../../translations/${locale}.json`)).default,
  }),
  component: LocaleLayout,
});

function LocaleLayout() {
  const { locale } = Route.useParams();
  const { messages } = Route.useLoaderData();
  return (
    <IntlProvider locale={locale} messages={messages} timeZone="UTC">
      <Outlet />
    </IntlProvider>
  );
}
