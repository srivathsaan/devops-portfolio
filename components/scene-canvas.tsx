"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createEngine } from "@/lib/three/engine";
import { disposeGroup } from "@/lib/three/helpers";
import { rideOffsetX, RIDE_DURATION, REST_X } from "@/lib/three/animate-ride";
import { buildLandingRig } from "@/lib/three/build-landing";
import { buildCycleRig } from "@/lib/three/build-cycle";
import { buildBikeRig } from "@/lib/three/build-bike";
import { buildFlightRig } from "@/lib/three/build-flight";
import { buildContactRig } from "@/lib/three/build-contact";
import type { Rig } from "@/lib/three/types";

export type SceneCanvasHandle = {
  advance: () => void;
  reverse: () => void;
};

type Props = {
  onSceneChange: (index: number) => void;
  onTransitionChange: (isTransitioning: boolean) => void;
};

const builders: Array<() => Rig> = [
  buildLandingRig,
  buildCycleRig,
  buildBikeRig,
  buildFlightRig,
  buildContactRig,
];

type Transition = { direction: 1 | -1; elapsed: number; toIndex: number };

const SceneCanvas = forwardRef<SceneCanvasHandle, Props>(function SceneCanvas(
  { onSceneChange, onTransitionChange },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Imperative, synchronous state the rAF loop and keyboard handlers read directly —
  // mirrors the reference component's cameraAnimating/dragging guard-ref pattern.
  const apiRef = useRef<SceneCanvasHandle>({ advance: () => {}, reverse: () => {} });

  useImperativeHandle(ref, () => ({
    advance: () => apiRef.current.advance(),
    reverse: () => apiRef.current.reverse(),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    let cancelled = false;

    const engine = createEngine(canvas);
    const rigs = builders.map((build) => build());
    rigs.forEach((rig) => {
      rig.mover.visible = false;
      rig.environment.visible = false;
      engine.rigRoot.add(rig.mover, rig.environment);
    });

    let sceneIndex = 0;
    let activeRig = rigs[0];
    activeRig.mover.visible = true;
    activeRig.environment.visible = true;
    engine.setBackground(activeRig.background);
    onSceneChange(0);

    let transition: Transition | null = null;

    function startTransition(direction: 1 | -1, toIndex: number) {
      if (transition) return;
      if (toIndex < 0 || toIndex >= rigs.length) return;
      transition = { direction, elapsed: 0, toIndex };
      onTransitionChange(true);
    }

    apiRef.current = {
      advance: () => startTransition(1, sceneIndex + 1),
      reverse: () => startTransition(-1, sceneIndex - 1),
    };

    engine.resize();
    const resizeObserver = new ResizeObserver(() => engine.resize());
    resizeObserver.observe(container);

    let lastFrameTime = performance.now();

    function tick() {
      if (cancelled) return;
      requestAnimationFrame(tick);
      const now = performance.now();
      const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;

      if (transition) {
        transition.elapsed += delta;
        const progress = transition.elapsed / RIDE_DURATION;
        activeRig.mover.position.x = rideOffsetX(progress, transition.direction);
        activeRig.update(delta, true);

        if (progress >= 1) {
          activeRig.mover.visible = false;
          activeRig.environment.visible = false;
          activeRig.mover.position.x = REST_X;

          sceneIndex = transition.toIndex;
          activeRig = rigs[sceneIndex];
          activeRig.mover.visible = true;
          activeRig.environment.visible = true;
          engine.setBackground(activeRig.background);

          transition = null;
          onSceneChange(sceneIndex);
          onTransitionChange(false);
        }
      } else {
        activeRig.update(delta, false);
      }

      engine.renderer.render(engine.scene, engine.camera);
    }
    requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      rigs.forEach((rig) => {
        disposeGroup(rig.mover);
        disposeGroup(rig.environment);
      });
      engine.dispose();
    };
  }, [onSceneChange, onTransitionChange]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
});

export default SceneCanvas;
