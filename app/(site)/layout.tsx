import { Caveat, DM_Serif_Display } from "next/font/google";
import SiteFooter from "@/components/site/site-footer";
import SiteNav from "@/components/site/site-nav";

// The Marginalia template's faces: a high-contrast serif for headings, handwriting for the pen.
const display = DM_Serif_Display({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const hand = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["500", "600"] });

/** Shared frame for the static pages the buildings open into. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${hand.variable} flex min-h-dvh flex-col bg-background text-foreground`}>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
