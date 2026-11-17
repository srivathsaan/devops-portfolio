"use client";

import { useEffect, useRef } from "react";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `building-${zone.id}-title`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // A native modal: the browser moves focus inside, keeps Tab there, makes the page
    // behind inert, and puts focus back where it was when the dialog closes.
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Escape: leave via the same path as the button, so the game's state stays in sync.
        e.preventDefault();
        onExit();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-background/95 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full items-center justify-center p-4 animate-in fade-in duration-200">
        <Card className="w-full max-w-xl max-h-[85vh] overflow-y-auto">
          <CardHeader>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {zone.eyebrow}
            </p>
            <CardTitle id={titleId} className="text-2xl leading-snug sm:text-3xl">
              {zone.title}
            </CardTitle>
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
              <span aria-hidden="true">←</span> Back outside (Esc)
            </button>
          </CardContent>
        </Card>
      </div>
    </dialog>
  );
}
