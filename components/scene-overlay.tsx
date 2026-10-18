"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { scenes } from "@/lib/scenes";
import { cn } from "@/lib/utils";

type Props = {
  sceneIndex: number;
};

export default function SceneOverlay({ sceneIndex }: Props) {
  const scene = scenes[sceneIndex];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex justify-center px-4 sm:bottom-24 sm:justify-start sm:px-10">
      <Card className="pointer-events-auto w-full max-w-md bg-background/85 backdrop-blur-sm">
        <CardHeader>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {scene.eyebrow}
          </p>
          <CardTitle className="text-xl leading-snug sm:text-2xl">{scene.title}</CardTitle>
          {scene.org && <p className="text-sm text-muted-foreground">{scene.org}</p>}
        </CardHeader>
        {(scene.bullets.length > 0 || scene.cta || scene.links) && (
          <CardContent className="flex flex-col gap-3">
            {scene.bullets.length > 0 && (
              <ul className="list-disc space-y-1.5 pl-4 text-sm text-foreground/90">
                {scene.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
            {scene.cta && (
              <p className="font-mono text-sm font-medium text-primary">{scene.cta}</p>
            )}
            {scene.links && (
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={scene.links.resume}
                  download
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Resume
                </a>
                <a
                  href={`mailto:${scene.links.email}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Email
                </a>
                <a
                  href={scene.links.linkedin}
                  target="_blank"
                  rel="noopener"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  LinkedIn
                </a>
                <a
                  href={scene.links.github}
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
