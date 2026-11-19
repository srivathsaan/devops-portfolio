import Link from "next/link";
import MarginaliaPortfolioTemplate from "@/components/ui/marginalia-portfolio-template";
import { sitePages, type SitePage } from "@/lib/pages";

// Placeholder for pages without their own photo (SitePage.portrait).
const PORTRAIT = "/images/portrait-placeholder.svg";

/** The static page a building opens into: the Marginalia sheets for that stop, then prev/next. */
export default function ZonePage({ page }: { page: SitePage }) {
  const index = sitePages.indexOf(page);
  const previous = sitePages[index - 1];
  const next = sitePages[index + 1];

  return (
    <article>
      <MarginaliaPortfolioTemplate
        {...page.sheets}
        name="Srivathsaan"
        portrait={page.portrait?.src ?? PORTRAIT}
        portraitAlt={page.portrait?.alt ?? "Placeholder portrait: the initials SN"}
        portraitShape={page.portrait?.shape}
        // The site nav replaces the template's own top bar and contents page.
        chrome={false}
        colors={{ paper: "#ecebe7", night: "#2b2b2e", ink: "#242426", pen: page.accent }}
        // Faces come from next/font in app/(site)/layout.tsx, so no third-party stylesheet.
        fonts={{
          href: null,
          display: "var(--font-display), Georgia, serif",
          hand: "var(--font-hand), 'Bradley Hand', cursive",
          body: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        }}
      />

      <nav aria-label="Timeline" className="bg-[#ecebe7]">
        <div className="mx-auto grid max-w-5xl gap-3 px-4 py-10 sm:grid-cols-2 sm:px-6">
          {previous ? (
            <Link href={previous.href} className="rounded-xl border border-black/10 p-4 transition-colors hover:bg-black/5">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <span aria-hidden="true">← </span>Previous
              </span>
              <span className="mt-1 block font-medium">{previous.navLabel}</span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next && (
            <Link
              href={next.href}
              className="rounded-xl border border-black/10 p-4 text-right transition-colors hover:bg-black/5"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Next<span aria-hidden="true"> →</span>
              </span>
              <span className="mt-1 block font-medium">{next.navLabel}</span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
