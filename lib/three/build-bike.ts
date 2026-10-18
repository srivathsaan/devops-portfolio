import * as THREE from "three";
import { box, ball, cyl } from "./helpers";
import type { Rig } from "./types";
import { REST_X } from "./animate-ride";

/** Scene 2 — the kid riding a motorbike, representing the Bounteous CloudOps years. */
export function buildBikeRig(): Rig {
  const mover = new THREE.Group();
  mover.position.x = REST_X;

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x14161b, roughness: 0.55 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1baf7a, roughness: 0.35, metalness: 0.2 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x20242e, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8b589, roughness: 0.75 });
  const jacketMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x27314a, roughness: 0.6 });
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfff3d0,
    emissive: 0xffdf8a,
    emissiveIntensity: 1.1,
  });

  const wheelGeo = new THREE.TorusGeometry(0.48, 0.1, 10, 20);
  const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
  rearWheel.position.set(-0.62, 0.48, 0);
  rearWheel.castShadow = true;
  mover.add(rearWheel);
  const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontWheel.position.set(0.62, 0.48, 0);
  frontWheel.castShadow = true;
  mover.add(frontWheel);

  box(mover, 1.15, 0.26, 0.3, -0.02, 0.78, 0, bodyMat);
  box(mover, 0.44, 0.14, 0.26, -0.38, 0.98, 0, seatMat);
  ball(mover, 0.11, 0.64, 0.8, 0, headlightMat, 12);
  cyl(mover, 0.03, 0.03, 0.42, 0.56, 0.98, 0, bodyMat);
  box(mover, 0.26, 0.04, 0.04, 0.56, 1.16, 0, bodyMat);

  const rider = new THREE.Group();
  mover.add(rider);
  ball(rider, 0.18, -0.3, 1.62, 0, skinMat);
  box(rider, 0.27, 0.42, 0.21, -0.3, 1.26, 0, jacketMat);
  cyl(rider, 0.06, 0.06, 0.4, -0.12, 0.85, 0.1, pantsMat);
  cyl(rider, 0.06, 0.06, 0.4, -0.12, 0.85, -0.1, pantsMat);
  cyl(rider, 0.045, 0.045, 0.3, 0.2, 1.08, 0, jacketMat);

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
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, h, 2), buildingMat);
    b.position.set(x, h / 2, -6);
    b.castShadow = true;
    group.add(b);
    for (let row = 0; row < Math.floor(h); row++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3), windowMat);
      win.position.set(x, 0.6 + row * 0.7, -4.99);
      group.add(win);
    }
  });

  return group;
}
