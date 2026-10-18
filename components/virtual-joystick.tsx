"use client";

import { useRef, useState } from "react";

const BASE_RADIUS = 48;
const KNOB_LIMIT = 34;

type Props = {
  /** Called with a normalized direction (x, z world-space), both in [-1, 1]. */
  onChange: (x: number, z: number) => void;
};

/**
 * Touch-only on-screen joystick for movement on devices without a keyboard.
 * Drag within the base; direction is reported as world-space x/z matching the
 * same axes the keyboard (arrow/WASD) controls drive.
 */
export default function VirtualJoystick({ onChange }: Props) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const activeTouch = useRef<number | null>(null);

  function updateFromPoint(clientX: number, clientY: number) {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > BASE_RADIUS) {
      dx = (dx / dist) * BASE_RADIUS;
      dy = (dy / dist) * BASE_RADIUS;
    }
    setKnob({ x: dx, y: dy });
    // Screen up (negative dy) = world -z ("north"); screen right (positive dx) = world +x.
    onChange(clamp(dx / KNOB_LIMIT), clamp(dy / KNOB_LIMIT));
  }

  function clamp(v: number) {
    return Math.max(-1, Math.min(1, v));
  }

  function reset() {
    activeTouch.current = null;
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
  }

  return (
    <div
      ref={baseRef}
      className="pointer-events-auto relative h-28 w-28 touch-none select-none rounded-full border border-white/20 bg-black/25 backdrop-blur-sm sm:hidden"
      onTouchStart={(e) => {
        const t = e.changedTouches[0];
        activeTouch.current = t.identifier;
        updateFromPoint(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        for (const t of Array.from(e.changedTouches)) {
          if (t.identifier === activeTouch.current) updateFromPoint(t.clientX, t.clientY);
        }
      }}
      onTouchEnd={(e) => {
        for (const t of Array.from(e.changedTouches)) {
          if (t.identifier === activeTouch.current) reset();
        }
      }}
      onTouchCancel={reset}
    >
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-white/70 shadow-lg"
        style={{ transform: `translate(-50%, -50%) translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}
