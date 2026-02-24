import type { Wall } from "@/store/types";
import { SNAP_GRID } from "./constants";

/** Wall length in meters (2D distance between start and end). */
export function length(wall: Wall): number {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Wall volume in m³ (length × height × thickness). */
export function volume(wall: Wall): number {
  return length(wall) * wall.height * wall.thickness;
}

/** Snap a value to the grid (meters). */
export function snapToGrid(value: number, grid: number = SNAP_GRID): number {
  return Math.round(value / grid) * grid;
}

/** Rotation in radians for 2D wall direction (for 3D: rotate around Y). */
export function getWallRotation(wall: Wall): number {
  return Math.atan2(
    wall.end.y - wall.start.y,
    wall.end.x - wall.start.x
  );
}

/** 2D center of the wall in meters. */
export function getWallCenter(wall: Wall): { x: number; y: number } {
  return {
    x: (wall.start.x + wall.end.x) / 2,
    y: (wall.start.y + wall.end.y) / 2,
  };
}

/**
 * 3D position for the wall mesh (center at floor level, then offset by half height on Y).
 * Use with R3F: position={[x, y, z]} where Y is up.
 */
export function getWallPosition3D(wall: Wall): [number, number, number] {
  const c = getWallCenter(wall);
  return [c.x, wall.height / 2, c.y];
}

/** Unit direction along the wall in 3D (XZ plane), length 1. */
export function getWallDirection3D(wall: Wall): [number, number, number] {
  const r = getWallRotation(wall);
  return [Math.cos(r), 0, Math.sin(r)];
}

/** 3D position of the wall start at floor level. */
export function getWallStart3D(wall: Wall): [number, number, number] {
  const len = length(wall);
  const center = getWallPosition3D(wall);
  const dir = getWallDirection3D(wall);
  return [
    center[0] - (len / 2) * dir[0],
    center[1] - wall.height / 2,
    center[2] - (len / 2) * dir[2],
  ];
}
