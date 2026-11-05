import * as THREE from "three";
import { cloneModel, enableShadows } from "./load-gltf";
import { roundedBox } from "./helpers";

/** A circular ground footprint the character can't walk through. */
export type Collider = { x: number; z: number; radius: number };

const ZONE_WIDTH = 20;
const GROUND_DEPTH = 22; // z -11..11

function groundSegment(
  group: THREE.Group,
  xCenter: number,
  color: number,
  y = 0
): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  // Exactly ZONE_WIDTH, not wider: adjacent zones are centered ZONE_WIDTH apart, so any
  // extra width here makes neighboring ground planes overlap at the same y — two coplanar
  // surfaces z-fighting, which renders as a flickering/glitching line at each zone seam.
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(ZONE_WIDTH, GROUND_DEPTH), mat);
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

function tree(
  group: THREE.Group,
  colliders: Collider[],
  x: number,
  z: number,
  scale: number,
  rotation: number,
  kind: "tree" | "tree-high"
) {
  colliders.push({ x, z, radius: (kind === "tree-high" ? 0.45 : 0.6) * scale });
  cloneModel(`/models/forest/${kind}.glb`).then((model) => {
    enableShadows(model);
    model.scale.setScalar(scale);
    model.rotation.y = rotation;
    model.position.set(x, 0, z);
    group.add(model);
  });
}

function rock(group: THREE.Group, colliders: Collider[], x: number, z: number, scale: number) {
  colliders.push({ x, z, radius: 0.55 * scale });
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

/**
 * Modern glass-and-steel office block for the Bounteous tech-park campus — flat roof,
 * blue-tinted curtain-wall glass with dark spandrel bands marking each floor, plus a
 * couple of rooftop mechanical units. Stands in for the generic city skyscraper models,
 * which read as dense downtown high-rises rather than a business-park campus.
 */
function techParkBuilding(
  group: THREE.Group,
  colliders: Collider[],
  x: number,
  z: number,
  width: number,
  height: number,
  depth: number
) {
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x6fa8c9, roughness: 0.2, metalness: 0.4 });
  const mullionMat = new THREE.MeshStandardMaterial({ color: 0x2f333a, roughness: 0.6 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xb7bec7, roughness: 0.75 });

  roundedBox(group, width, height, depth, x, height / 2, z, glassMat, 0.04);
  colliders.push({ x, z, radius: Math.max(width, depth) / 2 + 0.3 });

  const FLOOR_HEIGHT = 0.5;
  for (let fy = FLOOR_HEIGHT; fy < height; fy += FLOOR_HEIGHT) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.06, depth + 0.04), mullionMat);
    band.position.set(x, fy, z);
    group.add(band);
  }

  const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 1.05, 0.1, depth * 1.05), roofMat);
  roof.position.set(x, height + 0.05, z);
  roof.castShadow = true;
  group.add(roof);

  for (const dx of [-width * 0.25, width * 0.2]) {
    const unit = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 0.4), roofMat);
    unit.position.set(x + dx, height + 0.24, z);
    group.add(unit);
  }
}

/** Builds the whole walkable world once: ground, zone scenery, and the parked vehicles. */
export function buildWorld(): { group: THREE.Group; colliders: Collider[]; bicycle: THREE.Group } {
  const world = new THREE.Group();
  const colliders: Collider[] = [];

  buildHomeZone(world, 0, colliders);
  const bicycle = buildBtechZone(world, 20, colliders);
  buildBounteousZone(world, 40, colliders);
  buildNtuZone(world, 60, colliders);
  buildContactZone(world, 80, colliders);

  return { group: world, colliders, bicycle };
}

function buildHomeZone(world: THREE.Group, cx: number, colliders: Collider[]) {
  groundSegment(world, cx, 0x9fd6a0);
  tree(world, colliders, cx - 6.5, -2.4, 1.0, 0.6, "tree");
  tree(world, colliders, cx + 6.5, -2.6, 1.1, -0.8, "tree-high");
  tree(world, colliders, cx - 9.5, -1.6, 0.8, 2.0, "tree-high");
  tree(world, colliders, cx + 9, -1.8, 0.9, -1.4, "tree");
}

/**
 * Amrita Vishwa Vidyapeetham's Coimbatore campus entrance block — a white, colonnaded
 * central building topped with a red hip roof, flanked by two symmetric orange-trimmed
 * wings, after the real campus's main building.
 */
function amritaBuilding(group: THREE.Group, colliders: Collider[], bx: number, bz: number) {
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf3ead9, roughness: 0.85 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xd98a3d, roughness: 0.7 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xaa4a2a, roughness: 0.8 });
  const columnMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });

  // Central entrance block, topped with a hip roof (a 4-sided cone stretched over its footprint).
  roundedBox(group, 5, 2.6, 2, bx, 1.3, bz, wallMat, 0.1);
  colliders.push({ x: bx, z: bz, radius: 2.6 });

  const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 1.1, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(2.9, 1, 1.5);
  roof.position.set(bx, 2.6 + 0.55, bz);
  roof.castShadow = true;
  group.add(roof);

  for (const dx of [-0.9, 0.9]) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.8, 8), columnMat);
    column.position.set(bx + dx, 0.9, bz + 1.05);
    column.castShadow = true;
    group.add(column);
  }

  // Symmetric wings, overlapping the central block's edges so they read as one structure.
  for (const side of [-1, 1]) {
    const wx = bx + side * 4.0;
    roundedBox(group, 3.6, 2.2, 2, wx, 1.1, bz, wallMat, 0.08);
    colliders.push({ x: wx, z: bz, radius: 2.1 });

    for (const by of [0.55, 1.35]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.12, 2.05), trimMat);
      band.position.set(wx, by, bz);
      group.add(band);
    }
  }
}

