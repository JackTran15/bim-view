"use client";

import { useCallback } from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
import type Konva from "konva";
import { useWallsStore } from "@/store/walls";
import { PIXELS_PER_METER } from "@/lib/constants";
import {
  length,
  getWallRotation,
  getWallCenter,
  snapToGrid,
} from "@/lib/wall-math";
import type { Wall } from "@/store/types";

const PADDING = 40;
const HANDLE_RADIUS = 8;

function mToPx(m: number): number {
  return m * PIXELS_PER_METER;
}

function pxToM(px: number): number {
  return px / PIXELS_PER_METER;
}

function WallRect({
  wall,
  isSelected,
  onSelect,
}: {
  wall: Wall;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const len = length(wall);
  const center = getWallCenter(wall);
  const rotationRad = getWallRotation(wall);
  const rotationDeg = (rotationRad * 180) / Math.PI;

  const widthPx = mToPx(len);
  const heightPx = mToPx(wall.thickness);
  const x = mToPx(center.x);
  const y = mToPx(center.y);

  return (
    <Rect
      x={x}
      y={y}
      width={widthPx}
      height={heightPx}
      offsetX={widthPx / 2}
      offsetY={heightPx / 2}
      rotation={rotationDeg}
      fill={isSelected ? "#52525b" : "#71717a"}
      stroke={isSelected ? "#3b82f6" : "#52525b"}
      strokeWidth={isSelected ? 2 : 1}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}

function WallHandles({ wall }: { wall: Wall }) {
  const updateWall = useWallsStore((s) => s.updateWall);
  const setSelectedWallId = useWallsStore((s) => s.setSelectedWallId);

  const applySnap = useCallback((px: number) => snapToGrid(pxToM(px)), []);

  const handleDragMove = useCallback(
    (which: "start" | "end") => (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const x = applySnap(node.x());
      const y = applySnap(node.y());
      if (which === "start") {
        updateWall(wall.id, { start: { x, y } });
      } else {
        updateWall(wall.id, { end: { x, y } });
      }
    },
    [wall.id, updateWall, applySnap]
  );

  const startX = mToPx(wall.start.x);
  const startY = mToPx(wall.start.y);
  const endX = mToPx(wall.end.x);
  const endY = mToPx(wall.end.y);

  return (
    <>
      <Circle
        x={startX}
        y={startY}
        radius={HANDLE_RADIUS}
        fill="#a1a1aa"
        stroke="#3b82f6"
        strokeWidth={2}
        draggable
        onDragMove={handleDragMove("start")}
        onDragEnd={handleDragMove("start")}
        onClick={() => setSelectedWallId(wall.id)}
      />
      <Circle
        x={endX}
        y={endY}
        radius={HANDLE_RADIUS}
        fill="#a1a1aa"
        stroke="#3b82f6"
        strokeWidth={2}
        draggable
        onDragMove={handleDragMove("end")}
        onDragEnd={handleDragMove("end")}
        onClick={() => setSelectedWallId(wall.id)}
      />
    </>
  );
}

export default function Canvas2D() {
  const walls = useWallsStore((s) => s.walls);
  const selectedWallId = useWallsStore((s) => s.selectedWallId);
  const setSelectedWallId = useWallsStore((s) => s.setSelectedWallId);

  const stageWidth = 640;
  const stageHeight = 520;

  return (
    <Stage
      width={stageWidth}
      height={stageHeight}
      className="rounded-lg"
      onClick={(e) => {
        const target = e.target as { getClassName?: () => string };
        const name = target.getClassName?.();
        if (name === "Layer" || name === "Stage") setSelectedWallId(null);
      }}
    >
      <Layer x={PADDING} y={PADDING}>
        {walls.map((wall) => (
          <WallRect
            key={wall.id}
            wall={wall}
            isSelected={selectedWallId === wall.id}
            onSelect={() => setSelectedWallId(wall.id)}
          />
        ))}
        {walls.map((wall) => (
          <WallHandles key={`handles-${wall.id}`} wall={wall} />
        ))}
      </Layer>
    </Stage>
  );
}
