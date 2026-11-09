"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { ZoneContent } from "@/lib/zones";
import { cn } from "@/lib/utils";

type Props = {
  zone: ZoneContent;
  onExit: () => void;
};

/** Full-screen static details page shown when the character enters a building's door. */
export default function BuildingInterior({ zone, onExit }: Props) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <CardHeader>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {zone.eyebrow}
          </p>
          <CardTitle className="text-2xl leading-snug sm:text-3xl">{zone.title}</CardTitle>
          {zone.org && <p className="text-sm text-muted-foreground">{zone.org}</p>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {zone.bullets.length > 0 && (
            <ul className="list-disc space-y-2 pl-4 text-sm text-foreground/90">
              {zone.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
          {zone.links && (
            <div className="flex flex-wrap gap-2 pt-1">
              <a href={zone.links.resume} download className={cn(buttonVariants({ size: "sm" }))}>
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
          <button
            type="button"
            onClick={onExit}
            className={cn(buttonVariants({ variant: "outline" }), "mt-2 self-start")}
          >
            ← Back outside (Esc)
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
