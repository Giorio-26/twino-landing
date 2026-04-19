import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Layout from "@/components/layouts";
import { baseMetadata, buildAlternates, buildOpenGraph } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    ...baseMetadata,
    title,
    description,
    twitter: { ...baseMetadata.twitter, title, description },
    openGraph: buildOpenGraph(locale, title, description),
    alternates: buildAlternates(locale),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Layout>{children}</Layout>;
}