function buildBtechZone(world: THREE.Group, cx: number, colliders: Collider[]): THREE.Group {
  groundSegment(world, cx, 0x8fd17a);

  const pathMat = new THREE.MeshStandardMaterial({ color: 0xd8cdb0, roughness: 0.95 });
  const path = new THREE.Mesh(new THREE.PlaneGeometry(ZONE_WIDTH + 0.1, 2.2), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(cx, 0.01, 0);
  path.receiveShadow = true;
  world.add(path);

  amritaBuilding(world, colliders, cx + 2, -5.5);
  campusSign(world, cx + 2, -4.47);

  tree(world, colliders, cx - 7, -2.6, 1.1, 0.3, "tree");
  tree(world, colliders, cx - 2.5, -2.8, 0.95, -0.4, "tree-high");
  tree(world, colliders, cx + 4, -2.5, 1.15, 0.5, "tree");
  tree(world, colliders, cx + 8.5, -2.7, 1.0, -0.2, "tree-high");
  rock(world, colliders, cx - 4.5, -1.6, 0.6);
  rock(world, colliders, cx + 6.2, -1.4, 0.5);
  plant(world, cx - 1, 1.4, 1.4);
  plant(world, cx + 2.5, 1.5, 1.2);
  plant(world, cx - 5.5, 1.3, 1.6);

  colliders.push({ x: cx - 0.5, z: 2.4, radius: 0.5 });
  // Wrapped in a stable mount group (rather than adding the loaded model straight to
  // `world`) so the character controller can reposition/rotate it to ride, regardless of
  // whether the async GLB load has resolved yet.
  const bicycle = new THREE.Group();
  bicycle.position.set(cx - 0.5, 0, 2.4);
  world.add(bicycle);
  cloneModel("/models/bicycle.glb").then((bike) => {
    enableShadows(bike);
    bike.scale.setScalar(0.45);
    bike.rotation.y = Math.PI * 0.12;
    bicycle.add(bike);
  });
  return bicycle;
}

function buildBounteousZone(world: THREE.Group, cx: number, colliders: Collider[]) {
  groundSegment(world, cx, 0x4a4f58);
  stripes(world, cx - 9, cx + 9, 0xf4d35e, [1.2, 0.18]);

  // Three glass office blocks of varying scale, like a real tech park's campus — a main
  // building plus two smaller satellite blocks — rather than a row of identical towers.
  const mainX = cx - 5;
  const mainZ = -7.5;
  techParkBuilding(world, colliders, mainX, mainZ, 6, 4.2, 3);
  techParkBuilding(world, colliders, cx + 2, -6.5, 4.5, 3, 2.6);
  techParkBuilding(world, colliders, cx + 8, -7, 3.5, 2.4, 2.4);

  // Flat entrance canopy on the main block, facing the walking path.
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xe9edf0, roughness: 0.5, metalness: 0.2 });
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 1.1), canopyMat);
  canopy.position.set(mainX, 1.1, mainZ + 1.5 + 0.55);
  canopy.castShadow = true;
  world.add(canopy);
  for (const dx of [-1.3, 1.3]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 8), canopyMat);
    pillar.position.set(mainX + dx, 0.55, mainZ + 1.5 + 1.0);
    pillar.castShadow = true;
    world.add(pillar);
  }

  // Landscaping along the path, so the lot reads as a campus rather than a bare parking lot.
  tree(world, colliders, cx - 8.5, -1.8, 0.9, 0.4, "tree");
  tree(world, colliders, cx + 9, -1.6, 0.95, -0.5, "tree-high");
  plant(world, cx - 2, 1.6, 1.3);
  plant(world, cx + 4, 1.5, 1.2);

  colliders.push({ x: cx - 0.5, z: 2.8, radius: 0.6 });
  cloneModel("/models/motorcycle.glb").then((bike) => {
    enableShadows(bike);
    bike.scale.setScalar(0.015);
    bike.rotation.y = Math.PI * 0.12;
    bike.position.set(cx - 0.5, 0, 2.8);
    world.add(bike);
  });
}

/**
 * NTU's "The Hive" (UOB Innovation Hub) — a cluster of ribbed cylindrical towers of varied
 * height on a low podium, with rooftop greenery, after the real building's bunched-silo look.
 */
