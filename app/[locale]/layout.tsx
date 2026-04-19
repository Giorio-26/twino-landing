import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import "../globals.css";
import { isValidLocale } from "@/lib/config";
import { helvetica, helveticaNeue } from "@/lib/fonts";
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
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${helvetica.variable} ${helveticaNeue.variable} h-full antialiased`}
    >
      <NextIntlClientProvider messages={messages}>
        <body className="flex min-h-full flex-col">{children}</body>
      </NextIntlClientProvider>
    </html>
  );
}
