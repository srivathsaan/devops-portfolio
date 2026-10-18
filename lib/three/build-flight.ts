import * as THREE from "three";
import { box, ball, cyl } from "./helpers";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 3 — a flight crossing the sky, representing the move to NTU Singapore. */
export function buildFlightRig(): Rig {
  const mover = new THREE.Group();
  mover.position.set(REST_X, 2.6, 0);

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.4, metalness: 0.1 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.4 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x9fd7ff,
    emissive: 0x6fb8e8,
    emissiveIntensity: 0.4,
  });
  const propMat = new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.5 });

  cyl(mover, 0.3, 0.3, 2.6, 0, 0, 0, bodyMat, 16).rotation.z = Math.PI / 2;
  ball(mover, 0.3, 1.3, 0, 0, bodyMat, 16);
  box(mover, 0.1, 0.06, 1.9, -0.3, 0.02, 0, accentMat);

  box(mover, 2.1, 0.07, 0.55, -0.1, 0, 0, bodyMat);
  box(mover, 0.5, 0.5, 0.07, -1.05, 0.35, 0, bodyMat);
  box(mover, 0.4, 0.07, 0.3, -1.1, 0.07, 0, bodyMat);

  for (let i = -3; i <= 3; i++) {
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.09, 10), windowMat);
    win.position.set(i * 0.28, 0.08, 0.3);
    win.rotation.y = Math.PI / 2;
    mover.add(win);
  }

  const propeller = new THREE.Group();
  propeller.position.set(1.58, 0, 0);
  mover.add(propeller);
  box(propeller, 0.05, 0.42, 0.05, 0, 0, 0, propMat);
  box(propeller, 0.05, 0.05, 0.42, 0, 0, 0, propMat);
  ball(propeller, 0.07, 0, 0, 0, propMat, 10);

  const environment = buildSky();

  return {
    mover,
    environment,
    background: 0x6fb3e0,
    update(delta, riding) {
      propeller.rotation.x += delta * (riding ? 32 : 10);
      mover.position.y = 2.6 + Math.sin(performance.now() / 650) * 0.08;
    },
  };
}

function buildSky(): THREE.Group {
  const group = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  const puffs: Array<[number, number, number, number]> = [
    [-6, 1.2, -3, 0.9],
    [-2, 3.6, -4, 1.2],
    [3, 0.6, -2.5, 0.7],
    [6.5, 3.2, -5, 1.1],
    [-9, 4.0, -6, 1.0],
    [9, 1.6, -4, 0.8],
  ];
  for (const [x, y, z, r] of puffs) {
    const cluster = new THREE.Group();
    cluster.position.set(x, y, z);
    group.add(cluster);
    for (let i = 0; i < 4; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r * (0.6 + Math.random() * 0.5), 10, 8), cloudMat);
      puff.position.set((i - 1.5) * r * 0.6, Math.random() * r * 0.3, 0);
      cluster.add(puff);
    }
  }

  const sunMat = new THREE.MeshStandardMaterial({
    color: 0xfff3c4,
    emissive: 0xffe07a,
    emissiveIntensity: 0.8,
  });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), sunMat);
  sun.position.set(7, 5.5, -9);
  group.add(sun);

  return group;
}
