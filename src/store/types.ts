export type WallMaterial = "brick" | "concrete" | "drywall";

/** Brick style variant; matches files in public/objs/brick01set (brick01a … brick01g). */
export type BrickVariant = "a" | "b" | "c" | "d" | "e" | "f" | "g";

export interface Point2D {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point2D;
  end: Point2D;
  height: number;
  thickness: number;
  material: WallMaterial;
  /** When material is "brick", which brick01 set to use (a–g). */
  brickVariant?: BrickVariant;
}
