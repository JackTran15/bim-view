import type { Point2D } from "@/types/bim";

const MM_TO_M = 1 / 1000;

/** True if p has finite x and y (no NaN/Infinity). */
export function isFinitePoint(p: Point2D): boolean {
  return (
    p != null &&
    typeof p[0] === "number" &&
    typeof p[1] === "number" &&
    Number.isFinite(p[0]) &&
    Number.isFinite(p[1])
  );
}

/** True if polygon has at least 3 points and all coordinates are finite. */
export function isFinitePolygon(polygon: Point2D[] | undefined): polygon is Point2D[] {
  if (!polygon || polygon.length < 3) return false;
  return polygon.every(isFinitePoint);
}

/** Convert mm to meters. */
export function mmToM(mm: number): number {
  return mm * MM_TO_M;
}

/** Distance between two 2D points (same units as input). Returns 0 if either point is invalid. */
export function segmentLength(p0: Point2D, p1: Point2D): number {
  if (!isFinitePoint(p0) || !isFinitePoint(p1)) return 0;
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/** Squared distance from point P to line segment [p0, p1]. Returns Infinity if segment invalid. */
export function pointToSegmentDistSq(p: Point2D, p0: Point2D, p1: Point2D): number {
  if (!isFinitePoint(p) || !isFinitePoint(p0) || !isFinitePoint(p1)) return Infinity;
  const lenSq = (p1[0] - p0[0]) ** 2 + (p1[1] - p0[1]) ** 2;
  if (lenSq < 1e-10) return (p[0] - p0[0]) ** 2 + (p[1] - p0[1]) ** 2;
  let t = ((p[0] - p0[0]) * (p1[0] - p0[0]) + (p[1] - p0[1]) * (p1[1] - p0[1])) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const qx = p0[0] + t * (p1[0] - p0[0]);
  const qy = p0[1] + t * (p1[1] - p0[1]);
  return (p[0] - qx) ** 2 + (p[1] - qy) ** 2;
}

/** Angle in radians from p0 to p1 (for Y rotation in 3D: atan2(dy, dx)). Returns 0 if either point is invalid. */
export function segmentAngle(p0: Point2D, p1: Point2D): number {
  if (!isFinitePoint(p0) || !isFinitePoint(p1)) return 0;
  return Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
}

/** Center of segment in meters (X, Z) for 3D. Returns [0,0] if either point is invalid. */
export function segmentCenterM(p0: Point2D, p1: Point2D): [number, number] {
  if (!isFinitePoint(p0) || !isFinitePoint(p1)) return [0, 0];
  return [
    ((p0[0] + p1[0]) / 2) * MM_TO_M,
    ((p0[1] + p1[1]) / 2) * MM_TO_M,
  ];
}

/** Centroid of a polygon in meters (X, Z) for 3D. Returns [0,0] if invalid. */
export function polygonCentroidM(polygon: Point2D[]): [number, number] {
  if (!polygon?.length) return [0, 0];
  let sx = 0;
  let sy = 0;
  for (const p of polygon) {
    if (!isFinitePoint(p)) return [0, 0];
    sx += p[0];
    sy += p[1];
  }
  const n = polygon.length;
  return [(sx / n) * MM_TO_M, (sy / n) * MM_TO_M];
}

/**
 * Offset a polygon inward by thickness (mm).
 * Assumes CCW winding; inward = to the left of each edge.
 * Works for convex polygons (e.g. rectangles).
 */
export function offsetPolygonInward(polygon: Point2D[], thicknessMm: number): Point2D[] {
  const n = polygon.length;
  if (n < 3) return polygon;
  if (!polygon.every(isFinitePoint)) return polygon;
  const t = thicknessMm;
  if (!Number.isFinite(t) || t <= 0) return polygon;
  const out: Point2D[] = [];
  for (let i = 0; i < n; i++) {
    const prev = polygon[(i - 1 + n) % n];
    const curr = polygon[i];
    const next = polygon[(i + 1) % n];
    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const len1 = Math.hypot(dx1, dy1) || 1;
    const nx1 = -dy1 / len1;
    const ny1 = dx1 / len1;
    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];
    const len2 = Math.hypot(dx2, dy2) || 1;
    const nx2 = -dy2 / len2;
    const ny2 = dx2 / len2;
    const p1x = prev[0] + nx1 * t;
    const p1y = prev[1] + ny1 * t;
    const p2x = curr[0] + nx1 * t;
    const p2y = curr[1] + ny1 * t;
    const q1x = curr[0] + nx2 * t;
    const q1y = curr[1] + ny2 * t;
    const q2x = next[0] + nx2 * t;
    const q2y = next[1] + ny2 * t;
    const d = (p2x - p1x) * (q2y - q1y) - (p2y - p1y) * (q2x - q1x);
    if (!Number.isFinite(d) || Math.abs(d) < 1e-10) {
      const fallbackX = curr[0] + nx1 * t;
      const fallbackY = curr[1] + ny1 * t;
      out.push([Number.isFinite(fallbackX) ? fallbackX : curr[0], Number.isFinite(fallbackY) ? fallbackY : curr[1]]);
    } else {
      const s = ((q1x - p1x) * (q2y - q1y) - (q1y - p1y) * (q2x - q1x)) / d;
      const x = p1x + s * (p2x - p1x);
      const y = p1y + s * (p2y - p1y);
      out.push([Number.isFinite(x) ? x : curr[0], Number.isFinite(y) ? y : curr[1]]);
    }
  }
  return out.every((p) => isFinitePoint(p)) ? out : polygon;
}

