"use client";

import { useState, useEffect, useMemo } from "react";
import { TextureLoader, RepeatWrapping } from "three";
import type { Texture } from "three";
import {
  WALL_TEXTURES,
  WALL_TEXTURES_ENABLED,
} from "@/lib/texture-config";
import type { WallMaterial } from "@/store/types";

export interface LoadedTextureSet {
  map: Texture;
  normalMap: Texture | null;
  roughnessMap: Texture | null;
}

const loader = new TextureLoader();

function loadTexture(url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

function configureForTiling(tex: Texture): void {
  tex.wrapS = tex.wrapT = RepeatWrapping;
}

/** Load PBR texture sets only for materials in WALL_TEXTURES_ENABLED (avoids 404s when public/textures/ is empty). Returns null for others. */
export function useWallTextureSets(): Record<WallMaterial, LoadedTextureSet | null> {
  const [sets, setSets] = useState<Record<WallMaterial, LoadedTextureSet | null>>({
    brick: null,
    concrete: null,
    drywall: null,
  });

  useEffect(() => {
    const load = async (material: WallMaterial) => {
      if (!WALL_TEXTURES_ENABLED.includes(material)) return;
      const config = WALL_TEXTURES[material];
      try {
        const [map, normalMap, roughnessMap] = await Promise.all([
          loadTexture(config.map),
          config.normalMap ? loadTexture(config.normalMap) : Promise.resolve(null),
          config.roughnessMap ? loadTexture(config.roughnessMap) : Promise.resolve(null),
        ]);
        configureForTiling(map);
        if (normalMap) configureForTiling(normalMap);
        if (roughnessMap) configureForTiling(roughnessMap);
        setSets((prev) => ({ ...prev, [material]: { map, normalMap, roughnessMap } }));
      } catch {
        // Keep null; component will use flat color
      }
    };

    (["brick", "concrete", "drywall"] as WallMaterial[]).forEach(load);
  }, []);

  return sets;
}

/** Clone textures and set repeat for wall dimensions (tiles per meter). Caller must dispose clones when done. */
export function cloneTextureSetWithRepeat(
  set: LoadedTextureSet,
  lengthM: number,
  heightM: number,
  tilesPerMeter = 1
): LoadedTextureSet {
  const repeatX = lengthM * tilesPerMeter;
  const repeatY = heightM * tilesPerMeter;

  const map = set.map.clone();
  map.repeat.set(repeatX, repeatY);

  const normalMap = set.normalMap ? set.normalMap.clone() : null;
  if (normalMap) normalMap.repeat.set(repeatX, repeatY);

  const roughnessMap = set.roughnessMap ? set.roughnessMap.clone() : null;
  if (roughnessMap) roughnessMap.repeat.set(repeatX, repeatY);

  return { map, normalMap, roughnessMap };
}
