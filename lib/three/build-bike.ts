import * as THREE from "three";
import { roundedBox, ball, cyl, spokedWheel } from "./helpers";
import { buildRider } from "./build-figure";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 2 — the kid riding a motorbike, representing the Bounteous CloudOps years. */
export function buildBikeRig(): Rig {
  const mover = new THREE.Group();
  mover.position.x = REST_X;

  const tireMat = new THREE.MeshStandardMaterial({ color: 0x15171d, roughness: 0.7 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xb9bec4, roughness: 0.35, metalness: 0.5 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1baf7a, roughness: 0.3, metalness: 0.25 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x0f1a16, roughness: 0.4, metalness: 0.3 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x20242e, roughness: 0.55 });
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfff3d0,
    emissive: 0xffdf8a,
    emissiveIntensity: 1.1,
  });
  const exhaustMat = new THREE.MeshStandardMaterial({ color: 0xc7ccd1, roughness: 0.3, metalness: 0.7 });

  const rearWheel = spokedWheel(mover, 0.48, 0.1, -0.62, 0.48, 0, tireMat, hubMat, 7);
  const frontWheel = spokedWheel(mover, 0.48, 0.1, 0.62, 0.48, 0, tireMat, hubMat, 7);

  // Slim frame + tank (one slender body, not a thick stack) with the seat clearly on top.
  roundedBox(mover, 1.0, 0.15, 0.17, -0.06, 0.66, 0, bodyMat, 0.06);
  roundedBox(mover, 0.3, 0.13, 0.2, -0.3, 0.78, 0, bodyMat, 0.06);
  roundedBox(mover, 0.42, 0.08, 0.22, -0.4, 0.88, 0, seatMat, 0.035);
  ball(mover, 0.1, 0.58, 0.72, 0, headlightMat, 12);
  roundedBox(mover, 0.045, 0.045, 0.38, 0.5, 0.86, 0, trimMat, 0.015);
  roundedBox(mover, 0.24, 0.035, 0.035, 0.5, 1.04, 0, trimMat, 0.015);
  ball(mover, 0.03, 0.46, 1.08, 0.17, trimMat, 10);
  cyl(mover, 0.025, 0.025, 0.36, -0.68, 0.52, 0.17, exhaustMat, 10);

  const rider = buildRider(mover, {
    skin: 0xe8b589,
    hair: 0x241a12,
    shirt: 0x1f2937,
    shirtTrim: 0x101722,
    pants: 0x27314a,
    shoes: 0x14161b,
  });
  rider.group.position.set(-0.32, 0.93, 0);
  rider.frontLeg.rotation.z = 0.55;
  rider.backLeg.rotation.z = 0.6;
  rider.frontArm.rotation.z = 0.75;
  rider.backArm.rotation.z = 0.6;

  const environment = buildCityGround();

  return {
    mover,
    environment,
    background: 0xaeb9c7,
    update(delta, riding) {
      const speed = riding ? 15 : 3.2;
      rearWheel.rotation.z -= delta * speed;
      frontWheel.rotation.z -= delta * speed;
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
