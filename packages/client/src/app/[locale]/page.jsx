import { useTranslations } from "next-intl";

export default function IndexPage() {
  const t = useTranslations("HomePage");

  return (
    <div className="max-w-[590px]">
      {t.rich("title", {
        code: (chunks) => (
          <code className="font-mono text-white">{chunks}</code>
        ),
      })}
    </div>
  );
}
