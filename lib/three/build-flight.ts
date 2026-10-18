import * as THREE from "three";
import { roundedBox, ball, cyl } from "./helpers";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 3 — a flight crossing the sky, representing the move to NTU Singapore. */
export function buildFlightRig(): Rig {
  const mover = new THREE.Group();
  mover.position.set(REST_X, 2.6, 0);

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.35, metalness: 0.15 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.4 });
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

  cyl(mover, 0.3, 0.3, 2.6, 0, 0, 0, bodyMat, 16).rotation.z = Math.PI / 2;
  ball(mover, 0.3, 1.3, 0, 0, bodyMat, 16);
  roundedBox(mover, 0.28, 0.2, 0.46, 1.08, 0.08, 0, cockpitMat, 0.06);
  roundedBox(mover, 0.1, 0.06, 1.9, -0.3, 0.02, 0, accentMat, 0.025);

  roundedBox(mover, 2.1, 0.07, 0.55, -0.1, 0, 0, bodyMat, 0.03);
  roundedBox(mover, 0.5, 0.5, 0.07, -1.05, 0.35, 0, accentMat, 0.04);
  roundedBox(mover, 0.42, 0.07, 0.32, -1.1, 0.07, 0, accentMat, 0.025);

  for (let i = -3; i <= 3; i++) {
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.09, 12), windowMat);
    win.position.set(i * 0.28, 0.08, 0.3);
    win.rotation.y = Math.PI / 2;
    mover.add(win);
  }

  const propeller = new THREE.Group();
  propeller.position.set(1.58, 0, 0);
  mover.add(propeller);
  roundedBox(propeller, 0.07, 0.44, 0.03, 0, 0, 0, propMat, 0.03);
  roundedBox(propeller, 0.07, 0.03, 0.44, 0, 0, 0, propMat, 0.03);
  cyl(propeller, 0.08, 0.08, 0.08, 0, 0, 0, propHubMat, 12).rotation.x = Math.PI / 2;

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
    [-3.2, 4.6, -6, 1.2],
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