function theHive(group: THREE.Group, colliders: Collider[], x: number, z: number) {
  const podiumMat = new THREE.MeshStandardMaterial({ color: 0x8a8378, roughness: 0.85 });
  roundedBox(group, 6.4, 0.6, 4.6, x, 0.3, z - 0.5, podiumMat, 0.08);
  const BASE_Y = 0.6; // towers rise from the podium top

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcdb08a, roughness: 0.85 });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.75 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x4f7942, roughness: 1 });
  const segments = 10; // low radial segment count keeps it faceted, matching the scene's low-poly look

  // Each tower: [offsetX, offsetZ, radius, height] — clustered and height-varied so the
  // roofline reads jagged like the real building's bunched towers, not one uniform block.
  const towers: Array<[dx: number, dz: number, radius: number, height: number]> = [
    [0, 0, 1.3, 5.2],
    [1.7, 0.3, 1.1, 4.0],
    [-1.6, 0.5, 1.15, 4.6],
    [0.6, -1.5, 1.0, 3.6],
    [-0.9, -1.4, 1.15, 4.3],
    [2.1, -0.9, 0.9, 3.0],
    [-2.2, -0.5, 0.95, 3.4],
  ];

  towers.forEach(([dx, dz, radius, height], i) => {
    const tx = x + dx;
    const tz = z + dz;
    const bottomRadius = radius * 0.55; // narrows hard toward the base, like the real stacked drums

    // Build the tower as discrete stacked drums with a constant radius each, stepping down
    // from top to bottom, instead of one smoothly-tapered cone — matching the real building's
    // distinct stacked-ring silhouette where each ring is its own cylinder.
    const STEP_HEIGHT = 0.9;
    const steps = Math.max(3, Math.round(height / STEP_HEIGHT));
    const stepHeight = height / steps;
    const RIB_GAP = 0.3;

    for (let s = 0; s < steps; s++) {
      const stepRadius = THREE.MathUtils.lerp(radius, bottomRadius, steps === 1 ? 0 : s / (steps - 1));
      const topY = BASE_Y + height - stepHeight * s;
      const centerY = topY - stepHeight / 2;

      const drum = new THREE.Mesh(
        new THREE.CylinderGeometry(stepRadius, stepRadius, stepHeight * 0.94, segments),
        bodyMat
      );
      drum.position.set(tx, centerY, tz);
      drum.castShadow = true;
      drum.receiveShadow = true;
      group.add(drum);

      // Fine horizontal ribbing within this drum, reading as the facade's corrugated bands.
      for (let ry = RIB_GAP; ry < stepHeight; ry += RIB_GAP) {
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(stepRadius + 0.03, stepRadius + 0.03, 0.05, segments),
          bandMat
        );
        band.position.set(tx, topY - stepHeight + ry, tz);
        group.add(band);
      }

      // Rim marking the step-down to the drum below (or the podium, for the last step).
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(stepRadius + 0.04, stepRadius + 0.04, 0.06, segments),
        bandMat
      );
      rim.position.set(tx, topY - stepHeight, tz);
      group.add(rim);
    }

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.88, radius * 0.88, 0.12, segments),
      bandMat
    );
    cap.position.set(tx, BASE_Y + height, tz);
    group.add(cap);

    // Rooftop planting on alternating towers, like the real building's sky gardens.
    if (i % 2 === 0) {
      const cluster = new THREE.Group();
      cluster.position.set(tx, BASE_Y + height + 0.1, tz);
      group.add(cluster);
      for (let j = 0; j < 5; j++) {
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(radius * (0.3 + Math.random() * 0.25), 8, 6),
          foliageMat
        );
        const angle = (j / 5) * Math.PI * 2;
        leaf.position.set(Math.cos(angle) * radius * 0.5, Math.random() * 0.25, Math.sin(angle) * radius * 0.5);
        cluster.add(leaf);
      }
    }

    colliders.push({ x: tx, z: tz, radius: radius + 0.15 });
  });
}

function buildNtuZone(world: THREE.Group, cx: number, colliders: Collider[]) {
  groundSegment(world, cx, 0x7a98a8);
  stripes(world, cx - 9, cx + 9, 0xffffff, [1.4, 0.2]);

  theHive(world, colliders, cx - 3, -6);

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

function buildContactZone(world: THREE.Group, cx: number, colliders: Collider[]) {
  groundSegment(world, cx, 0x6b7280);
  stripes(world, cx - 9, cx + 9, 0xffffff, [1.4, 0.2]);

  const towerMat = new THREE.MeshStandardMaterial({ color: 0xd7dde3, roughness: 0.6 });
  roundedBox(world, 1.1, 3.2, 1.1, cx + 8, 1.6, -5, towerMat, 0.06);
  roundedBox(world, 1.6, 0.6, 1.6, cx + 8, 3.4, -5, towerMat, 0.06);
  colliders.push({ x: cx + 8, z: -5, radius: 0.9 });

  const postMat = new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.8 });
  const signMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.4 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.6, 8), postMat);
  post.position.set(cx - 2, 0.8, 2.5);
  post.castShadow = true;
  world.add(post);
  roundedBox(world, 0.9, 0.5, 0.06, cx - 2, 1.5, 2.53, signMat, 0.04);
  colliders.push({ x: cx - 2, z: 2.5, radius: 0.15 });
}
