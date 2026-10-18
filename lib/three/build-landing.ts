import * as THREE from "three";
import { box, ball, cyl } from "./helpers";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 0 — a simple standing figure. Intentionally sparse: this is the title card. */
export function buildLandingRig(): Rig {
  const mover = new THREE.Group();
  mover.position.x = REST_X;

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8b589, roughness: 0.75 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.55 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x27314a, roughness: 0.6 });

  const figure = new THREE.Group();
  mover.add(figure);
  ball(figure, 0.19, 0, 1.55, 0, skinMat);
  box(figure, 0.3, 0.46, 0.22, 0, 1.15, 0, shirtMat);
  cyl(figure, 0.065, 0.065, 0.46, -0.1, 0.65, 0, pantsMat);
  cyl(figure, 0.065, 0.065, 0.46, 0.1, 0.65, 0, pantsMat);

  const armL = cyl(figure, 0.05, 0.05, 0.4, -0.22, 1.1, 0, shirtMat);
  const armR = cyl(figure, 0.05, 0.05, 0.4, 0.22, 1.1, 0, shirtMat);
  armL.position.set(-0.22, 1.1, 0);
  armR.position.set(0.22, 1.1, 0);

  const environment = buildPlainGround();

  return {
    mover,
    environment,
    background: 0xbfe3f2,
    update() {
      figure.rotation.y = Math.sin(performance.now() / 900) * 0.12;
      armR.rotation.z = Math.sin(performance.now() / 350) * 0.4 - 0.3;
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
  return group;
}
