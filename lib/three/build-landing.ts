import * as THREE from "three";
import { buildRider } from "./build-figure";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 0 — a simple standing figure. Intentionally sparse: this is the title card. */
export function buildLandingRig(): Rig {
  const mover = new THREE.Group();
  mover.position.x = REST_X;

  const rider = buildRider(mover, {
    skin: 0xe8b589,
    hair: 0x2b2017,
    shirt: 0xff7a1a,
    shirtTrim: 0xe8650a,
    pants: 0x27314a,
    shoes: 0x1c222e,
  });
  rider.group.position.set(0, 0.73, 0);
  rider.frontLeg.position.set(0.06, -0.01, 0);
  rider.backLeg.position.set(-0.06, -0.01, 0);
  rider.frontArm.position.set(0.15, 0.33, 0);
  rider.backArm.position.set(-0.15, 0.33, 0);
  rider.backArm.rotation.z = 0.15;

  const environment = buildPlainGround();

  return {
    mover,
    environment,
    background: 0xbfe3f2,
    update() {
      rider.group.rotation.y = Math.sin(performance.now() / 900) * 0.12;
      rider.frontArm.rotation.z = Math.sin(performance.now() / 350) * 0.4 - 0.5;
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
