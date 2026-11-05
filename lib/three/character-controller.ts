import * as THREE from "three";
import { AnimationMixer, type AnimationAction } from "three";
import { loadModelWithAnimations, enableShadows } from "./load-gltf";
import { WORLD_BOUNDS } from "@/lib/zones";
import type { Collider } from "./world";

const WALK_SPEED = 5.5; // world units / second
// Bicycle ride functionality — disabled, kept for easy re-enabling. See the other
// commented-out blocks below, plus components/scene-canvas.tsx and
// components/portfolio-experience.tsx.
// const RIDE_SPEED_MULTIPLIER = 1.8; // bicycle speed boost
const TURN_RATE = 9; // higher = snaps to facing direction faster
const CHARACTER_RADIUS = 0.35; // footprint used to keep clear of colliders
// const RIDE_SEAT_HEIGHT = 0.5; // lifts the character onto the bike seat while riding, instead of sitting buried in the frame at ground height
const JUMP_HEIGHT = 1.2; // peak height of the jump arc
const JUMP_DURATION = 0.5; // seconds — matches the "jump" clip's own length

export type CharacterController = {
  group: THREE.Group;
  /** moveX/moveZ are world-space direction components, each in [-1, 1] (not necessarily normalized). `riding` is accepted but currently ignored — bicycle riding is disabled. */
  update: (delta: number, moveX: number, moveZ: number, riding?: boolean) => void;
  /** Starts a jump arc if not already mid-jump. */
  jump: () => void;
};

export function createCharacterController(colliders: Collider[] = []): CharacterController {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  let mixer: AnimationMixer | null = null;
  let idleAction: AnimationAction | null = null;
  let walkAction: AnimationAction | null = null;
  let jumpAction: AnimationAction | null = null;
  // let driveAction: AnimationAction | null = null; // bicycle ride: disabled
  let currentAction: AnimationAction | null = null;
  // let characterMesh: THREE.Object3D | null = null; // bicycle ride: disabled (seat-height lift)
  let jumping = false;
  let jumpElapsed = 0;

  loadModelWithAnimations("/models/character/character.glb").then(({ scene, animations }) => {
    enableShadows(scene);
    group.add(scene);
    // characterMesh = scene; // bicycle ride: disabled

    mixer = new AnimationMixer(scene);
    const idleClip = animations.find((c) => c.name === "idle");
    const walkClip = animations.find((c) => c.name === "walk");
    const jumpClip = animations.find((c) => c.name === "jump");
    // Seated, hands-forward pose baked into the character rig — used in place of the
    // walk cycle while riding the bicycle, so the character doesn't look like it's
    // walking through the bike. Bicycle ride: disabled.
    // const driveClip = animations.find((c) => c.name === "drive");
    if (idleClip) idleAction = mixer.clipAction(idleClip);
    if (walkClip) walkAction = mixer.clipAction(walkClip);
    if (jumpClip) {
      jumpAction = mixer.clipAction(jumpClip);
      jumpAction.setLoop(THREE.LoopOnce, 1);
      jumpAction.clampWhenFinished = true;
    }
    // if (driveClip) driveAction = mixer.clipAction(driveClip);
    if (idleAction) {
      idleAction.play();
      currentAction = idleAction;
    }
  });

  function setAction(next: AnimationAction | null | undefined) {
    if (!next || next === currentAction) return;
    next.reset().fadeIn(0.15).play();
    currentAction?.fadeOut(0.15);
    currentAction = next;
  }

  /** Pushes a candidate position back out of any collider it penetrates. */
  function resolveCollisions(x: number, z: number): { x: number; z: number } {
    let rx = x;
    let rz = z;
    for (const c of colliders) {
      const dx = rx - c.x;
      const dz = rz - c.z;
      const minDist = c.radius + CHARACTER_RADIUS;
      const distSq = dx * dx + dz * dz;
      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq) || 0.0001;
        const push = minDist - dist;
        rx += (dx / dist) * push;
        rz += (dz / dist) * push;
      }
    }
    return { x: rx, z: rz };
  }

  function jump() {
    if (jumping) return;
    jumping = true;
    jumpElapsed = 0;
  }

  function update(delta: number, moveX: number, moveZ: number, riding = false) {
    mixer?.update(delta);
    void riding; // bicycle ride: disabled — see commented-out branches below

    const magnitude = Math.hypot(moveX, moveZ);
    const moving = magnitude > 0.01;

    if (jumping) {
      jumpElapsed += delta;
      const p = Math.min(1, jumpElapsed / JUMP_DURATION);
      // Simple parabola, zeroed at both ends of the arc regardless of frame rate.
      group.position.y = JUMP_HEIGHT * 4 * p * (1 - p);
      setAction(jumpAction ?? (moving ? walkAction : idleAction));
      if (p >= 1) {
        jumping = false;
        group.position.y = 0;
      }
    } else {
      setAction(moving ? walkAction : idleAction);
    }
    // Bicycle ride: disabled. Re-enable by restoring:
    // setAction(riding ? driveAction ?? (moving ? walkAction : idleAction) : moving ? walkAction : idleAction);

    // if (characterMesh) {
    //   const targetY = riding ? RIDE_SEAT_HEIGHT : 0;
    //   characterMesh.position.y += (targetY - characterMesh.position.y) * Math.min(1, 10 * delta);
    // }

    if (moving) {
      const speed = WALK_SPEED; // bicycle ride: disabled — was `WALK_SPEED * (riding ? RIDE_SPEED_MULTIPLIER : 1)`
      const dirX = moveX / magnitude;
      const dirZ = moveZ / magnitude;
      const candidateX = THREE.MathUtils.clamp(
        group.position.x + dirX * speed * delta,
        WORLD_BOUNDS.xMin,
        WORLD_BOUNDS.xMax
      );
      const candidateZ = THREE.MathUtils.clamp(
        group.position.z + dirZ * speed * delta,
        WORLD_BOUNDS.zMin,
        WORLD_BOUNDS.zMax
      );
      const resolved = resolveCollisions(candidateX, candidateZ);
      group.position.x = resolved.x;
      group.position.z = resolved.z;

      const targetAngle = Math.atan2(dirX, dirZ);
      let diff = targetAngle - group.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      group.rotation.y += diff * Math.min(1, TURN_RATE * delta);
    }
  }

  return { group, update, jump };
}
