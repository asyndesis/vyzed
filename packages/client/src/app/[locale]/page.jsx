import { getTranslations } from "next-intl/server";

export default async function LandingPage() {
  const t = await getTranslations("HomePage");

  return <div className="container mx-auto px-4 py-12">landing page</div>;
}
