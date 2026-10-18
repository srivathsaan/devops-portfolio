import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type Vec3 = [number, number, number];

/** A box mesh, added to parent and returned. Small helper to keep scene-building code terse. */
export function box(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  castShadow = true
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/** A box with softened edges — used for bodies/seats/panels so they read as designed, not raw cubes. */
export function roundedBox(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  radius = 0.03
): THREE.Mesh {
  const r = Math.min(radius, w / 2.2, h / 2.2, d / 2.2);
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/** A cylinder mesh (also used for wheels: pass equal top/bottom radius). */
export function cyl(
  parent: THREE.Object3D,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  segments = 20
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/** A sphere mesh. */
export function ball(
  parent: THREE.Object3D,
  radius: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  segments = 16
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments / 2), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/**
 * A wheel with visible spokes and a hub, as one group so it spins as a unit.
 * Lies in the local XY plane (tube axis along Z) — rotate the returned group
 * around Z to spin it.
 */
export function spokedWheel(
  parent: THREE.Object3D,
  radius: number,
  tubeRadius: number,
  x: number,
  y: number,
  z: number,
  tireMat: THREE.Material,
  hubMat: THREE.Material,
  spokeCount = 5
): THREE.Group {
  const wheel = new THREE.Group();
  wheel.position.set(x, y, z);
  parent.add(wheel);

  const tire = new THREE.Mesh(new THREE.TorusGeometry(radius, tubeRadius, 10, 22), tireMat);
  tire.castShadow = true;
  wheel.add(tire);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.16, radius * 0.16, tubeRadius * 1.6, 12), hubMat);
  hub.rotation.x = Math.PI / 2;
  wheel.add(hub);

  const spokeLength = radius - radius * 0.16;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(tubeRadius * 0.22, tubeRadius * 0.22, spokeLength, 6),
      hubMat
    );
    spoke.position.set(Math.cos(angle) * spokeLength * 0.5, Math.sin(angle) * spokeLength * 0.5, 0);
    spoke.rotation.z = angle + Math.PI / 2;
    wheel.add(spoke);
  }

  return wheel;
}

/** A tube following a Catmull-Rom spline through the given points — used for frames/cables. */
export function tube(
  parent: THREE.Object3D,
  points: Vec3[],
  radius: number,
  material: THREE.Material
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, Math.max(12, points.length * 8), radius, 8, false),
    material
  );
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

/** Disposes every geometry/material on a group's meshes, then removes it from its parent. */
export function disposeGroup(group: THREE.Object3D) {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose();
  });
  group.parent?.remove(group);
}
