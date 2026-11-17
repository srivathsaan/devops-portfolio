/**
 * Remembers which building the visitor last came from (per browser tab), so going back to
 * the 3D world puts the character outside that building instead of at the start.
 * Storage can be unavailable (private mode, blocked site data), so every access is guarded.
 */
const RETURN_ZONE_KEY = "world:return-zone";

export function rememberReturnZone(zoneId: string) {
  try {
    sessionStorage.setItem(RETURN_ZONE_KEY, zoneId);
  } catch {
    // Without storage the world simply starts at the beginning.
  }
}

export function readReturnZone(): string | null {
  try {
    return sessionStorage.getItem(RETURN_ZONE_KEY);
  } catch {
    return null;
  }
}
