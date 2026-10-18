import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { roundedBox } from "./helpers";

export type FigureColors = {
  skin: number;
  hair: number;
  shirt: number;
  shirtTrim?: number;
  pants: number;
  shoes: number;
};

export type Figure = {
  group: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  frontArm: THREE.Group;
  backArm: THREE.Group;
  frontLeg: THREE.Group;
  backLeg: THREE.Group;
};

/** A limb as its own group, pivoting from the shoulder/hip at the group's local origin. */
function buildLimb(
  length: number,
  radius: number,
  limbMat: THREE.Material,
  capMat: THREE.Material,
  capSize: number,
  isArm: boolean
): THREE.Group {
  const limb = new THREE.Group();

  const segment = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.85, length, 8), limbMat);
  segment.position.y = -length / 2;
  segment.castShadow = true;
  segment.receiveShadow = true;
  limb.add(segment);

  const cap = isArm
    ? new THREE.Mesh(new THREE.SphereGeometry(capSize, 10, 8), capMat)
    : new THREE.Mesh(new RoundedBoxGeometry(capSize * 2.3, capSize * 1.1, capSize * 2.6, 2, capSize * 0.45), capMat);
  cap.position.y = isArm ? -length : -length - capSize * 0.4;
  cap.castShadow = true;
  limb.add(cap);

  return limb;
}

/**
 * A simple humanoid figure (head, hair, torso, two arms, two legs), built for a
 * side-on view. Origin sits at hip height. Limbs are returned as groups the
 * caller can reposition/rotate per pose (standing, pedaling, riding).
 */
export function buildRider(parent: THREE.Object3D, colors: FigureColors): Figure {
  const group = new THREE.Group();
  parent.add(group);

  const skinMat = new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.75 });
  const hairMat = new THREE.MeshStandardMaterial({ color: colors.hair, roughness: 0.55 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: colors.shirt, roughness: 0.55 });
  const trimMat = new THREE.MeshStandardMaterial({
    color: colors.shirtTrim ?? colors.shirt,
    roughness: 0.5,
  });
  const pantsMat = new THREE.MeshStandardMaterial({ color: colors.pants, roughness: 0.6 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: colors.shoes, roughness: 0.45 });

  const torso = roundedBox(group, 0.26, 0.38, 0.2, 0, 0.19, 0, shirtMat, 0.06);
  roundedBox(group, 0.27, 0.07, 0.205, 0, 0.36, 0, trimMat, 0.03);

  const head = new THREE.Group();
  head.position.set(0, 0.39, 0);
  group.add(head);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 10), skinMat);
  neck.position.y = 0.04;
  head.add(neck);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 14), skinMat);
  skull.position.y = 0.2;
  skull.castShadow = true;
  head.add(skull);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.175, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4),
    hairMat
  );
  hair.position.y = 0.22;
  hair.castShadow = true;
  head.add(hair);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x20242b, roughness: 0.3 });
  const eyeGeo = new THREE.SphereGeometry(0.02, 8, 6);
  const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
  eyeLeft.position.set(-0.06, 0.21, 0.155);
  head.add(eyeLeft);
  const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
  eyeRight.position.set(0.06, 0.21, 0.155);
  head.add(eyeRight);

  const frontArm = buildLimb(0.32, 0.042, shirtMat, skinMat, 0.05, true);
  frontArm.position.set(0.14, 0.33, 0.08);
  group.add(frontArm);

  const backArm = buildLimb(0.3, 0.04, shirtMat, skinMat, 0.046, true);
  backArm.position.set(-0.14, 0.33, -0.08);
  group.add(backArm);

  const frontLeg = buildLimb(0.42, 0.058, pantsMat, shoeMat, 0.09, false);
  frontLeg.position.set(0.09, -0.01, 0.09);
  group.add(frontLeg);

  const backLeg = buildLimb(0.42, 0.058, pantsMat, shoeMat, 0.09, false);
  backLeg.position.set(-0.09, -0.01, -0.09);
  group.add(backLeg);

  return { group, head, torso, frontArm, backArm, frontLeg, backLeg };
}
