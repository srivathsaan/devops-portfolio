import * as THREE from "three";

const FADED_OPACITY = 0.22;
const FADE_RATE = 9; // higher = fades in/out faster
const FADED_RENDER_ORDER = 10;

type SortItem = { groupOrder: number; renderOrder: number; z: number; id: number };

/**
 * three.js's default transparent sort (back to front), except faded meshes are drawn
 * front to back. Combined with depth writes on the faded materials, only the nearest
 * surface of a faded building is blended, so a structure made of hundreds of overlapping
 * pieces reads as one even veil instead of stacking up to near-opaque.
 */
function sortTransparent(a: SortItem, b: SortItem): number {
  if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder;
  if (a.renderOrder !== b.renderOrder) return a.renderOrder - b.renderOrder;
  if (a.z !== b.z) return a.renderOrder === FADED_RENDER_ORDER ? a.z - b.z : b.z - a.z;
  return a.id - b.id;
}

type FadeState = {
  /** 1 = fully solid, FADED_OPACITY = fully faded. */
  level: number;
  occluding: boolean;
  swaps: Array<{ mesh: THREE.Mesh; original: THREE.Material; renderOrder: number }>;
  clones: Array<{ clone: THREE.Material; baseOpacity: number }>;
};

export type OcclusionFader = {
  /** Call once per frame with the camera position and the point that must stay visible. */
  update: (delta: number, cameraPosition: THREE.Vector3, target: THREE.Vector3) => void;
  dispose: () => void;
};

/**
 * Fades out whatever stands between the camera and the character, so walking behind a
 * building doesn't hide the player. Works per "unit" — a direct child of `world` (a whole
 * building group, one tree model) — and swaps in transparent clones of that unit's
 * materials rather than editing the originals, because cloned glTF models share theirs.
 */
export function createOcclusionFader(world: THREE.Object3D, renderer: THREE.WebGLRenderer): OcclusionFader {
  renderer.setTransparentSort(sortTransparent);
  const raycaster = new THREE.Raycaster();
  const direction = new THREE.Vector3();
  const fades = new Map<THREE.Object3D, FadeState>();

  function unitOf(object: THREE.Object3D): THREE.Object3D {
    let unit = object;
    while (unit.parent && unit.parent !== world) unit = unit.parent;
    return unit;
  }

  function beginFade(unit: THREE.Object3D): FadeState {
    const cloneBySource = new Map<THREE.Material, THREE.Material>();
    const state: FadeState = { level: 1, occluding: true, swaps: [], clones: [] };
    unit.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || Array.isArray(mesh.material)) return;
      const original = mesh.material;
      let clone = cloneBySource.get(original);
      if (!clone) {
        clone = original.clone();
        clone.transparent = true;
        clone.depthWrite = true;
        cloneBySource.set(original, clone);
        state.clones.push({ clone, baseOpacity: original.opacity });
      }
      state.swaps.push({ mesh, original, renderOrder: mesh.renderOrder });
      mesh.material = clone;
      mesh.renderOrder = FADED_RENDER_ORDER;
    });
    return state;
  }

  function endFade(state: FadeState) {
    for (const { mesh, original, renderOrder } of state.swaps) {
      mesh.material = original;
      mesh.renderOrder = renderOrder;
    }
    for (const { clone } of state.clones) clone.dispose();
  }

  function update(delta: number, cameraPosition: THREE.Vector3, target: THREE.Vector3) {
    direction.subVectors(target, cameraPosition);
    const distance = direction.length();
    direction.normalize();
    raycaster.set(cameraPosition, direction);
    raycaster.far = Math.max(0, distance - 0.3);

    for (const state of fades.values()) state.occluding = false;
    for (const hit of raycaster.intersectObject(world, true)) {
      const unit = unitOf(hit.object);
      let state = fades.get(unit);
      if (!state) {
        state = beginFade(unit);
        fades.set(unit, state);
      }
      state.occluding = true;
    }

    const step = Math.min(1, FADE_RATE * delta);
    for (const [unit, state] of fades) {
      const goal = state.occluding ? FADED_OPACITY : 1;
      state.level += (goal - state.level) * step;
      if (!state.occluding && state.level > 0.98) {
        endFade(state);
        fades.delete(unit);
        continue;
      }
      for (const { clone, baseOpacity } of state.clones) clone.opacity = baseOpacity * state.level;
    }
  }

  function dispose() {
    for (const state of fades.values()) endFade(state);
    fades.clear();
  }

  return { update, dispose };
}
