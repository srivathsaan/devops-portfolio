"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { createEngine } from "@/lib/three/engine";
import { disposeGroup } from "@/lib/three/helpers";
import { createCharacterController } from "@/lib/three/character-controller";
import { buildWorld } from "@/lib/three/world";
import { whenModelsLoaded } from "@/lib/three/load-gltf";
import { readReturnZone } from "@/lib/return-zone";
import { createOcclusionFader } from "@/lib/three/occlusion-fade";
import { zones, type ZoneContent } from "@/lib/zones";

// Bicycle ride functionality — disabled, kept commented out for easy re-enabling.
// See matching commented-out blocks in lib/three/character-controller.ts and
// components/portfolio-experience.tsx.
// export type RideState = { riding: boolean; canRide: boolean };

export type SceneCanvasHandle = {
  /** Touch-joystick input, world-space x/z in [-1, 1]. Keyboard input is handled internally. */
  setJoystick: (x: number, z: number) => void;
  /** Enters the nearby building's interior view, if the character is close enough to a door. Mirrors the E key. */
  enterNearbyBuilding: () => void;
  // /** Mounts the bicycle if close enough, or dismounts if currently riding. Mirrors the F key. */
  // toggleRide: () => void;
};

type Props = {
  onZoneChange: (zone: ZoneContent | null) => void;
  /** Fires whenever the character moves into/out of range of a building's door, so UI (e.g. the mobile enter button and hint) can reflect it. */
  onNearDoorChange?: (zoneId: string | null) => void;
  /** Called with the door's zoneId when the character enters a building. */
  onEnterBuilding?: (zoneId: string) => void;
  /** Called once the world's models have loaded and been drawn, so a loading screen can lift. */
  onReady?: () => void;
  // /** Fires whenever riding state or bicycle-mount availability changes, so UI (e.g. the mobile ride button) can reflect it. */
  // onRideStateChange?: (state: RideState) => void;
};

const CAMERA_OFFSET = new THREE.Vector3(-6.5, 5.2, 7.5);
const LOOK_OFFSET = new THREE.Vector3(2.5, 1.1, 0);
const SUN_OFFSET = new THREE.Vector3(-4, 8, 6);
const CAMERA_LERP = 3.2;
const CHARACTER_CHEST_HEIGHT = 0.5; // the point on the character that must stay visible to the camera
const ENTER_RANGE = 1.3; // default how close the character must be to an entrance to enter (an entrance can override this with its own `radius`)
// const MOUNT_RANGE = 1.8; // bicycle ride: disabled — how close the character had to be to the bicycle to mount it

const SceneCanvas = forwardRef<SceneCanvasHandle, Props>(function SceneCanvas(
  { onZoneChange, onNearDoorChange, onEnterBuilding, onReady },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SceneCanvasHandle>({ setJoystick: () => {}, enterNearbyBuilding: () => {} });

  useImperativeHandle(ref, () => ({
    setJoystick: (x, z) => apiRef.current.setJoystick(x, z),
    enterNearbyBuilding: () => apiRef.current.enterNearbyBuilding(),
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
    const { group: world, colliders, entrances } = buildWorld();
    engine.rigRoot.add(world);

    const character = createCharacterController(colliders);
    // Coming back from a building's page: step back out of that building (just in front of
    // its door, or of the Hive's cluster), facing the path, instead of starting over.
    const returnZone = readReturnZone();
    const returnEntrance = returnZone ? entrances.find((entrance) => entrance.zoneId === returnZone) : undefined;
    if (returnEntrance) {
      const stepOut = returnEntrance.radius ? returnEntrance.radius * 0.9 : 1;
      character.group.position.set(returnEntrance.x, 0, returnEntrance.z + stepOut);
    }
    engine.rigRoot.add(character.group);
    const occlusionFader = createOcclusionFader(world, engine.renderer);

    // Every model has been requested by this point (building the world and the character
    // starts their loads), so wait for them, then two frames: one for the loaded models
    // to be added to the scene and one for them to be drawn.
    whenModelsLoaded().then(() => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) onReady?.();
        })
      );
    });

    const keys = { up: false, down: false, left: false, right: false };
    let joyX = 0;
    let joyZ = 0;
    let nearDoorZoneId: string | null = null;
    // let riding = false; // bicycle ride: disabled
    // let canRide = false; // true when close enough to the parked/dropped bicycle to mount

    function enterNearbyBuilding() {
      if (!nearDoorZoneId) return;
      onEnterBuilding?.(nearDoorZoneId);
    }

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

    apiRef.current = { setJoystick: (x, z) => { joyX = x; joyZ = z; }, enterNearbyBuilding };

    function onKeyDown(e: KeyboardEvent) {
      // The game only takes keys nothing else wants: not browser shortcuts (Cmd/Ctrl/Alt),
      // and not while focus is on a link, button or the text version — so Space/Enter
      // still press buttons and arrows still scroll.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const focused = document.activeElement;
      if (focused && focused !== document.body) {
        // Escape hands the keyboard back to the game.
        if (e.key === "Escape" && focused instanceof HTMLElement) focused.blur();
        return;
      }
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D", " "].includes(
          e.key
        )
      ) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.down = true;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
      if (e.key === " ") character.jump();
      if (e.key === "e" || e.key === "E") enterNearbyBuilding();
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
    const groundPosition = new THREE.Vector3();
    const visibleTarget = new THREE.Vector3();

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

      // The camera tracks the character's ground position, not its height, so a jump
      // lifts the character within the frame instead of bobbing the whole view.
      groundPosition.copy(character.group.position).setY(0);
      cameraTarget.copy(groundPosition).add(CAMERA_OFFSET);
      engine.camera.position.lerp(cameraTarget, Math.min(1, CAMERA_LERP * delta));
      lookTarget.copy(groundPosition).add(LOOK_OFFSET);
      engine.camera.lookAt(lookTarget);

      visibleTarget.copy(character.group.position);
      visibleTarget.y += CHARACTER_CHEST_HEIGHT;
      occlusionFader.update(delta, engine.camera.position, visibleTarget);

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

      let nearestDoor: string | null = null;
      let nearestDoorDist = Infinity;
      for (const entrance of entrances) {
        const dist = Math.hypot(
          character.group.position.x - entrance.x,
          character.group.position.z - entrance.z
        );
        if (dist <= (entrance.radius ?? ENTER_RANGE) && dist < nearestDoorDist) {
          nearestDoor = entrance.zoneId;
          nearestDoorDist = dist;
        }
      }
      if (nearestDoor !== nearDoorZoneId) {
        nearDoorZoneId = nearestDoor;
        onNearDoorChange?.(nearDoorZoneId);
      }

      engine.renderer.render(engine.scene, engine.camera);
    }
    requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      resizeObserver.disconnect();
      occlusionFader.dispose();
      disposeGroup(world);
      disposeGroup(character.group);
      engine.dispose();
    };
  }, [onZoneChange, onNearDoorChange, onEnterBuilding, onReady]);

  return (
    // The canvas exposes nothing to assistive tech; the text version (ProfileSummary) carries the content.
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
});

export default SceneCanvas;
