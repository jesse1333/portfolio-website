import Matter from 'matter-js';

/**
 * True if the two bodies overlap (active contact / intersection).
 * Uses Matter’s SAT test; does not imply “stacked” — any touching counts.
 */
export function areColliding(bodyA, bodyB) {
  return Matter.Collision.collides(bodyA, bodyB) != null;
}

/**
 * Heuristic: `upper` is supported on `lower` (smaller y, higher on screen) and colliding
 * with `lower` along what looks like a horizontal contact (y-down coordinates).
 */
export function isRestingOn(upper, lower, tolerance = 20) {
  const col = Matter.Collision.collides(upper, lower);
  if (!col) return false;
  if (upper.bounds.max.y < lower.bounds.min.y - 2) return false;
  if (upper.position.y >= lower.position.y) return false;
  const bottomToTop = upper.bounds.max.y - lower.bounds.min.y;
  return bottomToTop > -10 && bottomToTop < tolerance;
}

/** Mid on base and cap on mid (order: base, mid, cap). */
export function isPyramidStacked(base, mid, cap) {
  return isRestingOn(mid, base) && isRestingOn(cap, mid);
}

/**
 * 0 — mid not on base (or invalid).
 * 1 — mid resting on largest trapezoid only.
 * 2 — triangle on mid and mid on base.
 */
export function computePyramidStackLevel(base, mid, cap) {
  const midOnBase = isRestingOn(mid, base);
  const capOnMid = isRestingOn(cap, mid);
  if (midOnBase && capOnMid) return 2;
  if (midOnBase) return 1;
  return 0;
}
