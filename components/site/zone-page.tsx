import Link from "next/link";
import type { CSSProperties } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contactLinks, sitePages, type PageSection, type SitePage } from "@/lib/pages";
import { cn } from "@/lib/utils";

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full border bg-muted/60 px-2.5 py-0.5 text-xs text-foreground/80">
          {tag}
        </li>
      ))}
    </ul>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="relative pl-5 leading-relaxed text-foreground/90">
          <span aria-hidden="true" className="absolute left-0 top-[0.6em] size-1.5 rounded-full bg-[var(--accent)]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({ section }: { section: PageSection }) {
  const headingId = `section-${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={headingId} className="scroll-mt-24">
      <h2 id={headingId} className="mb-4 text-xl font-semibold tracking-tight">
        {section.heading}
      </h2>

      {section.kind === "bullets" && <Bullets items={section.items} />}

      {section.kind === "roles" && (
        <div className="space-y-4">
          {section.roles.map((role) => (
            <Card key={role.title}>
              <CardHeader>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <CardTitle className="text-lg font-semibold">
                    <h3>{role.title}</h3>
                  </CardTitle>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{role.dates}</p>
                </div>
                {role.location && <p className="text-sm text-muted-foreground">{role.location}</p>}
              </CardHeader>
              <CardContent className="space-y-4">
                <Bullets items={role.bullets} />
                {role.tools && <Tags tags={role.tools} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {section.kind === "projects" && (
        <div className="grid gap-4 md:grid-cols-2">
          {section.projects.map((project) => (
            <Card key={project.title} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold leading-snug">
                  <h3>{project.title}</h3>
                </CardTitle>
                {project.href && (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener"
                    className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    View on GitHub <span aria-hidden="true">↗</span>
                  </a>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <Bullets items={project.bullets} />
                <Tags tags={project.tags} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {section.kind === "dated" && (
        <ul className="divide-y rounded-xl border">
          {section.items.map((item) => (
            <li key={item.title} className="flex items-baseline justify-between gap-4 px-4 py-3">
              <span className="flex items-baseline gap-3">
                <span aria-hidden="true" className="size-2 shrink-0 translate-y-[-1px] rounded-full bg-[var(--accent)]" />
                {item.title}
              </span>
              <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {item.date}
              </span>
            </li>
          ))}
        </ul>
      )}

      {section.kind === "tags" && (
        <dl className="space-y-4">
          {section.groups.map((group) => (
            <div key={group.label} className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:items-baseline">
              <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{group.label}</dt>
              <dd>
                <Tags tags={group.tags} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** The static page a building opens into: hero, key facts, content sections, and prev/next. */
export default function ZonePage({ page }: { page: SitePage }) {
  const index = sitePages.indexOf(page);
  const previous = sitePages[index - 1];
  const next = sitePages[index + 1];

  return (
    // The accent (the building's colour in the 3D world) is decoration only — text stays
    // neutral so contrast never depends on it.
    <article style={{ "--accent": page.accent } as CSSProperties}>
      <header className="relative border-b">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" />
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{page.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{page.subtitle}</p>

          {page.zoneId === "contact" && (
            <div className="mt-8 flex flex-wrap gap-2">
              <a href={`mailto:${contactLinks.email}`} className={buttonVariants({ size: "lg" })}>
                Email me
              </a>
              <a
                href={contactLinks.linkedin}
                target="_blank"
                rel="noopener"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                LinkedIn
              </a>
              <a
                href={contactLinks.github}
                target="_blank"
                rel="noopener"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                GitHub
              </a>
              <a href={contactLinks.resume} download className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Download resume
              </a>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-12 sm:px-6">
        {page.facts.length > 0 && (
          <dl
            className={cn(
              "grid gap-3 sm:grid-cols-2",
              page.facts.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            )}
          >
            {page.facts.map((fact) => (
              <div key={fact.label} className="rounded-xl border border-l-4 border-l-[var(--accent)] bg-card p-4">
                <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{fact.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight">{fact.value}</dd>
                {fact.note && <dd className="mt-1 text-sm text-muted-foreground">{fact.note}</dd>}
              </div>
            ))}
          </dl>
        )}

        {page.sections.map((section) => (
          <Section key={section.heading} section={section} />
        ))}

        <nav aria-label="Timeline" className="grid gap-3 border-t pt-8 sm:grid-cols-2">
          {previous ? (
            <Link href={previous.href} className="group rounded-xl border p-4 transition-colors hover:bg-muted/60">
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
              className="group rounded-xl border p-4 text-right transition-colors hover:bg-muted/60"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Next<span aria-hidden="true"> →</span>
              </span>
              <span className="mt-1 block font-medium">{next.navLabel}</span>
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
