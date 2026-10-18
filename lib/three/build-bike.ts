import * as THREE from "three";
import { AnimationMixer, type AnimationAction } from "three";
import { cloneModel, loadModelWithAnimations, enableShadows } from "./load-gltf";
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

  loadModelWithAnimations("/models/character/character.glb").then(({ scene, animations }) => {
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

  const variants = ["a", "b", "c", "d", "e", "c", "a"];
  const spots: Array<[number, number, number]> = [
    [-13, 0.95, -6.5],
    [-8.5, 1.35, -7],
    [-4, 1.0, -6],
    [1, 1.5, -7.2],
    [6, 1.1, -6.3],
    [10.5, 0.9, -7.5],
    [15, 1.25, -6.8],
  ];
  spots.forEach(([x, scale, z], i) => {
    cloneModel(`/models/city/building-skyscraper-${variants[i]}.glb`).then((building) => {
      enableShadows(building);
      building.scale.setScalar(scale);
      building.position.set(x, 0, z);
      group.add(building);
    });
  });

  return group;
}
