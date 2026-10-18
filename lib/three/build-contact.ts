import * as THREE from "three";
import { AnimationMixer, type AnimationAction } from "three";
import { cloneModel, loadModelWithAnimations, enableShadows } from "./load-gltf";
import { roundedBox } from "./helpers";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

const PLANE_SCALE = 0.011;
const RIDER_SCALE = 1.3;

/** Scene 4 — landed in Singapore. Final scene: contact details overlay on top. */
export function buildContactRig(): Rig {
  const mover = new THREE.Group();
  mover.position.set(REST_X, 0, 0);

  let mixer: AnimationMixer | null = null;
  let waveAction: AnimationAction | null = null;

  cloneModel("/models/airplane.glb").then((plane) => {
    enableShadows(plane);
    plane.scale.setScalar(PLANE_SCALE);
    plane.rotation.y = Math.PI / 2;
    plane.position.set(-1.6, 0.78, 0);
    mover.add(plane);
  });

  loadModelWithAnimations("/models/character.glb").then(({ scene, animations }) => {
    enableShadows(scene);
    scene.scale.setScalar(RIDER_SCALE);
    scene.position.set(0.6, 0, 0.3);
    mover.add(scene);

    mixer = new AnimationMixer(scene);
    const clip = animations.find((c) => c.name === "emote-yes") ?? animations.find((c) => c.name === "idle");
    if (clip) {
      waveAction = mixer.clipAction(clip);
      waveAction.play();
    }
  });

  const environment = buildRunway();

  return {
    mover,
    environment,
    background: 0x7fc4e8,
    update(delta) {
      mixer?.update(delta);
    },
  };
}

function buildRunway(): THREE.Group {
  const group = new THREE.Group();
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x4f5760, roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
  for (let x = -24; x <= 24; x += 3) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.2), stripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.012, 0);
    group.add(stripe);
  }

  const towerMat = new THREE.MeshStandardMaterial({ color: 0xd7dde3, roughness: 0.6 });
  roundedBox(group, 1.1, 3.2, 1.1, 8, 1.6, -5, towerMat, 0.06);
  roundedBox(group, 1.6, 0.6, 1.6, 8, 3.4, -5, towerMat, 0.06);

  return group;
}
