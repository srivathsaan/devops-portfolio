import type { Metadata } from "next";
import type { SitePage } from "@/lib/pages";
import { SITE_NAME, SITE_OG_IMAGE_ALT } from "@/lib/site";

// The site-wide preview image (app/opengraph-image.tsx). A page that sets its own openGraph
// loses the inherited image, so it is named here explicitly.
const previewImage = { url: "/opengraph-image", width: 1200, height: 630, alt: SITE_OG_IMAGE_ALT };

/** Per-page metadata. Open Graph is restated in full because a child's openGraph replaces the parent's. */
export function pageMetadata(page: SitePage): Metadata {
  const title = `${page.metaTitle} · ${SITE_NAME}`;
  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: page.href },
    openGraph: {
      type: "profile",
      firstName: "Srivathsaan",
      lastName: "Nakkeeran",
      url: page.href,
      siteName: SITE_NAME,
      title,
      description: page.description,
      locale: "en_US",
      images: [previewImage],
    },
    twitter: { card: "summary_large_image", title, description: page.description, images: [previewImage] },
  };
}
