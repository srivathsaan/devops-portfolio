import * as THREE from "three";
import { box, roundedBox, tube, spokedWheel } from "./helpers";
import { buildRider } from "./build-figure";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 1 — the kid riding a cycle, representing undergrad (B.Tech). */
export function buildCycleRig(): Rig {
  const mover = new THREE.Group();
  mover.position.x = REST_X;

  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1b1e26, roughness: 0.75 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xaab0b8, roughness: 0.4, metalness: 0.4 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.4, metalness: 0.15 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.6 });
  const gripMat = new THREE.MeshStandardMaterial({ color: 0x14161b, roughness: 0.55 });

  const rearWheel = spokedWheel(mover, 0.42, 0.065, -0.52, 0.42, 0, tireMat, hubMat, 6);
  const frontWheel = spokedWheel(mover, 0.42, 0.065, 0.52, 0.42, 0, tireMat, hubMat, 6);

  tube(
    mover,
    [
      [-0.52, 0.42, 0],
      [-0.08, 0.88, 0],
      [0.28, 0.92, 0],
      [0.52, 0.42, 0],
    ],
    0.042,
    frameMat
  );
  tube(
    mover,
    [
      [-0.08, 0.88, 0],
      [-0.14, 1.12, 0],
    ],
    0.042,
    frameMat
  );
  roundedBox(mover, 0.22, 0.09, 0.13, -0.15, 1.17, 0, seatMat, 0.035);
  tube(
    mover,
    [
      [0.48, 0.52, 0],
      [0.4, 1.0, 0],
    ],
    0.038,
    frameMat
  );
  roundedBox(mover, 0.3, 0.045, 0.045, 0.4, 1.01, 0, gripMat, 0.02);

  const crank = new THREE.Group();
  crank.position.set(-0.1, 0.42, 0);
  mover.add(crank);
  box(crank, 0.22, 0.04, 0.04, 0.1, 0, 0.12, frameMat);
  box(crank, 0.22, 0.04, 0.04, -0.1, 0, -0.12, frameMat);
  roundedBox(crank, 0.1, 0.02, 0.14, 0.19, 0, 0.12, gripMat, 0.008);
  roundedBox(crank, 0.1, 0.02, 0.14, -0.19, 0, -0.12, gripMat, 0.008);

  const rider = buildRider(mover, {
    skin: 0xe8b589,
    hair: 0x2b2017,
    shirt: 0x2f6fed,
    shirtTrim: 0x1d4fc4,
    pants: 0x27314a,
    shoes: 0xf4f1ea,
  });
  rider.group.position.set(-0.03, 0.97, 0);
  rider.frontArm.rotation.z = 0.55;
  rider.backArm.rotation.z = 0.4;
  rider.frontLeg.rotation.z = 0.25;
  rider.backLeg.rotation.z = -0.15;

  const environment = buildCampusGround();

  return {
    mover,
    environment,
    background: 0xbfe3f2,
    update(delta, riding) {
      const speed = riding ? 11 : 2.6;
      rearWheel.rotation.z -= delta * speed;
      frontWheel.rotation.z -= delta * speed;
      crank.rotation.z -= delta * speed;
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
