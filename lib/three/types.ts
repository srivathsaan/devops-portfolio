import * as THREE from "three";

export type Rig = {
  /** Character + vehicle. Its x position is driven externally during a ride transition. */
  mover: THREE.Group;
  /** Static scenery (ground, props) — never moved. */
  environment: THREE.Group;
  /** Scene background color while this rig is active. */
  background: number;
  /** Per-frame hook: spin wheels/propeller, idle bob, etc. `riding` is true mid-transition. */
  update: (delta: number, riding: boolean) => void;
};
