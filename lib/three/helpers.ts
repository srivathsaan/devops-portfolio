import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

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

const MERGED_ATTRIBUTES = ["position", "normal", "uv"];

/**
 * Merges the meshes under `group` that share a material and shadow settings into one
 * mesh each, so a structure built from many primitives costs one draw call per material
 * instead of one per piece. Only meshes present right now are merged — models that are
 * still loading attach later and are left alone — as are skinned meshes.
 */
export function mergeStaticMeshes(group: THREE.Object3D) {
  group.updateMatrixWorld(true);
  const toGroupSpace = new THREE.Matrix4().copy(group.matrixWorld).invert();
  const buckets = new Map<
    string,
    { material: THREE.Material; castShadow: boolean; receiveShadow: boolean; meshes: THREE.Mesh[] }
  >();

  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material) || (mesh as THREE.SkinnedMesh).isSkinnedMesh) return;
    if (!MERGED_ATTRIBUTES.every((name) => mesh.geometry.getAttribute(name))) return;
    const key = `${mesh.material.uuid}|${mesh.castShadow}|${mesh.receiveShadow}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { material: mesh.material, castShadow: mesh.castShadow, receiveShadow: mesh.receiveShadow, meshes: [] };
      buckets.set(key, bucket);
    }
    bucket.meshes.push(mesh);
  });

  for (const bucket of buckets.values()) {
    if (bucket.meshes.length < 2) continue;
    const geometries = bucket.meshes.map((mesh) => {
      // Non-indexed copies with exactly the shared attributes, so any mix of primitives merges.
      const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      for (const name of Object.keys(geometry.attributes)) {
        if (!MERGED_ATTRIBUTES.includes(name)) geometry.deleteAttribute(name);
      }
      geometry.clearGroups();
      return geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(toGroupSpace, mesh.matrixWorld));
    });
    const merged = mergeGeometries(geometries);
    geometries.forEach((g) => g.dispose());
    if (!merged) continue;

    for (const mesh of bucket.meshes) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
    }
    const mergedMesh = new THREE.Mesh(merged, bucket.material);
    mergedMesh.castShadow = bucket.castShadow;
    mergedMesh.receiveShadow = bucket.receiveShadow;
    group.add(mergedMesh);
  }
}

/** Disposes every geometry, material and texture on a group's meshes, then removes it from its parent. */
export function disposeGroup(group: THREE.Object3D) {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    for (const m of Array.isArray(material) ? material : material ? [material] : []) {
      (m as THREE.MeshStandardMaterial).map?.dispose();
      m.dispose();
    }
  });
  group.parent?.remove(group);
}
