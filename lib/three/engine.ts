import * as THREE from "three";

export type Engine = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  rigRoot: THREE.Group;
  setBackground: (color: THREE.ColorRepresentation) => void;
  resize: () => void;
  dispose: () => void;
};

/**
 * One persistent scene/camera/renderer for the whole app lifetime. Individual
 * scene builders (build-cycle.ts etc.) only ever add/remove a Group under
 * `rigRoot` — the renderer, camera and base lighting are created once here.
 */
export function createEngine(canvas: HTMLCanvasElement): Engine {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfe3f2);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 2.4, 9);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x3a3a3a, 1.1);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff4de, 2.2);
  sun.position.set(-4, 8, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -10;
  sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  scene.add(sun);

  const rigRoot = new THREE.Group();
  scene.add(rigRoot);

  function resize() {
    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? canvas.clientWidth ?? window.innerWidth;
    const height = parent?.clientHeight ?? canvas.clientHeight ?? window.innerHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function setBackground(color: THREE.ColorRepresentation) {
    scene.background = new THREE.Color(color);
  }

  function dispose() {
    // Deliberately NOT calling renderer.forceContextLoss() here: React 18 Strict
    // Mode double-invokes this effect in dev (mount -> cleanup -> mount again,
    // synchronously), and forcing context loss on the first cleanup leaves the
    // canvas unable to produce a fresh WebGL context for the second mount
    // (`getContext` returns null). renderer.dispose() alone frees three.js's
    // internal GPU resources without killing the context; the browser reclaims
    // the context itself when the canvas/tab is actually torn down.
    rigRoot.children.slice().forEach((child) => rigRoot.remove(child));
    renderer.dispose();
  }

  return { scene, camera, renderer, rigRoot, setBackground, resize, dispose };
}
