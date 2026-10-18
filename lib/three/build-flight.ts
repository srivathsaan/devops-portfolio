import * as THREE from "three";
import { cloneModel, enableShadows } from "./load-gltf";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

const PLANE_SCALE = 0.011;

/** Scene 3 — a flight crossing the sky, representing the move to NTU Singapore. */
export function buildFlightRig(): Rig {
  const mover = new THREE.Group();
  mover.position.set(REST_X, 1.9, 0);

  cloneModel("/models/airplane.glb").then((plane) => {
    enableShadows(plane);
    plane.scale.setScalar(PLANE_SCALE);
    plane.rotation.y = Math.PI / 2;
    mover.add(plane);
  });

  const environment = buildSky();

  return {
    mover,
    environment,
    background: 0x6fb3e0,
    update() {
      mover.position.y = 1.9 + Math.sin(performance.now() / 650) * 0.08;
      mover.rotation.z = Math.sin(performance.now() / 1400) * 0.05;
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
