"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
// Bicycle ride functionality — disabled, kept commented out for easy re-enabling.
// See matching commented-out blocks in components/scene-canvas.tsx and
// lib/three/character-controller.ts.
// import SceneCanvas, { type RideState, type SceneCanvasHandle } from "@/components/scene-canvas";
import SceneCanvas, { type SceneCanvasHandle } from "@/components/scene-canvas";
import SceneOverlay from "@/components/scene-overlay";
import VirtualJoystick from "@/components/virtual-joystick";
import type { ZoneContent } from "@/lib/zones";
import { contactLinks, pageForZone } from "@/lib/pages";
import { rememberReturnZone } from "@/lib/return-zone";
import { cn } from "@/lib/utils";

export default function PortfolioExperience() {
  const [zone, setZone] = useState<ZoneContent | null>(null);
  // const [rideState, setRideState] = useState<RideState>({ riding: false, canRide: false });
  const [nearDoorZoneId, setNearDoorZoneId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const canvasHandleRef = useRef<SceneCanvasHandle>(null);
  const router = useRouter();

  const handleJoystick = useCallback((x: number, z: number) => {
    canvasHandleRef.current?.setJoystick(x, z);
  }, []);

  const handleReady = useCallback(() => setReady(true), []);

  // Entering a building opens its page; remember the building so "back to the world"
  // returns the character to its door.
  const handleEnterBuilding = useCallback(
    (zoneId: string) => {
      const page = pageForZone(zoneId);
      if (!page) return;
      rememberReturnZone(zoneId);
      router.push(page.href);
    },
    [router]
  );

  // Load the page as soon as the character is at its door, so entering feels instant.
  useEffect(() => {
    const page = nearDoorZoneId ? pageForZone(nearDoorZoneId) : undefined;
    if (page) router.prefetch(page.href);
  }, [nearDoorZoneId, router]);

  const handleEnterTap = useCallback(() => {
    canvasHandleRef.current?.enterNearbyBuilding();
  }, []);

  // const handleRideTap = useCallback(() => {
  //   canvasHandleRef.current?.toggleRide();
  // }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#bfe3f2]">
      <SceneCanvas
        ref={canvasHandleRef}
        onZoneChange={setZone}
        onNearDoorChange={setNearDoorZoneId}
        onEnterBuilding={handleEnterBuilding}
        onReady={handleReady}
      />
      {/* Visual label only; the text version carries the name as the page's h1. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-black/55 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-white backdrop-blur-sm sm:left-6 sm:top-5"
      >
        Srivathsaan Nakkeeran
      </div>
      <a
        href={contactLinks.resume}
        download
        // Movement keys pause while something has focus; after a mouse click, hand focus back
        // to the world so WASD keeps working. Keyboard activation (detail 0) keeps focus.
        onClick={(e) => e.detail > 0 && e.currentTarget.blur()}
        className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-5"
      >
        <Download aria-hidden="true" className="size-3.5" />
        Resume
      </a>
      {/* Bicycle ride: disabled. Re-enable by restoring:
      {(rideState.riding || rideState.canRide) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-32 z-10 flex justify-center font-mono text-xs uppercase tracking-widest text-white/80 drop-shadow sm:bottom-10">
          Press F to {rideState.riding ? "dismount" : "ride the bicycle"}
        </div>
      )} */}
      {/* Always present so screen readers announce changes; the pill below is the visual twin. */}
      <p role="status" className="sr-only">
        {nearDoorZoneId ? "At a building entrance. Press E to enter." : ""}
      </p>
      {nearDoorZoneId && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-44 z-10 flex justify-center sm:bottom-auto sm:top-16 lg:bottom-10 lg:top-auto">
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
    </div>
  );
}