/** Door opening on a wall segment: parametric interval [t0, t1] in [0, 1]. */
export type DoorOpening = { t0: number; t1: number };

/**
 * Split a wall segment into sub-segments with door openings cut out.
 * Doors whose position projects onto the segment (within distThresholdMm) are treated as holes.
 * Returns segments that should be rendered (no geometry where doors are).
 */
export function segmentWithDoorCuts(
  p0: Point2D,
  p1: Point2D,
  doors: Array<{ position: Point2D; width: number }>,
  distThresholdMm: number = 300
): { p0: Point2D; p1: Point2D }[] {
  if (!isFinitePoint(p0) || !isFinitePoint(p1)) return [];
  const len = segmentLength(p0, p1);
  if (len < 1) return [{ p0, p1 }];
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const openings: DoorOpening[] = [];
  for (const door of doors) {
    const pa = door.position[0] - p0[0];
    const pb = door.position[1] - p0[1];
    const t = (pa * dx + pb * dy) / (len * len);
    const distToLine = Math.abs(pa * dy - pb * dx) / len;
    if (distToLine > distThresholdMm || t < -0.01 || t > 1.01) continue;
    const tClamp = Math.max(0, Math.min(1, t));
    const halfW = door.width / 2;
    const t0 = (tClamp * len - halfW) / len;
    const t1 = (tClamp * len + halfW) / len;
    openings.push({ t0: Math.max(0, t0), t1: Math.min(1, t1) });
  }
  if (openings.length === 0) return [{ p0, p1 }];
  openings.sort((a, b) => a.t0 - b.t0);
  const merged: DoorOpening[] = [];
  for (const o of openings) {
    if (o.t1 <= o.t0) continue;
    if (merged.length === 0) {
      merged.push({ t0: o.t0, t1: o.t1 });
    } else {
      const last = merged[merged.length - 1];
      if (o.t0 <= last.t1) {
        last.t1 = Math.max(last.t1, o.t1);
      } else {
        merged.push({ t0: o.t0, t1: o.t1 });
      }
    }
  }
  const minSegLen = 20 / len;
  const out: { p0: Point2D; p1: Point2D }[] = [];
  let t = 0;
  for (const o of merged) {
    if (o.t0 - t >= minSegLen) {
      out.push({
        p0: [p0[0] + t * dx, p0[1] + t * dy],
        p1: [p0[0] + o.t0 * dx, p0[1] + o.t0 * dy],
      });
    }
    t = o.t1;
  }
  if (1 - t >= minSegLen) {
    out.push({
      p0: [p0[0] + t * dx, p0[1] + t * dy],
      p1: [p1[0], p1[1]],
    });
  }
  return out.length > 0 ? out : [];
}
