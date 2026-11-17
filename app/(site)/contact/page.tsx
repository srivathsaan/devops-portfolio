import type { Metadata } from "next";
import ZonePage from "@/components/site/zone-page";
import { pageMetadata } from "@/lib/page-metadata";
import { pageAt } from "@/lib/pages";

const page = pageAt("/contact");

export const metadata: Metadata = pageMetadata(page);

export default function ContactPage() {
  return <ZonePage page={page} />;
}
