import * as THREE from "three";
import { AnimationMixer, type AnimationAction } from "three";
import { cloneModel, loadModelWithAnimations, enableShadows } from "./load-gltf";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 0 — the animated character standing idle. This is the title card. */
export function buildLandingRig(): Rig {
  const mover = new THREE.Group();
  mover.position.set(REST_X, 0, 0);

  let mixer: AnimationMixer | null = null;
  let idleAction: AnimationAction | null = null;

  loadModelWithAnimations("/models/character/character.glb").then(({ scene, animations }) => {
    enableShadows(scene);
    mover.add(scene);

    mixer = new AnimationMixer(scene);
    const idleClip = animations.find((clip) => clip.name === "idle");
    if (idleClip) {
      idleAction = mixer.clipAction(idleClip);
      idleAction.play();
    }
  });

  const environment = buildPlainGround();

  return {
    mover,
    environment,
    background: 0xbfe3f2,
    update(delta) {
      mixer?.update(delta);
    },
  };
}

function buildPlainGround(): THREE.Group {
  const group = new THREE.Group();
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x9fd6a0, roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  const treeSpots: Array<[number, number, number, number, "tree" | "tree-high"]> = [
    [-6.5, -2.4, 1.0, 0.6, "tree"],
    [6.5, -2.6, 1.1, -0.8, "tree-high"],
    [-10, -1.6, 0.8, 2.0, "tree-high"],
    [10, -1.8, 0.9, -1.4, "tree"],
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

  return group;
}
