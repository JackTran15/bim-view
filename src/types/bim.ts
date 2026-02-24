/** BIM JSON schema types. All linear dimensions in schema are in project units (e.g. mm). */

export type Point2D = [number, number]; // [x, y] in project units

export interface BIMProject {
  name: string;
  units: string;
  defaultWallThickness: number;
  defaultHeight: number;
}

export interface BIMSpace {
  id: string;
  name: string;
  area: number;
  polygon: Point2D[];
  /** Optional fill color (e.g. "#4a5568"). If omitted, a color is derived from id. */
  color?: string;
}

export interface BIMWall {
  id: string;
  type: string;
  thickness: number;
  height: number;
  /** Outer wall footprint (for perimeter). Offset inward by thickness to get inner edge. */
  polygon?: Point2D[];
  /** Wall centerline (for internal walls). Extruded with thickness and height. */
  path?: Point2D[];
}

export interface BIMDoor {
  id: string;
  width: number;
  height: number;
  position: Point2D;
  rotation: number; // degrees
}

export interface BIMLevel {
  level: number;
  elevation: number;
  height: number;
  spaces: BIMSpace[];
  walls: BIMWall[];
  doors?: BIMDoor[];
}

export interface BIMBuilding {
  /** Building width (mm). Used when footprint is not set. */
  width?: number;
  /** Building depth (mm). Used when footprint is not set. */
  depth?: number;
  /** Optional footprint; takes precedence over width/depth when present. */
  footprint?: { width: number; depth: number };
  levels: BIMLevel[];
}

export interface BIMRoot {
  project: BIMProject;
  building: BIMBuilding;
}
