import type { Metadata } from "next";
import ZonePage from "@/components/site/zone-page";
import { pageMetadata } from "@/lib/page-metadata";
import { pageAt } from "@/lib/pages";

const page = pageAt("/b-tech");

export const metadata: Metadata = pageMetadata(page);

export default function BTechPage() {
  return <ZonePage page={page} />;
}
