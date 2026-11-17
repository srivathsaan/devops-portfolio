"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, GraduationCap, Landmark, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LiquidNavbar, type LiquidNavItem, type NimbusFx } from "@/components/ui/liquid-glass-navbar";
import WorldLink from "@/components/site/world-link";
import { contactLinks, sitePages } from "@/lib/pages";

// Icon and tap animation per page, keyed by the building (zone) that opens it.
const navStyle: Record<string, { icon: React.ReactNode; fx: NimbusFx }> = {
  btech: { icon: <GraduationCap size={18} strokeWidth={1.8} aria-hidden />, fx: "wave" },
  bounteous: { icon: <Briefcase size={18} strokeWidth={1.8} aria-hidden />, fx: "pop" },
  ntu: { icon: <Landmark size={18} strokeWidth={1.8} aria-hidden />, fx: "spin" },
  contact: { icon: <Mail size={18} strokeWidth={1.8} aria-hidden />, fx: "drop" },
};

const navItems: LiquidNavItem[] = sitePages.map((page) => ({
  label: page.navLabel,
  href: page.href,
  ...navStyle[page.zoneId],
}));

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const currentIndex = sitePages.findIndex((page) => page.href === pathname);
  const current = sitePages[currentIndex];

  // The layout (and this nav) stays mounted across these pages, so the water drop can glide
  // between items — prefetch them so the route change lands as the drop does.
  useEffect(() => {
    sitePages.forEach((page) => router.prefetch(page.href));
  }, [router]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:grid-cols-[auto_1fr_auto]">
        <WorldLink
          zoneId={current?.zoneId}
          className="font-mono text-xs font-medium uppercase tracking-widest text-foreground"
        >
          Srivathsaan Nakkeeran
        </WorldLink>

        <div className="order-3 col-span-2 flex justify-center lg:order-none lg:col-span-1">
          <LiquidNavbar
            items={navItems}
            active={Math.max(currentIndex, 0)}
            onNavigate={(href) => router.push(href)}
            tone="light"
            className="bg-muted"
            style={{ fontFamily: "inherit" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <a href={contactLinks.resume} download className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Resume
          </a>
          <WorldLink zoneId={current?.zoneId} className={buttonVariants({ size: "sm" })}>
            <span className="sm:hidden">3D world</span>
            <span className="hidden sm:inline">Back to the 3D world</span>
          </WorldLink>
        </div>
      </div>
    </header>
  );
}
