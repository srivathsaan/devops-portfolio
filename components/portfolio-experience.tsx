"use client";

import { useCallback, useRef, useState } from "react";
// Bicycle ride functionality — disabled, kept commented out for easy re-enabling.
// See matching commented-out blocks in components/scene-canvas.tsx and
// lib/three/character-controller.ts.
// import SceneCanvas, { type RideState, type SceneCanvasHandle } from "@/components/scene-canvas";
import SceneCanvas, { type SceneCanvasHandle } from "@/components/scene-canvas";
import SceneOverlay from "@/components/scene-overlay";
import VirtualJoystick from "@/components/virtual-joystick";
import type { ZoneContent } from "@/lib/zones";

export default function PortfolioExperience() {
  const [zone, setZone] = useState<ZoneContent | null>(null);
  // const [rideState, setRideState] = useState<RideState>({ riding: false, canRide: false });
  const canvasHandleRef = useRef<SceneCanvasHandle>(null);

  const handleJoystick = useCallback((x: number, z: number) => {
    canvasHandleRef.current?.setJoystick(x, z);
  }, []);

  // const handleRideTap = useCallback(() => {
  //   canvasHandleRef.current?.toggleRide();
  // }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      <SceneCanvas ref={canvasHandleRef} onZoneChange={setZone} />
      <div className="pointer-events-none absolute left-5 top-5 z-10 font-mono text-xs uppercase tracking-widest text-white/80 drop-shadow sm:left-8 sm:top-6">
        Srivathsaan Nakkeeran
      </div>
      <div className="pointer-events-none absolute bottom-2 right-3 z-10 max-w-[220px] text-right font-mono text-[9px] leading-tight text-white/50 sm:right-4">
        3D: Bicycle, Motorcycle, Airplane by Poly by Google (CC-BY) via Poly Pizza · Character, trees &amp; buildings by Kenney (CC0)
      </div>
      {/* Bicycle ride: disabled. Re-enable by restoring:
      {(rideState.riding || rideState.canRide) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-32 z-10 flex justify-center font-mono text-xs uppercase tracking-widest text-white/80 drop-shadow sm:bottom-10">
          Press F to {rideState.riding ? "dismount" : "ride the bicycle"}
        </div>
      )} */}
      <SceneOverlay zone={zone} />
      <div className="pointer-events-none absolute bottom-6 left-6 z-10">
        <VirtualJoystick onChange={handleJoystick} />
      </div>
      {/* Bicycle ride: disabled. Re-enable by restoring:
      <div className="pointer-events-none absolute bottom-6 right-6 z-10 sm:hidden">
        <button
          type="button"
          onClick={handleRideTap}
          disabled={!rideState.riding && !rideState.canRide}
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/25 text-2xl backdrop-blur-sm disabled:opacity-40"
          aria-label={rideState.riding ? "Dismount bicycle" : "Ride bicycle"}
        >
          🚲
        </button>
      </div> */}
    </div>
  );
}
