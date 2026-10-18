/** Shared "ride across and cut" tween. Every scene rests its mover at REST_X. */
export const REST_X = -1.5;
export const RIDE_DISTANCE = 9;
export const RIDE_DURATION = 1.1; // seconds

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * x position for a ride in progress. direction 1 = advance (rides off the
 * right edge, left-to-right). direction -1 = reverse (rides off the left
 * edge — "the left key works in reverse").
 */
export function rideOffsetX(progress: number, direction: 1 | -1): number {
  const eased = easeInOutQuad(Math.min(1, Math.max(0, progress)));
  return REST_X + direction * RIDE_DISTANCE * eased;
}
