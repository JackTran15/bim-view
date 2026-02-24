"use client";

import { useRef, useLayoutEffect, useMemo } from "react";
import type { InstancedMesh } from "three";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import {
  length,
  getWallStart3D,
  getWallDirection3D,
  getWallRotation,
} from "@/lib/wall-math";
import { BRICK_LENGTH, BRICK_HEIGHT, BRICK_WIDTH } from "@/lib/constants";
import type { Wall } from "@/store/types";
import type { BrickVariant } from "@/store/types";
import type { BufferGeometry } from "three";
import { useBrickTextures } from "./useBrickTextures";

const _pos = new Vector3();
const _quat = new Quaternion();
const _euler = new Euler(0, 0, 0);
const _scale = new Vector3(1, 1, 1);
const _matrix = new Matrix4();

const MAX_INSTANCES_PER_MESH = 65535;

export function getBrickCount(
  wallLength: number,
  wallHeight: number,
  wallThickness: number
): { nLength: number; nHeight: number; nLayers: number; total: number } {
  const nLength = Math.max(1, Math.floor(wallLength / BRICK_LENGTH));
  const nHeight = Math.max(1, Math.floor(wallHeight / BRICK_HEIGHT));
  const nLayers = Math.max(1, Math.floor(wallThickness / BRICK_WIDTH));
  const total = Math.min(
    nLength * nHeight * nLayers,
    MAX_INSTANCES_PER_MESH
  );
  return { nLength, nHeight, nLayers, total };
}

interface BrickWallInstancedProps {
  wall: Wall;
  geometry: BufferGeometry;
  variant: BrickVariant;
  isSelected: boolean;
  onSelect: () => void;
}

export function BrickWallInstanced({
  wall,
  geometry,
  variant,
  isSelected,
  onSelect,
}: BrickWallInstancedProps) {
  const ref = useRef<InstancedMesh>(null);
  const textures = useBrickTextures(variant);
  const len = length(wall);
  const start = getWallStart3D(wall);
  const dir = getWallDirection3D(wall);
  const rotY = -getWallRotation(wall);
  const { nLength, nHeight, nLayers, total } = useMemo(
    () => getBrickCount(len, wall.height, wall.thickness),
    [len, wall.height, wall.thickness]
  );

  useLayoutEffect(() => {
    if (!ref.current || total === 0) return;
    // instantiate the bricks
    const mesh = ref.current;

    // get the wall direction
    const wallDirX = dir[0];
    const wallDirZ = dir[2];
    const perpX = -dir[2];
    const perpZ = dir[0];
    let i = 0;
    for (let layer = 0; layer < nLayers; layer++) {
      for (let row = 0; row < nHeight; row++) {
        const stagger = (row % 2) * (BRICK_LENGTH * 0.5);
        for (let col = 0; col < nLength; col++) {
          // calculate the position of the brick
          const posX = start[0] + (col * BRICK_LENGTH + stagger) * wallDirX + layer * BRICK_WIDTH * perpX;
          const posY = start[1] + row * BRICK_HEIGHT;
          const posZ = start[2] + (col * BRICK_LENGTH + stagger) * wallDirZ + layer * BRICK_WIDTH * perpZ;
          _pos.set(posX, posY, posZ);
          // calculate the rotation of the brick
          _euler.set(0, rotY, 0);
          // calculate the quaternion of the brick
          _quat.setFromEuler(_euler);
          // calculate the matrix of the brick
          _matrix.compose(_pos, _quat, _scale);
          // set the matrix of the brick
          mesh.setMatrixAt(i, _matrix);
          // increment the index
          i++;
        }
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.count = total;
  }, [start, dir, rotY, nLength, nHeight, nLayers, total]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  const count = Math.max(total, 1);

  return (
    <group>
      <instancedMesh
        ref={ref}
        args={[geometry, undefined, count]}
        castShadow
        receiveShadow
        onClick={handleClick}
      >
        <meshStandardMaterial
          map={textures?.color ?? undefined}
          normalMap={textures?.normalMap ?? undefined}
          color={isSelected ? "#3b82f6" : textures ? "#ffffff" : "#8b6356"}
          metalness={0.05}
          roughness={0.85}
        />
      </instancedMesh>
    </group>
  );
}
