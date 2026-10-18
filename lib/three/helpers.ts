import * as THREE from "three";

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
