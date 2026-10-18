import * as THREE from "three";
import { box, ball, cyl } from "./helpers";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 4 — the plane landed in Singapore. Final scene: contact details overlay on top. */
export function buildContactRig(): Rig {
  const mover = new THREE.Group();
  mover.position.set(REST_X, 0, 0);

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.4, metalness: 0.1 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x1baf7a, roughness: 0.4 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x9fd7ff,
    emissive: 0x6fb8e8,
    emissiveIntensity: 0.4,
  });
  const propMat = new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.5 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x14161b, roughness: 0.6 });

  cyl(mover, 0.3, 0.3, 2.6, 0, 1.1, 0, bodyMat, 16).rotation.z = Math.PI / 2;
  ball(mover, 0.3, 1.3, 1.1, 0, bodyMat, 16);
  box(mover, 0.1, 0.06, 1.9, -0.3, 1.12, 0, accentMat);
  box(mover, 2.1, 0.07, 0.55, -0.1, 1.1, 0, bodyMat);
  box(mover, 0.5, 0.5, 0.07, -1.05, 1.45, 0, bodyMat);

  for (let i = -3; i <= 3; i++) {
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.09, 10), windowMat);
    win.position.set(i * 0.28, 1.18, 0.3);
    win.rotation.y = Math.PI / 2;
    mover.add(win);
  }

  const propeller = new THREE.Group();
  propeller.position.set(1.58, 1.1, 0);
  mover.add(propeller);
  box(propeller, 0.05, 0.42, 0.05, 0, 0, 0, propMat);
  box(propeller, 0.05, 0.05, 0.42, 0, 0, 0, propMat);

  for (const x of [-0.6, 0.9]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 8, 16), wheelMat);
    wheel.position.set(x, 0.78, 0);
    mover.add(wheel);
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
  const tower = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.2, 1.1), towerMat);
  tower.position.set(8, 1.6, -5);
  tower.castShadow = true;
  group.add(tower);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), towerMat);
  cab.position.set(8, 3.4, -5);
  group.add(cab);

  return group;
}
