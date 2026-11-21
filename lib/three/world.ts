import * as THREE from "three";
import { cloneModel, enableShadows } from "./load-gltf";
import { mergeStaticMeshes, roundedBox } from "./helpers";

/**
 * A ground footprint the character can't walk through — a circle (props: trees, rocks,
 * cylindrical towers) or an axis-aligned rectangle (box-shaped buildings, fitted to their
 * actual walls rather than an oversized bounding circle, so the character can walk right
 * up to a door instead of being blocked well short of it).
 */
export type Collider =
  | { x: number; z: number; radius: number }
  | { x: number; z: number; width: number; depth: number };

/**
 * A building entrance, tagged with the zone whose content it opens into. Most buildings
 * have a literal door, so `radius` is left at the default (tight) trigger distance; a
 * building with no door (e.g. a monumental cluster you can approach from any side) can
 * set a wider `radius` centered on the structure itself instead.
 */
export type Entrance = { x: number; z: number; zoneId: string; radius?: number };

const ZONE_WIDTH = 20;
const GROUND_DEPTH = 22; // z -11..11
const MEADOW_COLOR = 0x9fd6a0;

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
  const lane = new THREE.Group(); // merged into one mesh at the end of buildWorld
  group.add(lane);
  for (let x = xStart; x <= xEnd; x += 3) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), mat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.012, 0);
    lane.add(stripe);
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

