import type { WallMaterial } from "@/store/types";

/**
 * Coordinate system: 1 unit = 1 meter everywhere.
 * 2D canvas uses PIXELS_PER_METER to convert meters → pixels for Konva.
 */
export const PIXELS_PER_METER = 100;

/** Grid snap in meters (e.g. 0.1 = 10cm). */
export const SNAP_GRID = 0.1;

/** Cost per m³ by material (for BIM Inspector cost estimate). */
export const MATERIAL_COST_PER_M3: Record<WallMaterial, number> = {
  brick: 120,
  concrete: 85,
  drywall: 45,
};

/** Real brick dimensions in meters (length × height × width). Used for instanced brick walls. */
export const BRICK_LENGTH = 0.2;
export const BRICK_HEIGHT = 0.065;
export const BRICK_WIDTH = 0.1;