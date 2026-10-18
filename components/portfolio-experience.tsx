"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SceneCanvas, { type SceneCanvasHandle } from "@/components/scene-canvas";
import SceneOverlay from "@/components/scene-overlay";
import NavControls from "@/components/nav-controls";

const SWIPE_THRESHOLD = 60;

export default function PortfolioExperience() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasHandleRef = useRef<SceneCanvasHandle>(null);
  const swipeStartX = useRef<number | null>(null);

  const handleAdvance = useCallback(() => canvasHandleRef.current?.advance(), []);
  const handleReverse = useCallback(() => canvasHandleRef.current?.reverse(), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleAdvance();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleReverse();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleAdvance, handleReverse]);

  function onPointerDown(event: React.PointerEvent) {
    swipeStartX.current = event.clientX;
  }
  function onPointerUp(event: React.PointerEvent) {
    if (swipeStartX.current === null) return;
    const dx = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx < 0) handleAdvance();
    else handleReverse();
  }

  return (
    <div
      className="relative h-dvh w-full touch-pan-y overflow-hidden bg-black"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <SceneCanvas
        ref={canvasHandleRef}
        onSceneChange={setSceneIndex}
        onTransitionChange={setIsTransitioning}
      />
      <div className="pointer-events-none absolute left-5 top-5 z-10 font-mono text-xs uppercase tracking-widest text-white/80 drop-shadow sm:left-8 sm:top-6">
        Srivathsaan Nakkeeran
      </div>
      <div className="pointer-events-none absolute bottom-2 right-3 z-10 max-w-[220px] text-right font-mono text-[9px] leading-tight text-white/50 sm:right-4">
        3D: Bicycle, Motorcycle, Airplane by Poly by Google (CC-BY) via Poly Pizza · Character by Kenney (CC0)
      </div>
      <SceneOverlay sceneIndex={sceneIndex} />
      <NavControls
        sceneIndex={sceneIndex}
        isTransitioning={isTransitioning}
        onAdvance={handleAdvance}
        onReverse={handleReverse}
      />
    </div>
  );
}
