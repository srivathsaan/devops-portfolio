"use client";

import { useCallback, useRef, useState } from "react";
import SceneCanvas, { type SceneCanvasHandle } from "@/components/scene-canvas";
import SceneOverlay from "@/components/scene-overlay";
import VirtualJoystick from "@/components/virtual-joystick";
import type { ZoneContent } from "@/lib/zones";

export default function PortfolioExperience() {
  const [zone, setZone] = useState<ZoneContent | null>(null);
  const canvasHandleRef = useRef<SceneCanvasHandle>(null);

  const handleJoystick = useCallback((x: number, z: number) => {
    canvasHandleRef.current?.setJoystick(x, z);
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      <SceneCanvas ref={canvasHandleRef} onZoneChange={setZone} />
      <div className="pointer-events-none absolute left-5 top-5 z-10 font-mono text-xs uppercase tracking-widest text-white/80 drop-shadow sm:left-8 sm:top-6">
        Srivathsaan Nakkeeran
      </div>
      <div className="pointer-events-none absolute bottom-2 right-3 z-10 max-w-[220px] text-right font-mono text-[9px] leading-tight text-white/50 sm:right-4">
        3D: Bicycle, Motorcycle, Airplane by Poly by Google (CC-BY) via Poly Pizza · Character, trees &amp; buildings by Kenney (CC0)
      </div>
      <SceneOverlay zone={zone} />
      <div className="pointer-events-none absolute bottom-6 left-6 z-10">
        <VirtualJoystick onChange={handleJoystick} />
      </div>
    </div>
  );
}
