import { getTranslations } from "next-intl/server";

export default async function LandingPage() {
  const t = await getTranslations("HomePage");

  return <>Landing Page</>;
}
