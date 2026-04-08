import type { Metadata } from "next";
import "../globals.css";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Layout from "@/components/layouts";
import { isValidLocale } from "@/lib/config";
import { helvetica, helveticaNeue } from "@/lib/fonts";
import { baseMetadata, buildAlternates, buildOpenGraph } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...baseMetadata,
    openGraph: buildOpenGraph(locale),
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
        <body className="flex min-h-full flex-col">
          <Layout>{children}</Layout>
        </body>
      </NextIntlClientProvider>
    </html>
  );
}
