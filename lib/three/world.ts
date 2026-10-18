import * as THREE from "three";
import { cloneModel, enableShadows } from "./load-gltf";
import { roundedBox } from "./helpers";

const ZONE_WIDTH = 20;
const GROUND_DEPTH = 22; // z -11..11

function groundSegment(
  group: THREE.Group,
  xCenter: number,
  color: number,
  y = 0
): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(ZONE_WIDTH + 0.1, GROUND_DEPTH), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(xCenter, y, 0);
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function stripes(
  group: THREE.Group,
  xStart: number,
  xEnd: number,
  color: number,
  size: [number, number]
) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
  for (let x = xStart; x <= xEnd; x += 3) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), mat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.012, 0);
    group.add(stripe);
  }
}

function tree(group: THREE.Group, x: number, z: number, scale: number, rotation: number, kind: "tree" | "tree-high") {
  cloneModel(`/models/forest/${kind}.glb`).then((model) => {
    enableShadows(model);
    model.scale.setScalar(scale);
    model.rotation.y = rotation;
    model.position.set(x, 0, z);
    group.add(model);
  });
}

function rock(group: THREE.Group, x: number, z: number, scale: number) {
  cloneModel("/models/forest/rocks-low.glb").then((model) => {
    enableShadows(model);
    model.scale.setScalar(scale);
    model.position.set(x, 0, z);
    group.add(model);
  });
}

function plant(group: THREE.Group, x: number, z: number, scale: number) {
  cloneModel("/models/forest/plant.glb").then((model) => {
    enableShadows(model);
    model.scale.setScalar(scale);
    model.position.set(x, 0, z);
    group.add(model);
  });
}

/** University wordmark sign mounted flush on the B.Tech building's front wall. */
function campusSign(group: THREE.Group, x: number, z: number) {
  const aspect = 1280 / 289;
  const width = 3.4;
  const logoTexture = new THREE.TextureLoader().load("/images/amrita-logo.png");
  logoTexture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({
    map: logoTexture,
    transparent: true,
    roughness: 0.6,
    metalness: 0,
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(width, width / aspect), mat);
  sign.position.set(x, 1.75, z);
  group.add(sign);
}

function building(group: THREE.Group, x: number, z: number, scale: number, variant: string) {
  cloneModel(`/models/city/building-skyscraper-${variant}.glb`).then((model) => {
    enableShadows(model);
    model.scale.setScalar(scale);
    model.position.set(x, 0, z);
    group.add(model);
  });
}

/** Builds the whole walkable world once: ground, zone scenery, and the parked vehicles. */
export function buildWorld(): THREE.Group {
  const world = new THREE.Group();

  buildHomeZone(world, 0);
  buildBtechZone(world, 20);
  buildBounteousZone(world, 40);
  buildNtuZone(world, 60);
  buildContactZone(world, 80);

  return world;
}

function buildHomeZone(world: THREE.Group, cx: number) {
  groundSegment(world, cx, 0x9fd6a0);
  tree(world, cx - 6.5, -2.4, 1.0, 0.6, "tree");
  tree(world, cx + 6.5, -2.6, 1.1, -0.8, "tree-high");
  tree(world, cx - 9.5, -1.6, 0.8, 2.0, "tree-high");
  tree(world, cx + 9, -1.8, 0.9, -1.4, "tree");
}

function buildBtechZone(world: THREE.Group, cx: number) {
  groundSegment(world, cx, 0x8fd17a);

  const pathMat = new THREE.MeshStandardMaterial({ color: 0xd8cdb0, roughness: 0.95 });
  const path = new THREE.Mesh(new THREE.PlaneGeometry(ZONE_WIDTH + 0.1, 2.2), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(cx, 0.01, 0);
  path.receiveShadow = true;
  world.add(path);

  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xe7ded0, roughness: 0.85 });
  roundedBox(world, 5, 2.6, 2, cx + 2, 1.3, -5.5, buildingMat, 0.1);
  campusSign(world, cx + 2, -4.47);

  tree(world, cx - 7, -2.6, 1.1, 0.3, "tree");
  tree(world, cx - 2.5, -2.8, 0.95, -0.4, "tree-high");
  tree(world, cx + 4, -2.5, 1.15, 0.5, "tree");
  tree(world, cx + 8.5, -2.7, 1.0, -0.2, "tree-high");
  rock(world, cx - 4.5, -1.6, 0.6);
  rock(world, cx + 6.2, -1.4, 0.5);
  plant(world, cx - 1, 1.4, 1.4);
  plant(world, cx + 2.5, 1.5, 1.2);
  plant(world, cx - 5.5, 1.3, 1.6);

  cloneModel("/models/bicycle.glb").then((bike) => {
    enableShadows(bike);
    bike.scale.setScalar(0.45);
    bike.rotation.y = Math.PI * 0.12;
    bike.position.set(cx - 0.5, 0, 2.4);
    world.add(bike);
  });
}

