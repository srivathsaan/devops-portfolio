import * as THREE from "three";
import { box, ball, cyl, tube } from "./helpers";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 1 — the kid riding a cycle, representing undergrad (B.Tech). */
export function buildCycleRig(): Rig {
  const mover = new THREE.Group();
  mover.position.x = REST_X;

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x20242e, roughness: 0.6 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.45 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8b589, roughness: 0.75 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2f6fed, roughness: 0.6 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x27314a, roughness: 0.6 });

  const wheelGeo = new THREE.TorusGeometry(0.42, 0.065, 10, 20);
  const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
  rearWheel.position.set(-0.52, 0.42, 0);
  rearWheel.castShadow = true;
  mover.add(rearWheel);
  const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontWheel.position.set(0.52, 0.42, 0);
  frontWheel.castShadow = true;
  mover.add(frontWheel);

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
  box(mover, 0.2, 0.055, 0.1, -0.15, 1.16, 0, frameMat);
  tube(
    mover,
    [
      [0.48, 0.52, 0],
      [0.4, 1.0, 0],
    ],
    0.038,
    frameMat
  );
  box(mover, 0.28, 0.04, 0.04, 0.4, 1.01, 0, frameMat);

  const crank = new THREE.Group();
  crank.position.set(-0.1, 0.42, 0);
  mover.add(crank);
  box(crank, 0.24, 0.045, 0.045, 0.1, 0, 0.12, frameMat);
  box(crank, 0.24, 0.045, 0.045, -0.1, 0, -0.12, frameMat);

  const rider = new THREE.Group();
  mover.add(rider);
  ball(rider, 0.165, -0.03, 1.5, 0, skinMat);
  box(rider, 0.25, 0.38, 0.19, -0.03, 1.16, 0, shirtMat);
  cyl(rider, 0.055, 0.055, 0.38, -0.16, 0.82, 0.1, pantsMat);
  cyl(rider, 0.055, 0.055, 0.38, 0.1, 0.82, -0.05, pantsMat);
  cyl(rider, 0.042, 0.042, 0.33, 0.24, 1.0, 0, shirtMat);

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
  const building = new THREE.Mesh(new THREE.BoxGeometry(5, 2.6, 2), buildingMat);
  building.position.set(2, 1.3, -5.5);
  building.castShadow = true;
  group.add(building);

  return group;
}
