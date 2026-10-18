"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { createEngine } from "@/lib/three/engine";
import { disposeGroup } from "@/lib/three/helpers";
import { createCharacterController } from "@/lib/three/character-controller";
import { buildWorld } from "@/lib/three/world";
import { zones, type ZoneContent } from "@/lib/zones";

export type SceneCanvasHandle = {
  /** Touch-joystick input, world-space x/z in [-1, 1]. Keyboard input is handled internally. */
  setJoystick: (x: number, z: number) => void;
};

type Props = {
  onZoneChange: (zone: ZoneContent | null) => void;
};

// Chase cam: fixed world-space offset behind/above the spawn point, trailing
// the character as they move.
const CAMERA_OFFSET = new THREE.Vector3(-6.5, 4.6, -3.2);
const LOOK_OFFSET = new THREE.Vector3(0, 1.15, 0);
const SUN_OFFSET = new THREE.Vector3(-4, 8, 6);
const CAMERA_LERP = 3.2;

const SceneCanvas = forwardRef<SceneCanvasHandle, Props>(function SceneCanvas(
  { onZoneChange },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SceneCanvasHandle>({ setJoystick: () => {} });

  useImperativeHandle(ref, () => ({
    setJoystick: (x, z) => apiRef.current.setJoystick(x, z),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    let cancelled = false;

    const engine = createEngine(canvas);
    const world = buildWorld();
    engine.rigRoot.add(world);

    const character = createCharacterController();
    engine.rigRoot.add(character.group);

    const keys = { up: false, down: false, left: false, right: false };
    let joyX = 0;
    let joyZ = 0;

    apiRef.current = { setJoystick: (x, z) => { joyX = x; joyZ = z; } };

    function onKeyDown(e: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.down = true;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.down = false;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    engine.resize();
    const resizeObserver = new ResizeObserver(() => engine.resize());
    resizeObserver.observe(container);

    // Start the camera already in position behind the spawn point so the very
    // first frame doesn't show a jarring fly-in from the default engine pose.
    engine.camera.position.copy(character.group.position).add(CAMERA_OFFSET);
    engine.camera.lookAt(character.group.position.clone().add(LOOK_OFFSET));
    engine.sky.position.copy(engine.camera.position);

    let lastFrameTime = performance.now();
    let activeZoneId: string | null = null;
    const cameraTarget = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();

    function tick() {
      if (cancelled) return;
      requestAnimationFrame(tick);
      const now = performance.now();
      const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;

      // World-space input: Right/D = +x (deeper into the timeline), Left/A = -x,
      // Up/W = -z, Down/S = +z. Keyboard and joystick combine additively, then clamp.
      let moveX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + joyX;
      let moveZ = (keys.down ? 1 : 0) - (keys.up ? 1 : 0) + joyZ;
      const inputMag = Math.hypot(moveX, moveZ);
      if (inputMag > 1) {
        moveX /= inputMag;
        moveZ /= inputMag;
      }

      character.update(delta, moveX, moveZ);

      cameraTarget.copy(character.group.position).add(CAMERA_OFFSET);
      engine.camera.position.lerp(cameraTarget, Math.min(1, CAMERA_LERP * delta));
      lookTarget.copy(character.group.position).add(LOOK_OFFSET);
      engine.camera.lookAt(lookTarget);

      engine.sky.position.copy(engine.camera.position);
      engine.sun.position.copy(character.group.position).add(SUN_OFFSET);
      engine.sun.target.position.copy(character.group.position);
      engine.sun.target.updateMatrixWorld();

      let nearest: ZoneContent | null = null;
      let nearestDist = Infinity;
      for (const zone of zones) {
        const dist = Math.hypot(character.group.position.x - zone.x, character.group.position.z - zone.z);
        if (dist <= zone.radius && dist < nearestDist) {
          nearest = zone;
          nearestDist = dist;
        }
      }
      const nextId = nearest?.id ?? null;
      if (nextId !== activeZoneId) {
        activeZoneId = nextId;
        onZoneChange(nearest);
      }

      engine.renderer.render(engine.scene, engine.camera);
    }
    requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      resizeObserver.disconnect();
      disposeGroup(world);
      disposeGroup(character.group);
      engine.dispose();
    };
  }, [onZoneChange]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
});

export default SceneCanvas;
