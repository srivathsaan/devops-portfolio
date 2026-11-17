"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import WorldLink from "@/components/site/world-link";
import { contactLinks, sitePages } from "@/lib/pages";
import { cn } from "@/lib/utils";

export default function SiteNav() {
  const pathname = usePathname();
  const current = sitePages.find((page) => page.href === pathname);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto grid max-w-5xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:grid-cols-[auto_1fr_auto]"
      >
        <WorldLink
          zoneId={current?.zoneId}
          className="font-mono text-xs font-medium uppercase tracking-widest text-foreground"
        >
          Srivathsaan Nakkeeran
        </WorldLink>

        <ul className="order-3 col-span-2 -mx-1 flex gap-1 overflow-x-auto px-1 lg:order-none lg:col-span-1 lg:justify-center">
          {sitePages.map((page) => {
            const active = page.href === pathname;
            return (
              <li key={page.href} className="shrink-0">
                <Link
                  href={page.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-block rounded-full px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {page.navLabel}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a href={contactLinks.resume} download className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Resume
          </a>
          <WorldLink zoneId={current?.zoneId} className={buttonVariants({ size: "sm" })}>
            <span className="sm:hidden">3D world</span>
            <span className="hidden sm:inline">Back to the 3D world</span>
          </WorldLink>
        </div>
      </nav>
    </header>
  );
}
