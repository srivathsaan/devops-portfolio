import * as THREE from "three";

export type Engine = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  rigRoot: THREE.Group;
  sun: THREE.DirectionalLight;
  sky: THREE.Object3D;
  setBackground: (color: THREE.ColorRepresentation) => void;
  resize: () => void;
  dispose: () => void;
};

const SKY_VERTEX_SHADER = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAGMENT_SHADER = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition).y;
    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), 0.7), 0.0)), 1.0);
  }
`;

/**
 * One persistent scene/camera/renderer for the whole app lifetime. Individual
 * scene builders (build-cycle.ts etc.) only ever add/remove a Group under
 * `rigRoot` — the renderer, camera, base lighting and sky are created once here.
 */
export function createEngine(canvas: HTMLCanvasElement): Engine {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xbfe3f2, 14, 34);

  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x6fb3e0) },
      bottomColor: { value: new THREE.Color(0xbfe3f2) },
    },
    vertexShader: SKY_VERTEX_SHADER,
    fragmentShader: SKY_FRAGMENT_SHADER,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(70, 20, 14), skyMaterial);
  scene.add(sky);

  // Position/lookAt are driven every frame by the character controller's
  // chase-cam logic (components/scene-canvas.tsx) — this is just a safe default
  // before the first frame runs.
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 160);
  camera.position.set(-6.5, 5.2, 7.5);
  camera.lookAt(2.5, 1.1, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x3a3a3a, 1.1);
  scene.add(hemi);

  // Position is updated every frame (components/scene-canvas.tsx) to stay offset
  // from the character, so the shadow camera's small, sharp frustum always covers
  // wherever the player currently is in this ~100-unit-wide world.
  const sun = new THREE.DirectionalLight(0xfff4de, 2.2);
  sun.position.set(-4, 8, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -10;
  sun.shadow.camera.right = 10;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  scene.add(sun);
  scene.add(sun.target);

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
    const bottom = new THREE.Color(color);
    const top = bottom.clone().multiplyScalar(0.72).lerp(new THREE.Color(0x1a3a63), 0.18);
    skyMaterial.uniforms.bottomColor.value.copy(bottom);
    skyMaterial.uniforms.topColor.value.copy(top);
    (scene.fog as THREE.Fog).color.copy(bottom);
  }
  setBackground(0xbfe3f2);

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

  return { scene, camera, renderer, rigRoot, sun, sky, setBackground, resize, dispose };
}
