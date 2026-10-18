import * as THREE from "three";
import { AnimationMixer, type AnimationAction } from "three";
import { loadModelWithAnimations, enableShadows } from "./load-gltf";
import { WORLD_BOUNDS } from "@/lib/zones";

const WALK_SPEED = 5.5; // world units / second
const TURN_RATE = 9; // higher = snaps to facing direction faster

export type CharacterController = {
  group: THREE.Group;
  /** moveX/moveZ are world-space direction components, each in [-1, 1] (not necessarily normalized). */
  update: (delta: number, moveX: number, moveZ: number) => void;
};

export function createCharacterController(): CharacterController {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  let mixer: AnimationMixer | null = null;
  let idleAction: AnimationAction | null = null;
  let walkAction: AnimationAction | null = null;
  let currentAction: AnimationAction | null = null;

  loadModelWithAnimations("/models/character/character.glb").then(({ scene, animations }) => {
    enableShadows(scene);
    group.add(scene);

    mixer = new AnimationMixer(scene);
    const idleClip = animations.find((c) => c.name === "idle");
    const walkClip = animations.find((c) => c.name === "walk");
    if (idleClip) idleAction = mixer.clipAction(idleClip);
    if (walkClip) walkAction = mixer.clipAction(walkClip);
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

  function update(delta: number, moveX: number, moveZ: number) {
    mixer?.update(delta);

    const magnitude = Math.hypot(moveX, moveZ);
    const moving = magnitude > 0.01;
    setAction(moving ? walkAction : idleAction);

    if (moving) {
      const dirX = moveX / magnitude;
      const dirZ = moveZ / magnitude;
      group.position.x = THREE.MathUtils.clamp(
        group.position.x + dirX * WALK_SPEED * delta,
        WORLD_BOUNDS.xMin,
        WORLD_BOUNDS.xMax
      );
      group.position.z = THREE.MathUtils.clamp(
        group.position.z + dirZ * WALK_SPEED * delta,
        WORLD_BOUNDS.zMin,
        WORLD_BOUNDS.zMax
      );

      const targetAngle = Math.atan2(dirX, dirZ);
      let diff = targetAngle - group.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      group.rotation.y += diff * Math.min(1, TURN_RATE * delta);
    }
  }

  return { group, update };
}
