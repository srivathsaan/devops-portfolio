import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

const loader = new GLTFLoader();
const cache = new Map<string, Promise<GLTF>>();

/** Loads a glTF/GLB once per URL and caches the in-flight/resolved promise. */
function loadGLTF(url: string): Promise<GLTF> {
  let promise = cache.get(url);
  if (!promise) {
    promise = loader.loadAsync(url);
    cache.set(url, promise);
  }
  return promise;
}

/**
 * Loads (or reuses the cached load of) a model and returns an independent
 * clone of its scene graph — SkeletonUtils.clone so skinned meshes keep a
 * working, separate skeleton when the same character appears in multiple
 * scenes at once.
 */
export async function cloneModel(url: string): Promise<THREE.Object3D> {
  const gltf = await loadGLTF(url);
  return cloneSkeleton(gltf.scene) as THREE.Object3D;
}

export async function loadModelWithAnimations(
  url: string
): Promise<{ scene: THREE.Object3D; animations: THREE.AnimationClip[] }> {
  const gltf = await loadGLTF(url);
  return { scene: cloneSkeleton(gltf.scene) as THREE.Object3D, animations: gltf.animations };
}

/** Enables shadows on every mesh in a loaded model. */
export function enableShadows(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
}