/** A wooden post carrying a painted board with one short line of text, facing the path. */
function signpost(
  parent: THREE.Group,
  colliders: Collider[],
  x: number,
  z: number,
  text: string,
  boardColor: number,
  textColor: string
) {
  const group = new THREE.Group();
  parent.add(group);
  const BOARD_WIDTH = 1.5;
  const BOARD_HEIGHT = 0.5;
  const BOARD_Y = 1.5;

  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.07, 1.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.8 })
  );
  post.position.set(x, 0.8, z);
  post.castShadow = true;
  group.add(post);
  roundedBox(
    group,
    BOARD_WIDTH,
    BOARD_HEIGHT,
    0.06,
    x,
    BOARD_Y,
    z + 0.03,
    new THREE.MeshStandardMaterial({ color: boardColor, roughness: 0.5 }),
    0.04
  );

  // The lettering is drawn to a canvas and laid over the board's front face.
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let fontSize = 110;
    do {
      ctx.font = `700 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
      fontSize -= 4;
    } while (ctx.measureText(text).width > canvas.width * 0.88 && fontSize > 20);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(BOARD_WIDTH, BOARD_HEIGHT),
    new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.6 })
  );
  label.position.set(x, BOARD_Y, z + 0.065);
  group.add(label);

  colliders.push({ x, z, radius: 0.15 });
}

/**
 * Modern glass-and-steel office block for the Bounteous tech-park campus — flat roof,
 * blue-tinted curtain-wall glass with dark spandrel bands marking each floor, plus a
 * couple of rooftop mechanical units. Stands in for the generic city skyscraper models,
 * which read as dense downtown high-rises rather than a business-park campus.
 */
function techParkBuilding(
  parent: THREE.Group,
  colliders: Collider[],
  entrances: Entrance[],
  zoneId: string,
  x: number,
  z: number,
  width: number,
  height: number,
  depth: number
): THREE.Group {
  // Own group, so the occlusion fader can treat the whole building as one unit.
  const group = new THREE.Group();
  parent.add(group);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x6fa8c9, roughness: 0.2, metalness: 0.4 });
  const mullionMat = new THREE.MeshStandardMaterial({ color: 0x2f333a, roughness: 0.6 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xb7bec7, roughness: 0.75 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x24313b, roughness: 0.45, metalness: 0.2 });

  roundedBox(group, width, height, depth, x, height / 2, z, glassMat, 0.04);
  colliders.push({ x, z, width, depth });

  // Entrance door, flush on the front face (the +z side, facing the walking path).
  const doorWidth = width * 0.15;
  const doorHeight = height * 0.4;
  const doorZ = z + depth / 2 + 0.03;
  const door = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 0.06), doorMat);
  door.position.set(x, doorHeight / 2, doorZ);
  group.add(door);
  entrances.push({ x, z: doorZ, zoneId });

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
  return group;
}

/** Builds the whole walkable world once: ground, zone scenery, and the parked vehicles. */
export function buildWorld(): {
  group: THREE.Group;
  colliders: Collider[];
  bicycle: THREE.Group;
  entrances: Entrance[];
} {
  const world = new THREE.Group();
  const colliders: Collider[] = [];
  const entrances: Entrance[] = [];

  // Open meadow under and far beyond the zone slabs, so the world has a horizon (fading
  // into the fog) instead of ending at the edge of the last zone.
  const meadow = new THREE.Mesh(
    new THREE.PlaneGeometry(700, 700),
    new THREE.MeshStandardMaterial({ color: MEADOW_COLOR, roughness: 0.9 })
  );
  meadow.rotation.x = -Math.PI / 2;
  meadow.position.set(40, -0.02, 0);
  meadow.receiveShadow = true;
  world.add(meadow);

  buildHomeZone(world, 0, colliders);
  const bicycle = buildBtechZone(world, 20, colliders, entrances);
  buildBounteousZone(world, 40, colliders, entrances);
  buildNtuZone(world, 60, colliders, entrances);
  buildContactZone(world, 80, colliders, entrances);

  // Each building, lane and cloud is its own group; collapse each one's primitives into
  // one mesh per material. Models still loading attach afterwards and are untouched.
  for (const child of world.children) {
    if (child instanceof THREE.Group) mergeStaticMeshes(child);
  }

  return { group: world, colliders, bicycle, entrances };
}

function buildHomeZone(world: THREE.Group, cx: number, colliders: Collider[]) {
  groundSegment(world, cx, MEADOW_COLOR);
  tree(world, colliders, cx - 6.5, -2.4, 1.0, 0.6, "tree");
  tree(world, colliders, cx + 6.5, -2.6, 1.1, -0.8, "tree-high");
  tree(world, colliders, cx - 9.5, -1.6, 0.8, 2.0, "tree-high");
  tree(world, colliders, cx + 9, -1.8, 0.9, -1.4, "tree");
  signpost(world, colliders, cx + 3.4, -1.4, "EXPLORE \u2192", 0xf2e6cf, "#5b3a24");
}

/**
 * Amrita Vishwa Vidyapeetham's Coimbatore campus entrance block — a white, colonnaded
 * central building topped with a red hip roof, flanked by two symmetric orange-trimmed
 * wings, after the real campus's main building.
 */
function amritaBuilding(
  parent: THREE.Group,
  colliders: Collider[],
  entrances: Entrance[],
  bx: number,
  bz: number
): THREE.Group {
  // Own group, so the occlusion fader can treat the whole building as one unit.
  const group = new THREE.Group();
  parent.add(group);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf3ead9, roughness: 0.85 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xd98a3d, roughness: 0.7 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xaa4a2a, roughness: 0.8 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x5b3a24, roughness: 0.7 });

  // Central entrance block, topped with a hip roof (a 4-sided cone stretched over its footprint).
  // Collider matches the actual 5x2 footprint (not an oversized bounding circle), so the
  // character can walk right up to the door instead of being blocked well short of it.
  roundedBox(group, 5, 2.6, 2, bx, 1.3, bz, wallMat, 0.1);
  colliders.push({ x: bx, z: bz, width: 5, depth: 2 });

  // Entrance door, flush on the front wall. Kept short enough to clear the campus
  // sign mounted above it.
  const doorZ = bz + 1.03;
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.06), doorMat);
  door.position.set(bx, 0.65, doorZ);
  group.add(door);
  entrances.push({ x: bx, z: doorZ, zoneId: "btech" });

  const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 1.1, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(2.9, 1, 1.5);
  roof.position.set(bx, 2.6 + 0.55, bz);
  roof.castShadow = true;
  group.add(roof);

  // Symmetric wings, overlapping the central block's edges so they read as one structure.
  for (const side of [-1, 1]) {
    const wx = bx + side * 4.0;
    roundedBox(group, 3.6, 2.2, 2, wx, 1.1, bz, wallMat, 0.08);
    colliders.push({ x: wx, z: bz, width: 3.6, depth: 2 });

    for (const by of [0.55, 1.35]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.12, 2.05), trimMat);
      band.position.set(wx, by, bz);
      group.add(band);
    }
  }
  return group;
}

function buildBtechZone(
  world: THREE.Group,
  cx: number,
  colliders: Collider[],
  entrances: Entrance[]
): THREE.Group {
  groundSegment(world, cx, 0x8fd17a);

  const pathMat = new THREE.MeshStandardMaterial({ color: 0xd8cdb0, roughness: 0.95 });
  const path = new THREE.Mesh(new THREE.PlaneGeometry(ZONE_WIDTH + 0.1, 2.2), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(cx, 0.01, 0);
  path.receiveShadow = true;
  world.add(path);

  const campus = amritaBuilding(world, colliders, entrances, cx + 2, -5.5);
  campusSign(campus, cx + 2, -4.47);

  tree(world, colliders, cx - 7, -2.6, 1.1, 0.3, "tree");
  tree(world, colliders, cx - 2.5, -2.8, 0.95, -0.4, "tree-high");
  tree(world, colliders, cx + 4, -2.5, 1.15, 0.5, "tree");
  tree(world, colliders, cx + 8.5, -2.7, 1.0, -0.2, "tree-high");
  rock(world, colliders, cx - 4.5, -1.6, 0.6);
  rock(world, colliders, cx + 6.2, -1.4, 0.5);
  plant(world, cx - 1, 1.4, 1.4);
  plant(world, cx + 2.5, 1.5, 1.2);
  plant(world, cx - 5.5, 1.3, 1.6);

  colliders.push({ x: cx - 0.5, z: 2.4, radius: 0.4 });
  // Wrapped in a stable mount group (rather than adding the loaded model straight to
  // `world`) so the character controller can reposition/rotate it to ride, regardless of
  // whether the async GLB load has resolved yet.
  const bicycle = new THREE.Group();
  bicycle.position.set(cx - 0.5, 0, 2.4);
  world.add(bicycle);
  cloneModel("/models/bicycle.glb").then((bike) => {
    enableShadows(bike);
    bike.scale.setScalar(0.32);
    bike.rotation.y = Math.PI * 0.12;
    bicycle.add(bike);
  });
  return bicycle;
}

function buildBounteousZone(world: THREE.Group, cx: number, colliders: Collider[], entrances: Entrance[]) {
  groundSegment(world, cx, 0x4a4f58);
  stripes(world, cx - 9, cx + 9, 0xf4d35e, [1.2, 0.18]);

  // Three glass office blocks of varying scale, like a real tech park's campus — a main
  // building plus two smaller satellite blocks — rather than a row of identical towers.
  // All three open into the same "bounteous" zone content: one campus, one employer.
  const mainX = cx - 5;
  const mainZ = -7.5;
  const mainBlock = techParkBuilding(world, colliders, entrances, "bounteous", mainX, mainZ, 6, 4.2, 3);
  techParkBuilding(world, colliders, entrances, "bounteous", cx + 2, -6.5, 4.5, 3, 2.6);
  techParkBuilding(world, colliders, entrances, "bounteous", cx + 8, -7, 3.5, 2.4, 2.4);

  // Flat entrance canopy on the main block, facing the walking path. It sits above the
  // door (which is 40% of the block's 4.2 height), so it reads as a porch, not a table.
  const CANOPY_HEIGHT = 1.95;
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xe9edf0, roughness: 0.5, metalness: 0.2 });
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.1), canopyMat);
  canopy.position.set(mainX, CANOPY_HEIGHT, mainZ + 1.5 + 0.55);
  canopy.castShadow = true;
  mainBlock.add(canopy);
  for (const dx of [-1.3, 1.3]) {
    const pillarX = mainX + dx;
    const pillarZ = mainZ + 1.5 + 1.0;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, CANOPY_HEIGHT, 8), canopyMat);
    pillar.position.set(pillarX, CANOPY_HEIGHT / 2, pillarZ);
    pillar.castShadow = true;
    mainBlock.add(pillar);
    colliders.push({ x: pillarX, z: pillarZ, radius: 0.13 });
  }

  // Landscaping along the path, so the lot reads as a campus rather than a bare parking lot.
  tree(world, colliders, cx - 8.5, -1.8, 0.9, 0.4, "tree");
  tree(world, colliders, cx + 9, -1.6, 0.95, -0.5, "tree-high");
  plant(world, cx - 2, 1.6, 1.3);
  plant(world, cx + 4, 1.5, 1.2);

  colliders.push({ x: cx - 0.5, z: 2.8, radius: 0.45 });
  cloneModel("/models/motorcycle.glb").then((bike) => {
    enableShadows(bike);
    bike.scale.setScalar(0.0105);
    bike.rotation.y = Math.PI * 0.12;
    bike.position.set(cx - 0.5, 0, 2.8);
    world.add(bike);
  });
}

/**
 * NTU's "The Hive" (UOB Innovation Hub) — a cluster of ribbed cylindrical towers of varied
 * height on a low podium, with rooftop greenery, after the real building's bunched-silo look.
 */
function theHive(parent: THREE.Group, colliders: Collider[], entrances: Entrance[], x: number, z: number) {
  // Own group, so the occlusion fader can treat the whole building as one unit.
  const group = new THREE.Group();
  parent.add(group);
  const podiumMat = new THREE.MeshStandardMaterial({ color: 0x8a8378, roughness: 0.85 });
  roundedBox(group, 6.4, 0.6, 4.6, x, 0.3, z - 0.5, podiumMat, 0.08);
  // The podium itself is 0.6 units tall with no step-up logic in the collision system, so
  // without a collider the character walks onto it and renders as if buried up to the neck.
  // Blocking the whole footprint also closes the small gaps the individual tower colliders
  // used to leave short of the podium edge.
  colliders.push({ x, z: z - 0.5, width: 6.4, depth: 4.6 });
  const BASE_Y = 0.6; // towers rise from the podium top

  // No literal door — it's a monumental cluster of towers, not a single-entrance
  // building, so it can be entered by approaching from any side.
  entrances.push({ x, z, zoneId: "ntu", radius: 4.3 });

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

function buildNtuZone(world: THREE.Group, cx: number, colliders: Collider[], entrances: Entrance[]) {
  groundSegment(world, cx, 0x7a98a8);
  stripes(world, cx - 9, cx + 9, 0xffffff, [1.4, 0.2]);

  theHive(world, colliders, entrances, cx - 3, -6);

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

/**
 * Marina Bay Sands, closing out the journey in Singapore: three twin-legged towers on a
 * low podium, joined at the top by the boat-shaped SkyPark with its pool and trees.
 */
function marinaBaySands(parent: THREE.Group, colliders: Collider[], entrances: Entrance[], x: number, z: number) {
  // Own group, so the occlusion fader can treat the whole building as one unit.
  const group = new THREE.Group();
  parent.add(group);
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xe8e3d9, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x8fb4cc, roughness: 0.3, metalness: 0.3 });
  const litMat = new THREE.MeshStandardMaterial({
    color: 0xffd37a,
    roughness: 0.4,
    emissive: 0xffb347,
    emissiveIntensity: 0.5,
  });
  const poolMat = new THREE.MeshStandardMaterial({ color: 0x4fc3e8, roughness: 0.2, emissive: 0x1f8fbf, emissiveIntensity: 0.25 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x4f7942, roughness: 1 });

  const PODIUM_W = 10;
  const PODIUM_H = 1.1;
  const PODIUM_D = 2.6;
  const frontZ = z + PODIUM_D / 2;
  roundedBox(group, PODIUM_W, PODIUM_H, PODIUM_D, x, PODIUM_H / 2, z, concreteMat, 0.08);
  // No step-up logic in the collision system, so the podium blocks its whole footprint
  // (otherwise the character walks into it and renders buried, as with the Hive's podium).
  colliders.push({ x, z, width: PODIUM_W, depth: PODIUM_D });

  const frontage = new THREE.Mesh(new THREE.BoxGeometry(PODIUM_W - 0.6, 0.22, 0.04), glassMat);
  frontage.position.set(x, 0.78, frontZ + 0.01);
  group.add(frontage);

  const doorZ = frontZ + 0.03;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.95, 0.06), litMat);
  door.position.set(x, 0.48, doorZ);
  group.add(door);
  entrances.push({ x, z: doorZ, zoneId: "contact" });

  // Each tower is two slab legs: one upright, one leaning in to meet it at the top. Kept a
  // little lower than the Hive so the chase camera still frames the SkyPark on approach.
  const LEG_H = 3.6;
  const LEG_W = 1.0;
  const LEG_D = 0.8;
  const LEAN = Math.atan(0.7 / LEG_H);
  const topY = PODIUM_H + LEG_H;
  for (const tx of [x - 3.2, x, x + 3.2]) {
    const legs: Array<[cx: number, tilt: number]> = [
      [tx + 0.45, 0],
      [tx - 0.4, -LEAN],
    ];
    legs.forEach(([lx, tilt]) => {
      // A pivot group per leg, so the window bands tilt with it.
      const pivot = new THREE.Group();
      pivot.position.set(lx, PODIUM_H + LEG_H / 2, z);
      pivot.rotation.z = tilt;
      group.add(pivot);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(LEG_W, LEG_H / Math.cos(tilt), LEG_D), concreteMat);
      leg.castShadow = true;
      leg.receiveShadow = true;
      pivot.add(leg);
      let floor = 0;
      for (let by = -LEG_H / 2 + 0.35; by < LEG_H / 2 - 0.2; by += 0.42) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(LEG_W - 0.08, 0.16, 0.02), floor % 4 === 2 ? litMat : glassMat);
        band.position.set(0, by, LEG_D / 2 + 0.01);
        pivot.add(band);
        floor++;
      }
    });
  }

  // The SkyPark: a long hull across all three tower tops, its bow cantilevered past the end tower.
  const hull = new THREE.Shape();
  hull.moveTo(-4.4, -0.5);
  hull.lineTo(4.6, -0.5);
  hull.lineTo(6.0, -0.15);
  hull.lineTo(6.25, 0);
  hull.lineTo(6.0, 0.15);
  hull.lineTo(4.6, 0.5);
  hull.lineTo(-4.4, 0.5);
  hull.quadraticCurveTo(-4.85, 0, -4.4, -0.5);
  const DECK_T = 0.32;
  const deck = new THREE.Mesh(new THREE.ExtrudeGeometry(hull, { depth: DECK_T, bevelEnabled: false }), concreteMat);
  // Lay the shape flat: its y becomes world -z and the extrusion rises along +y.
  deck.rotation.x = -Math.PI / 2;
  deck.position.set(x, topY - 0.05, z);
  deck.castShadow = true;
  group.add(deck);

  const deckTop = topY - 0.05 + DECK_T;
  const pool = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.05, 0.24), poolMat);
  pool.position.set(x + 0.4, deckTop + 0.025, z + 0.22);
  group.add(pool);
  for (let px = -3.9; px <= 4.4; px += 0.55) {
    const tree = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), foliageMat);
    tree.position.set(x + px, deckTop + 0.12, z - 0.2);
    group.add(tree);
  }
}

/** The ArtScience Museum beside it: a white lotus of upturned petals on a round base. */
function artScienceMuseum(parent: THREE.Group, colliders: Collider[], x: number, z: number) {
  const group = new THREE.Group();
  parent.add(group);
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.5 });

  const BASE_H = 0.4;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, BASE_H, 16), whiteMat);
  base.position.set(x, BASE_H / 2, z);
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const PETALS = 9;
  for (let i = 0; i < PETALS; i++) {
    // Each petal pivots at the base and tilts outward, alternating long and short.
    const pivot = new THREE.Group();
    pivot.position.set(x, BASE_H, z);
    pivot.rotation.y = (i / PETALS) * Math.PI * 2;
    group.add(pivot);
    const length = i % 2 === 0 ? 1.0 : 0.8;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), whiteMat);
    petal.scale.set(0.16, length, 0.42);
    petal.rotation.z = -0.5;
    petal.position.set(0.45, length * 0.85, 0);
    petal.castShadow = true;
    pivot.add(petal);
  }

  colliders.push({ x, z, radius: 1.4 });
}

/**
 * A strip of bay water between the path and Marina Bay Sands, with a boardwalk across to
 * its door at `doorX`. The water either side is blocked so the character can't walk on it.
 */
function bayWater(parent: THREE.Group, colliders: Collider[], xStart: number, xEnd: number, doorX: number) {
  const group = new THREE.Group();
  parent.add(group);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x3f8fc4, roughness: 0.25, metalness: 0.1 });
  const kerbMat = new THREE.MeshStandardMaterial({ color: 0xcfc8bb, roughness: 0.9 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.8 });

  const Z_FRONT = -2.9;
  const Z_BACK = -5.2;
  const depth = Z_FRONT - Z_BACK;
  const zMid = (Z_FRONT + Z_BACK) / 2;
  const WALK = 1.6;

  const spans: Array<[number, number]> = [
    [xStart, doorX - WALK / 2],
    [doorX + WALK / 2, xEnd],
  ];
  for (const [a, b] of spans) {
    const width = b - a;
    const water = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), waterMat);
    water.rotation.x = -Math.PI / 2;
    // Just above the ground slab (and clear of the lane stripes at z = 0), so no z-fighting.
    water.position.set((a + b) / 2, 0.015, zMid);
    water.receiveShadow = true;
    group.add(water);
    const kerb = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, 0.12), kerbMat);
    kerb.position.set((a + b) / 2, 0.05, Z_FRONT);
    kerb.receiveShadow = true;
    group.add(kerb);
    colliders.push({ x: (a + b) / 2, z: zMid, width, depth });
  }

  const boardwalk = new THREE.Mesh(new THREE.BoxGeometry(WALK, 0.06, depth), woodMat);
  boardwalk.position.set(doorX, 0.03, zMid);
  boardwalk.receiveShadow = true;
  group.add(boardwalk);
}

function buildContactZone(world: THREE.Group, cx: number, colliders: Collider[], entrances: Entrance[]) {
  groundSegment(world, cx, 0x6b7280);
  stripes(world, cx - 9, cx + 9, 0xffffff, [1.4, 0.2]);

  const mbsX = cx - 5;
  marinaBaySands(world, colliders, entrances, mbsX, -7);
  bayWater(world, colliders, cx - 9, cx + 4, mbsX);
  artScienceMuseum(world, colliders, cx + 6.5, -6);

  signpost(world, colliders, cx - 1.5, -1.8, "SAY HELLO", 0xff7a1a, "#ffffff");
}
