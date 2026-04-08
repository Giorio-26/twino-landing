import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const baseMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Twino",
  description: "meta",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: "Twino",
  },
  twitter: {
    card: "summary_large_image",
    title: "Twino",
    description: "meta",
    images: [{ url: "/og-image.jpg", alt: "Twino" }],
  },
  icons: {
    icon: [
      { url: "/favicons/favicon.ico", sizes: "any" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32" },
      { url: "/favicons/favicon-192x192.png", sizes: "192x192" },
      { url: "/favicons/favicon-512x512.png", sizes: "512x512" },
    ],
    apple: [{ url: "/favicons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export function buildAlternates(locale: string): Metadata["alternates"] {
  return {
    canonical: `https://twino.estate/${locale}`,
    languages: {
      ka: "https://twino.estate/ka",
      en: "https://twino.estate/en",
    },
  };
}

export function buildOpenGraph(locale: string): Metadata["openGraph"] {
  return {
    title: "Twino",
    description: "meta",
    url: "https://twino.estate",
    siteName: "Twino",
    images: [{ url: "/og-image.jpg", alt: "Twino" }],
    locale,
    type: "website",
  };
}
