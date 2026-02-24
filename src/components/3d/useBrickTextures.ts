"use client";

import { useState, useEffect } from "react";
import { TextureLoader, RepeatWrapping, SRGBColorSpace } from "three";
import type { Texture } from "three";
import {
  BRICK_VARIANTS,
  BRICK_VARIANTS_WITH_TEXTURES,
} from "@/lib/brick-config";
import type { BrickVariant } from "@/store/types";

const loader = new TextureLoader();

export interface BrickTextureSet {
  color: Texture;
  normalMap: Texture | null;
}

/** Load color + normal map for one brick variant. Only requests URLs when variant is in BRICK_VARIANTS_WITH_TEXTURES (avoids 404s). Uses color map alone if normal map fails. */
export function useBrickTextures(
  variant: BrickVariant | undefined
): BrickTextureSet | null {
  const [set, setSet] = useState<BrickTextureSet | null>(null);

  useEffect(() => {
    if (!variant || !BRICK_VARIANTS_WITH_TEXTURES.includes(variant)) {
      setSet(null);
      return;
    }
    const { color: colorUrl, nmap: nmapUrl } = BRICK_VARIANTS[variant];
    let cancelled = false;

    Promise.all([
      new Promise<Texture | null>((resolve) => {
        loader.load(colorUrl, resolve, undefined, () => resolve(null));
      }),
      new Promise<Texture | null>((resolve) => {
        loader.load(nmapUrl, resolve, undefined, () => resolve(null));
      }),
    ]).then(([color, normalMap]) => {
      if (cancelled || !color) {
        if (color) color.dispose();
        if (normalMap) normalMap.dispose();
        if (!cancelled) setSet(null);
        return;
      }
      color.wrapS = color.wrapT = RepeatWrapping;
      color.colorSpace = SRGBColorSpace;
      if (normalMap) {
        normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
      } else {
        normalMap = null;
      }
      if (!cancelled) setSet({ color, normalMap });
    });

    return () => {
      cancelled = true;
      setSet((prev) => {
        if (prev) {
          prev.color.dispose();
          if (prev.normalMap) prev.normalMap.dispose();
        }
        return null;
      });
    };
  }, [variant]);

  return set;
}
