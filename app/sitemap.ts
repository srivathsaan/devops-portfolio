import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { sitePages } from "@/lib/pages";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    ...sitePages.map((page) => ({
      url: `${SITE_URL}${page.href}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${SITE_URL}/resume.pdf`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
