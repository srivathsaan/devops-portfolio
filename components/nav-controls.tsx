"use client";

import { Button } from "@/components/ui/button";
import { scenes } from "@/lib/scenes";

type Props = {
  sceneIndex: number;
  isTransitioning: boolean;
  onAdvance: () => void;
  onReverse: () => void;
};

export default function NavControls({ sceneIndex, isTransitioning, onAdvance, onReverse }: Props) {
  const canReverse = !isTransitioning && sceneIndex > 0;
  const canAdvance = !isTransitioning && sceneIndex < scenes.length - 1;

  return (
    <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Previous scene"
        disabled={!canReverse}
        onClick={onReverse}
        className="rounded-full bg-background/85 backdrop-blur-sm"
      >
        <ArrowIcon direction="left" />
      </Button>
      <div className="flex gap-1.5">
        {scenes.map((scene, i) => (
          <span
            key={scene.id}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i === sceneIndex ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Next scene"
        disabled={!canAdvance}
        onClick={onAdvance}
        className="rounded-full bg-background/85 backdrop-blur-sm"
      >
        <ArrowIcon direction="right" />
      </Button>
    </div>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === "right" ? "M6 3l5 5-5 5" : "M10 3L5 8l5 5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
