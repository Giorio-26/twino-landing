import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("common");

  return <div>{t("name")}</div>;
}
