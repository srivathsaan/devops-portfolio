import * as THREE from "three";
import { AnimationMixer, type AnimationAction } from "three";
import { cloneModel, loadModelWithAnimations, enableShadows } from "./load-gltf";
import { roundedBox } from "./helpers";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

const BIKE_SCALE = 0.45;
const RIDER_SCALE = 1.3;

/** Scene 1 — the kid riding a cycle, representing undergrad (B.Tech). */
export function buildCycleRig(): Rig {
  const mover = new THREE.Group();
  mover.position.x = REST_X;

  let mixer: AnimationMixer | null = null;
  let driveAction: AnimationAction | null = null;

  cloneModel("/models/bicycle.glb").then((bike) => {
    enableShadows(bike);
    bike.scale.setScalar(BIKE_SCALE);
    mover.add(bike);
  });

  loadModelWithAnimations("/models/character.glb").then(({ scene, animations }) => {
    enableShadows(scene);
    scene.scale.setScalar(RIDER_SCALE);
    scene.position.set(-0.12, 0.42, 0);
    mover.add(scene);

    mixer = new AnimationMixer(scene);
    const clip = animations.find((c) => c.name === "drive") ?? animations.find((c) => c.name === "sit");
    if (clip) {
      driveAction = mixer.clipAction(clip);
      driveAction.play();
    }
  });

  const environment = buildCampusGround();

  return {
    mover,
    environment,
    background: 0xbfe3f2,
    update(delta) {
      mixer?.update(delta);
    },
  };
}

function buildCampusGround(): THREE.Group {
  const group = new THREE.Group();
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x8fd17a, roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  group.add(ground);

  const pathMat = new THREE.MeshStandardMaterial({ color: 0xd8cdb0, roughness: 0.95 });
  const path = new THREE.Mesh(new THREE.PlaneGeometry(60, 2.2), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.01;
  path.receiveShadow = true;
  group.add(path);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.9 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f8f4a, roughness: 0.8 });
  for (const x of [-7, -2.5, 4, 8.5]) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 1.1, 8), trunkMat);
    trunk.position.set(x, 0.55, -2.6);
    trunk.castShadow = true;
    group.add(trunk);
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.3, 8), leafMat);
    leaves.position.set(x, 1.5, -2.6);
    leaves.castShadow = true;
    group.add(leaves);
  }

  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xe7ded0, roughness: 0.85 });
  roundedBox(group, 5, 2.6, 2, 2, 1.3, -5.5, buildingMat, 0.1);

  return group;
}
