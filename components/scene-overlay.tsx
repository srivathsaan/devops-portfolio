"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { ZoneContent } from "@/lib/zones";
import { cn } from "@/lib/utils";

type Props = {
  zone: ZoneContent | null;
};

export default function SceneOverlay({ zone }: Props) {
  if (!zone) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex justify-center px-4 sm:bottom-10 sm:justify-start sm:px-10">
      <Card className="pointer-events-auto w-full max-w-md bg-background/85 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
        <CardHeader>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {zone.eyebrow}
          </p>
          <CardTitle className="text-xl leading-snug sm:text-2xl">{zone.title}</CardTitle>
          {zone.org && <p className="text-sm text-muted-foreground">{zone.org}</p>}
        </CardHeader>
        {(zone.bullets.length > 0 || zone.cta || zone.links) && (
          <CardContent className="flex flex-col gap-3">
            {zone.bullets.length > 0 && (
              <ul className="list-disc space-y-1.5 pl-4 text-sm text-foreground/90">
                {zone.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
            {zone.cta && (
              <p className="font-mono text-sm font-medium text-primary">{zone.cta}</p>
            )}
            {zone.links && (
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={zone.links.resume}
                  download
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Resume
                </a>
                <a
                  href={`mailto:${zone.links.email}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Email
                </a>
                <a
                  href={zone.links.linkedin}
                  target="_blank"
                  rel="noopener"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  LinkedIn
                </a>
                <a
                  href={zone.links.github}
                  target="_blank"
                  rel="noopener"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  GitHub
                </a>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
