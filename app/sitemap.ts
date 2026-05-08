import type { MetadataRoute } from "next";
import { locales } from "@/lib/config";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://twino.estate";

const publicRoutes = [""];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}${route}`])
        ),
      },
    }))
  );
}
