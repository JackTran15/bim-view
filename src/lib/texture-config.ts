import type { WallMaterial } from "@/store/types";

/**
 * PBR texture sets for box walls (concrete, drywall).
 * Brick walls use instanced bricks from public/objs/brick01set instead.
 *
 * Paths point to public/textures/ — add files there and list materials in
 * WALL_TEXTURES_ENABLED to avoid 404s. When disabled or missing, walls use WALL_COLORS.
 */
export interface TextureSet {
  map: string;
  normalMap?: string;
  roughnessMap?: string;
}

const BASE = "/textures";

/** Only load textures for these materials (files must exist in public/textures/). Empty = no requests, flat colors only. */
export const WALL_TEXTURES_ENABLED: WallMaterial[] = [];

export const WALL_TEXTURES: Record<WallMaterial, TextureSet> = {
  brick: {
    map: `${BASE}/brick/Bricks034_1K-JPG_Color.jpg`,
    normalMap: `${BASE}/brick/Bricks034_1K-JPG_NormalDX.jpg`,
    roughnessMap: `${BASE}/brick/Bricks034_1K-JPG_Roughness.jpg`,
  },
  concrete: {
    map: `${BASE}/concrete/Concrete046_1K-JPG_Color.jpg`,
    normalMap: `${BASE}/concrete/Concrete046_1K-JPG_NormalDX.jpg`,
    roughnessMap: `${BASE}/concrete/Concrete046_1K-JPG_Roughness.jpg`,
  },
  drywall: {
    map: `${BASE}/drywall/Plaster005_1K-JPG_Color.jpg`,
    normalMap: `${BASE}/drywall/Plaster005_1K-JPG_NormalDX.jpg`,
    roughnessMap: `${BASE}/drywall/Plaster005_1K-JPG_Roughness.jpg`,
  },
};

/** Fallback flat colors when textures are disabled or fail to load */
export const WALL_COLORS: Record<WallMaterial, string> = {
  brick: "#8b6356",
  concrete: "#6b7280",
  drywall: "#d6d3d1",
};