function buildBounteousZone(world: THREE.Group, cx: number) {
  groundSegment(world, cx, 0x4a4f58);
  stripes(world, cx - 9, cx + 9, 0xf4d35e, [1.2, 0.18]);

  const variants = ["a", "b", "c", "d", "e"];
  const spots: Array<[number, number, number]> = [
    [-8.5, 1.1, -7],
    [-4, 0.95, -6],
    [1, 1.35, -7.2],
    [6, 1.05, -6.3],
    [10.5, 0.9, -7.5],
  ];
  spots.forEach(([dx, scale, z], i) => building(world, cx + dx, z, scale, variants[i]));

  cloneModel("/models/motorcycle.glb").then((bike) => {
    enableShadows(bike);
    bike.scale.setScalar(0.015);
    bike.rotation.y = Math.PI * 0.12;
    bike.position.set(cx - 0.5, 0, 2.8);
    world.add(bike);
  });
}

function buildNtuZone(world: THREE.Group, cx: number) {
  groundSegment(world, cx, 0x7a98a8);
  stripes(world, cx - 9, cx + 9, 0xffffff, [1.4, 0.2]);

  cloneModel("/models/airplane.glb").then((plane) => {
    enableShadows(plane);
    plane.scale.setScalar(0.011);
    plane.rotation.y = Math.PI / 2;
    plane.position.set(cx, 0.78, -2);
    world.add(plane);
  });

  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  const puffs: Array<[number, number, number, number]> = [
    [cx - 7, 6.5, -4, 1.0],
    [cx + 6, 7.2, -5, 1.2],
    [cx - 2, 8.0, -6, 0.9],
  ];
  for (const [x, y, z, r] of puffs) {
    const cluster = new THREE.Group();
    cluster.position.set(x, y, z);
    world.add(cluster);
    for (let i = 0; i < 4; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(r * (0.6 + Math.random() * 0.5), 10, 8),
        cloudMat
      );
      puff.position.set((i - 1.5) * r * 0.6, Math.random() * r * 0.3, 0);
      cluster.add(puff);
    }
  }
}

function buildContactZone(world: THREE.Group, cx: number) {
  groundSegment(world, cx, 0x6b7280);
  stripes(world, cx - 9, cx + 9, 0xffffff, [1.4, 0.2]);

  const towerMat = new THREE.MeshStandardMaterial({ color: 0xd7dde3, roughness: 0.6 });
  roundedBox(world, 1.1, 3.2, 1.1, cx + 8, 1.6, -5, towerMat, 0.06);
  roundedBox(world, 1.6, 0.6, 1.6, cx + 8, 3.4, -5, towerMat, 0.06);

  const postMat = new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.8 });
  const signMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.4 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.6, 8), postMat);
  post.position.set(cx - 2, 0.8, 2.5);
  post.castShadow = true;
  world.add(post);
  roundedBox(world, 0.9, 0.5, 0.06, cx - 2, 1.5, 2.53, signMat, 0.04);
}
