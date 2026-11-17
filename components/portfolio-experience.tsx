"use client";

import { useCallback, useRef, useState } from "react";
// Bicycle ride functionality — disabled, kept commented out for easy re-enabling.
// See matching commented-out blocks in components/scene-canvas.tsx and
// lib/three/character-controller.ts.
// import SceneCanvas, { type RideState, type SceneCanvasHandle } from "@/components/scene-canvas";
import SceneCanvas, { type SceneCanvasHandle } from "@/components/scene-canvas";
import SceneOverlay from "@/components/scene-overlay";
import BuildingInterior from "@/components/building-interior";
import VirtualJoystick from "@/components/virtual-joystick";
import { zones, type ZoneContent } from "@/lib/zones";
import { cn } from "@/lib/utils";

export default function PortfolioExperience() {
  const [zone, setZone] = useState<ZoneContent | null>(null);
  // const [rideState, setRideState] = useState<RideState>({ riding: false, canRide: false });
  const [nearDoorZoneId, setNearDoorZoneId] = useState<string | null>(null);
  const [enteredZoneId, setEnteredZoneId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const canvasHandleRef = useRef<SceneCanvasHandle>(null);

  const handleJoystick = useCallback((x: number, z: number) => {
    canvasHandleRef.current?.setJoystick(x, z);
  }, []);

  const handleReady = useCallback(() => setReady(true), []);

  const handleEnterTap = useCallback(() => {
    canvasHandleRef.current?.enterNearbyBuilding();
  }, []);

  // const handleRideTap = useCallback(() => {
  //   canvasHandleRef.current?.toggleRide();
  // }, []);

  const enteredZone = enteredZoneId ? zones.find((z) => z.id === enteredZoneId) ?? null : null;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#bfe3f2]">
      <SceneCanvas
        ref={canvasHandleRef}
        onZoneChange={setZone}
        onNearDoorChange={setNearDoorZoneId}
        onEnterBuilding={setEnteredZoneId}
        onReady={handleReady}
        paused={enteredZoneId !== null}
      />
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-black/35 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-white backdrop-blur-sm sm:left-6 sm:top-5">
        Srivathsaan Nakkeeran
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-black/30 px-2 py-1 text-center font-mono text-[9px] leading-tight text-white/85 backdrop-blur-sm sm:inset-x-auto sm:bottom-2 sm:right-4 sm:max-w-[230px] sm:rounded-md sm:text-right">
        3D: Bicycle, Motorcycle, Airplane by Poly by Google (CC-BY) via Poly Pizza · Character, trees &amp; buildings by Kenney (CC0)
      </div>
      {/* Bicycle ride: disabled. Re-enable by restoring:
      {(rideState.riding || rideState.canRide) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-32 z-10 flex justify-center font-mono text-xs uppercase tracking-widest text-white/80 drop-shadow sm:bottom-10">
          Press F to {rideState.riding ? "dismount" : "ride the bicycle"}
        </div>
      )} */}
      {nearDoorZoneId && !enteredZoneId && (
        <div className="pointer-events-none absolute inset-x-0 bottom-44 z-10 flex justify-center sm:bottom-auto sm:top-16 lg:bottom-10 lg:top-auto">
          <div className="flex items-center gap-2 rounded-full border border-white/25 bg-black/55 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white shadow-lg backdrop-blur-sm animate-in fade-in duration-200">
            <kbd className="hidden rounded border border-white/40 bg-white/15 px-1.5 py-0.5 font-mono text-[11px] leading-none sm:inline-block">
              E
            </kbd>
            <span className="hidden sm:inline">Enter building</span>
            <span className="sm:hidden">Tap the door button to enter</span>
          </div>
        </div>
      )}
      <SceneOverlay zone={zone} />
      <div className="pointer-events-none absolute bottom-12 left-6 z-10">
        <VirtualJoystick onChange={handleJoystick} />
      </div>
      <div className="pointer-events-none absolute bottom-12 right-6 z-10 sm:hidden">
        <button
          type="button"
          onClick={handleEnterTap}
          disabled={!nearDoorZoneId}
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/25 text-2xl backdrop-blur-sm transition enabled:border-white/70 enabled:bg-white/30 enabled:shadow-lg disabled:opacity-40"
          aria-label="Enter building"
        >
          🚪
        </button>
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
      <div
        aria-hidden={ready}
        className={cn(
          "absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-[#bfe3f2] transition-opacity duration-700",
          ready ? "pointer-events-none opacity-0" : "opacity-100"
        )}
      >
        <p className="font-mono text-sm uppercase tracking-widest text-slate-700">Srivathsaan Nakkeeran</p>
        <p className="animate-pulse font-mono text-[11px] uppercase tracking-widest text-slate-500">
          Loading the world…
        </p>
      </div>
      {enteredZone && <BuildingInterior zone={enteredZone} onExit={() => setEnteredZoneId(null)} />}
    </div>
  );
}
