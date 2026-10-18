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

  loadModelWithAnimations("/models/character/character.glb").then(({ scene, animations }) => {
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

  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xe7ded0, roughness: 0.85 });
  roundedBox(group, 5, 2.6, 2, 2, 1.3, -5.5, buildingMat, 0.1);

  const treeSpots: Array<[number, number, number, number, "tree" | "tree-high"]> = [
    [-7, -2.6, 1.1, 0.3, "tree"],
    [-2.5, -2.8, 0.95, -0.4, "tree-high"],
    [4, -2.5, 1.15, 0.5, "tree"],
    [8.5, -2.7, 1.0, -0.2, "tree-high"],
    [-9.5, -1.8, 0.85, 1.1, "tree"],
    [10.5, -2.0, 1.05, 2.4, "tree-high"],
  ];
  for (const [x, z, scale, rotation, kind] of treeSpots) {
    cloneModel(`/models/forest/${kind}.glb`).then((tree) => {
      enableShadows(tree);
      tree.scale.setScalar(scale);
      tree.rotation.y = rotation;
      tree.position.set(x, 0, z);
      group.add(tree);
    });
  }

  const rockSpots: Array<[number, number, number]> = [
    [-4.5, -1.6, 0.6],
    [6.2, -1.4, 0.5],
  ];
  for (const [x, z, scale] of rockSpots) {
    cloneModel("/models/forest/rocks-low.glb").then((rock) => {
      enableShadows(rock);
      rock.scale.setScalar(scale);
      rock.position.set(x, 0, z);
      group.add(rock);
    });
  }

  const plantSpots: Array<[number, number, number]> = [
    [-1, 1.4, 1.4],
    [2.5, 1.5, 1.2],
    [-5.5, 1.3, 1.6],
  ];
  for (const [x, z, scale] of plantSpots) {
    cloneModel("/models/forest/plant.glb").then((plant) => {
      enableShadows(plant);
      plant.scale.setScalar(scale);
      plant.position.set(x, 0, z);
      group.add(plant);
    });
  }

  return group;
}
