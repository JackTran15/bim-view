"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useWallsStore } from "@/store/walls";
import { length, getWallPosition3D, getWallRotation } from "@/lib/wall-math";
import { WALL_COLORS } from "@/lib/texture-config";
import {
  useWallTextureSets,
  cloneTextureSetWithRepeat,
  type LoadedTextureSet,
} from "./useWallTextures";
import { useBrickGeometries } from "./useBrickGeometry";
import { BrickWallInstanced, getBrickCount } from "./BrickWallInstanced";
import type { Wall } from "@/store/types";
import type { WallMaterial } from "@/store/types";

function WallMesh({
  wall,
  isSelected,
  onSelect,
  textureSet,
}: {
  wall: Wall;
  isSelected: boolean;
  onSelect: () => void;
  textureSet: LoadedTextureSet | null;
}) {
  const len = length(wall);
  const position = getWallPosition3D(wall);
  const rotationY = -getWallRotation(wall);
  const disposeRef = useRef<LoadedTextureSet | null>(null);

  const clonedSet = useMemo(() => {
    if (!textureSet) return null;
    const cloned = cloneTextureSetWithRepeat(textureSet, len, wall.height, 1);
    return cloned;
  }, [textureSet, len, wall.height]);

  useEffect(() => {
    return () => {
      if (disposeRef.current) {
        disposeRef.current.map.dispose();
        if (disposeRef.current.normalMap) disposeRef.current.normalMap.dispose();
        if (disposeRef.current.roughnessMap)
          disposeRef.current.roughnessMap.dispose();
      }
    };
  }, []);

  useEffect(() => {
    disposeRef.current = clonedSet;
  }, [clonedSet]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  const color = isSelected ? "#3b82f6" : WALL_COLORS[wall.material];

  return (
    <mesh
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={handleClick}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[len, wall.height, wall.thickness]} />
      {clonedSet ? (
        <meshStandardMaterial
          map={clonedSet.map}
          normalMap={clonedSet.normalMap ?? undefined}
          roughnessMap={clonedSet.roughnessMap ?? undefined}
          metalness={0.05}
          roughness={0.9}
          color={isSelected ? "#3b82f6" : "#ffffff"}
        />
      ) : (
        <meshStandardMaterial
          color={color}
          metalness={0.1}
          roughness={0.8}
        />
      )}
    </mesh>
  );
}

function GroundPlane() {
  const setSelectedWallId = useWallsStore((s) => s.setSelectedWallId);
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={() => setSelectedWallId(null)}
      receiveShadow
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        color="#18181b"
        transparent
        opacity={0.001}
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene() {
  const walls = useWallsStore((s) => s.walls);
  const selectedWallId = useWallsStore((s) => s.selectedWallId);
  const setSelectedWallId = useWallsStore((s) => s.setSelectedWallId);
  const textureSets = useWallTextureSets();
  const brickGeometries = useBrickGeometries();

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <GroundPlane />
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#3f3f46"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#52525b"
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid
      />
      {walls.map((wall) => {
        const variant = wall.material === "brick" ? (wall.brickVariant ?? "a") : null;
        const brickGeometry = variant ? brickGeometries[variant] ?? brickGeometries.a : null;
        return wall.material === "brick" && brickGeometry && variant ? (
          <BrickWallInstanced
            key={wall.id}
            wall={wall}
            geometry={brickGeometry}
            variant={variant}
            isSelected={selectedWallId === wall.id}
            onSelect={() => setSelectedWallId(wall.id)}
          />
        ) : (
          <WallMesh
            key={wall.id}
            wall={wall}
            isSelected={selectedWallId === wall.id}
            onSelect={() => setSelectedWallId(wall.id)}
            textureSet={textureSets[wall.material]}
          />
        );
      })}
    </>
  );
}

export default function Viewport3D() {
  const walls = useWallsStore((s) => s.walls);
  const totalBricks = useMemo(() => {
    return walls
      .filter((w) => w.material === "brick")
      .reduce(
        (sum, w) =>
          sum + getBrickCount(length(w), w.height, w.thickness).total,
        0
      );
  }, [walls]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-zinc-950 relative">
      {totalBricks > 0 && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-zinc-300 text-xs font-mono z-10">
          Bricks: {totalBricks.toLocaleString()} instances
        </div>
      )}
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <Scene />
        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 - 0.1}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
