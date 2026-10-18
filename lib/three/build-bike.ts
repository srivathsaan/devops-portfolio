import * as THREE from "three";
import { AnimationMixer, type AnimationAction } from "three";
import { cloneModel, loadModelWithAnimations, enableShadows } from "./load-gltf";
import { roundedBox } from "./helpers";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

const MOTORCYCLE_SCALE = 0.015;
const RIDER_SCALE = 1.3;

/** Scene 2 — the kid riding a motorbike, representing the Bounteous CloudOps years. */
export function buildBikeRig(): Rig {
  const mover = new THREE.Group();
  mover.position.x = REST_X;

  let mixer: AnimationMixer | null = null;
  let driveAction: AnimationAction | null = null;

  cloneModel("/models/motorcycle.glb").then((bike) => {
    enableShadows(bike);
    bike.scale.setScalar(MOTORCYCLE_SCALE);
    bike.rotation.y = Math.PI / 2;
    mover.add(bike);
  });

  loadModelWithAnimations("/models/character.glb").then(({ scene, animations }) => {
    enableShadows(scene);
    scene.scale.setScalar(RIDER_SCALE);
    scene.position.set(-0.18, 0.55, 0);
    mover.add(scene);

    mixer = new AnimationMixer(scene);
    const clip = animations.find((c) => c.name === "drive") ?? animations.find((c) => c.name === "sit");
    if (clip) {
      driveAction = mixer.clipAction(clip);
      driveAction.play();
    }
  });

  const environment = buildCityGround();

  return {
    mover,
    environment,
    background: 0xaeb9c7,
    update(delta) {
      mixer?.update(delta);
    },
  };
}

function buildCityGround(): THREE.Group {
  const group = new THREE.Group();
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x4a4f58, roughness: 0.95 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.receiveShadow = true;
  group.add(road);

  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf4d35e, roughness: 0.8 });
  for (let x = -24; x <= 24; x += 3) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.18), stripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.012, 0);
    group.add(stripe);
  }

  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x8995a6, roughness: 0.7 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xfff6cf,
    emissive: 0xffe9a6,
    emissiveIntensity: 0.6,
  });
  const heights = [2.2, 3.4, 2.7, 4.1, 2.9];
  heights.forEach((h, i) => {
    const x = -8 + i * 4.2;
    roundedBox(group, 2.2, h, 2, x, h / 2, -6, buildingMat, 0.08);
    for (let row = 0; row < Math.floor(h); row++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3), windowMat);
      win.position.set(x, 0.6 + row * 0.7, -4.99);
      group.add(win);
    }
  });

  return group;
}
