import * as THREE from "three";
import { roundedBox, ball, cyl, spokedWheel } from "./helpers";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 4 — the plane landed in Singapore. Final scene: contact details overlay on top. */
export function buildContactRig(): Rig {
  const mover = new THREE.Group();
  mover.position.set(REST_X, 0, 0);

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.35, metalness: 0.15 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x1baf7a, roughness: 0.4 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x9fd7ff,
    emissive: 0x6fb8e8,
    emissiveIntensity: 0.4,
  });
  const cockpitMat = new THREE.MeshStandardMaterial({
    color: 0x5fa8d8,
    roughness: 0.2,
    metalness: 0.3,
    emissive: 0x2a5e80,
    emissiveIntensity: 0.3,
  });
  const propHubMat = new THREE.MeshStandardMaterial({ color: 0x3a4049, roughness: 0.4, metalness: 0.4 });
  const propMat = new THREE.MeshStandardMaterial({ color: 0x1f232a, roughness: 0.35, metalness: 0.3 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x15171d, roughness: 0.7 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xb9bec4, roughness: 0.35, metalness: 0.5 });

  cyl(mover, 0.3, 0.3, 2.6, 0, 1.1, 0, bodyMat, 16).rotation.z = Math.PI / 2;
  ball(mover, 0.3, 1.3, 1.1, 0, bodyMat, 16);
  roundedBox(mover, 0.28, 0.2, 0.46, 1.08, 1.18, 0, cockpitMat, 0.06);
  roundedBox(mover, 0.1, 0.06, 1.9, -0.3, 1.12, 0, accentMat, 0.025);
  roundedBox(mover, 2.1, 0.07, 0.55, -0.1, 1.1, 0, bodyMat, 0.03);
  roundedBox(mover, 0.5, 0.5, 0.07, -1.05, 1.45, 0, accentMat, 0.04);
  roundedBox(mover, 0.42, 0.07, 0.32, -1.1, 1.17, 0, accentMat, 0.025);

  for (let i = -3; i <= 3; i++) {
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.09, 12), windowMat);
    win.position.set(i * 0.28, 1.18, 0.3);
    win.rotation.y = Math.PI / 2;
    mover.add(win);
  }

  const propeller = new THREE.Group();
  propeller.position.set(1.58, 1.1, 0);
  mover.add(propeller);
  roundedBox(propeller, 0.07, 0.44, 0.03, 0, 0, 0, propMat, 0.03);
  roundedBox(propeller, 0.07, 0.03, 0.44, 0, 0, 0, propMat, 0.03);
  cyl(propeller, 0.08, 0.08, 0.08, 0, 0, 0, propHubMat, 12).rotation.x = Math.PI / 2;

  for (const x of [-0.6, 0.9]) {
    spokedWheel(mover, 0.16, 0.05, x, 0.78, 0, tireMat, hubMat, 5);
  }

  const environment = buildRunway();

  return {
    mover,
    environment,
    background: 0x7fc4e8,
    update(delta, riding) {
      propeller.rotation.x += delta * (riding ? 28 : 3);
    },
  };
}

function buildRunway(): THREE.Group {
  const group = new THREE.Group();
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x4f5760, roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
  for (let x = -24; x <= 24; x += 3) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.2), stripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.012, 0);
    group.add(stripe);
  }

  const towerMat = new THREE.MeshStandardMaterial({ color: 0xd7dde3, roughness: 0.6 });
  roundedBox(group, 1.1, 3.2, 1.1, 8, 1.6, -5, towerMat, 0.06);
  roundedBox(group, 1.6, 0.6, 1.6, 8, 3.4, -5, towerMat, 0.06);

  return group;
}
