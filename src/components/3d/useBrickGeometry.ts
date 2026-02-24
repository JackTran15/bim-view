"use client";

import { useState, useEffect } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import type { BufferGeometry, Group, Mesh, Object3D } from "three";
import { Matrix4 } from "three";
import { BRICK_LENGTH, BRICK_HEIGHT, BRICK_WIDTH } from "@/lib/constants";
import { BRICK_VARIANTS } from "@/lib/brick-config";
import type { BrickVariant } from "@/store/types";

/** OBJ brick01 approximate size in file units (X × Y × Z) */
const OBJ_SIZE = { x: 9, y: 4, z: 20 };

const scaleMatrix = new Matrix4().makeScale(
  BRICK_LENGTH / OBJ_SIZE.x,
  BRICK_HEIGHT / OBJ_SIZE.y,
  BRICK_WIDTH / OBJ_SIZE.z
);

function extractAndScaleGeometry(group: Group): BufferGeometry {
  let geometry: BufferGeometry | null = null;
  group.traverse((child: Object3D) => {
    if (geometry) return;
    const mesh = child as Mesh;
    if (mesh.geometry) {
      geometry = mesh.geometry.clone();
    }
  });
  if (!geometry) throw new Error("No geometry in OBJ");
  (geometry as BufferGeometry).applyMatrix4(scaleMatrix);
  return geometry as BufferGeometry;
}

/** Load all brick01 OBJs (a–g) and return scaled geometries. Cached per session. */
export function useBrickGeometries(): Partial<Record<BrickVariant, BufferGeometry>> {
  const [geometries, setGeometries] = useState<
    Partial<Record<BrickVariant, BufferGeometry>>
  >({});

  useEffect(() => {
    const loader = new OBJLoader();
    const variants: BrickVariant[] = ["a", "b", "c", "d", "e", "f", "g"];

    let cancelled = false;
    let done = 0;

    variants.forEach((v) => {
      const url = BRICK_VARIANTS[v].obj;
      loader.load(
        url,
        (group) => {
          if (cancelled) return;
          const geom = extractAndScaleGeometry(group);
          setGeometries((prev) => ({ ...prev, [v]: geom }));
        },
        undefined,
        () => {
          if (cancelled) return;
          done++;
        }
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return geometries;
}
