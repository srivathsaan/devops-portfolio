"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { createEngine } from "@/lib/three/engine";
import { disposeGroup } from "@/lib/three/helpers";
import { createCharacterController } from "@/lib/three/character-controller";
import { buildWorld } from "@/lib/three/world";
import { zones, type ZoneContent } from "@/lib/zones";

// Bicycle ride functionality — disabled, kept commented out for easy re-enabling.
// See matching commented-out blocks in lib/three/character-controller.ts and
// components/portfolio-experience.tsx.
// export type RideState = { riding: boolean; canRide: boolean };

export type SceneCanvasHandle = {
  /** Touch-joystick input, world-space x/z in [-1, 1]. Keyboard input is handled internally. */
  setJoystick: (x: number, z: number) => void;
  // /** Mounts the bicycle if close enough, or dismounts if currently riding. Mirrors the F key. */
  // toggleRide: () => void;
};

type Props = {
  onZoneChange: (zone: ZoneContent | null) => void;
  // /** Fires whenever riding state or bicycle-mount availability changes, so UI (e.g. the mobile ride button) can reflect it. */
  // onRideStateChange?: (state: RideState) => void;
};

const CAMERA_OFFSET = new THREE.Vector3(-6.5, 5.2, 7.5);
const LOOK_OFFSET = new THREE.Vector3(2.5, 1.1, 0);
const SUN_OFFSET = new THREE.Vector3(-4, 8, 6);
const CAMERA_LERP = 3.2;
// const MOUNT_RANGE = 1.8; // bicycle ride: disabled — how close the character had to be to the bicycle to mount it

const SceneCanvas = forwardRef<SceneCanvasHandle, Props>(function SceneCanvas(
  { onZoneChange },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SceneCanvasHandle>({ setJoystick: () => {} });

  useImperativeHandle(ref, () => ({
    setJoystick: (x, z) => apiRef.current.setJoystick(x, z),
    // toggleRide: () => apiRef.current.toggleRide(),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    let cancelled = false;

    const engine = createEngine(canvas);
    // Bicycle ride: disabled. The bicycle itself (destructured here as `bicycle` when
    // riding was enabled) stays in the world as a static decorative prop via `world`/
    // `colliders` below; only the mount/follow/animation behavior is commented out.
    const { group: world, colliders } = buildWorld();
    engine.rigRoot.add(world);

    const character = createCharacterController(colliders);
    engine.rigRoot.add(character.group);

    const keys = { up: false, down: false, left: false, right: false };
    let joyX = 0;
    let joyZ = 0;
    // let riding = false; // bicycle ride: disabled
    // let canRide = false; // true when close enough to the parked/dropped bicycle to mount

    // function setRideState(nextRiding: boolean, nextCanRide: boolean) {
    //   if (nextRiding === riding && nextCanRide === canRide) return;
    //   riding = nextRiding;
    //   canRide = nextCanRide;
    //   onRideStateChange?.({ riding, canRide });
    // }

    // function toggleRide() {
    //   if (riding) {
    //     setRideState(false, false);
    //   } else if (canRide) {
    //     setRideState(true, false);
    //   }
    // }

    apiRef.current = { setJoystick: (x, z) => { joyX = x; joyZ = z; } };

    function onKeyDown(e: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.down = true;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
      // if (e.key === "f" || e.key === "F") toggleRide(); // bicycle ride: disabled
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
      // Bicycle ride: disabled. Re-enable by restoring:
      // character.update(delta, moveX, moveZ, riding);
      //
      // if (riding) {
      //   // Bicycle has no ride animation to attach to, so it's just driven to follow the
      //   // character's position/facing each frame; dismounting simply stops moving it,
      //   // dropping it wherever the character currently is.
      //   bicycle.position.copy(character.group.position);
      //   bicycle.rotation.y = character.group.rotation.y;
      // } else {
      //   const bikeDist = Math.hypot(
      //     character.group.position.x - bicycle.position.x,
      //     character.group.position.z - bicycle.position.z
      //   );
      //   setRideState(false, bikeDist <= MOUNT_RANGE);
      // }

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
