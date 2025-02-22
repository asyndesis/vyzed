import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export default async function Layout({ children, params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  return children;
}
