"use client";

/// <reference path="../../global.d.ts" />
import { useWallsStore, WallsState } from "@/store/walls";
import { length, volume } from "@/lib/wall-math";
import { MATERIAL_COST_PER_M3, SNAP_GRID } from "@/lib/constants";
import { BRICK_VARIANT_OPTIONS } from "@/lib/brick-config";
import type { Wall, WallMaterial } from "@/store/types";
import type { BrickVariant } from "@/store/types";

const HEIGHT_MIN = 0.5;
const HEIGHT_MAX = 8;
const THICKNESS_MIN = 0.05;
const THICKNESS_MAX = 0.5;

const MATERIAL_OPTIONS: { value: WallMaterial; label: string }[] = [
  { value: "brick", label: "Brick" },
  { value: "concrete", label: "Concrete" },
  { value: "drywall", label: "Drywall" },
];

function snapToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export default function BIMInspector() {
  const walls = useWallsStore((s: WallsState) => s.walls);
  const selectedWallId = useWallsStore((s: WallsState) => s.selectedWallId);
  const setSelectedWallId = useWallsStore((s: WallsState) => s.setSelectedWallId);
  const updateWall = useWallsStore((s: WallsState) => s.updateWall);

  const wall = selectedWallId
    ? walls.find((w: Wall) => w.id === selectedWallId)
    : null;

  if (!wall) {
    return (
      <div className="p-4 text-zinc-500 text-sm text-center">
        Select a wall in the 2D or 3D view to edit properties and see derived data. Click empty space or press <span className="px-1 py-0.5 rounded bg-zinc-700 text-zinc-400">Esc</span> to deselect.
      </div>
    );
  }

  const len = length(wall);
  const vol = volume(wall);
  const cost = vol * MATERIAL_COST_PER_M3[wall.material as WallMaterial];

  const setHeight = (value: number) => {
    const clamped = Math.max(HEIGHT_MIN, Math.min(HEIGHT_MAX, value));
    const snapped = snapToStep(clamped, SNAP_GRID);
    updateWall(wall.id, { height: snapped });
  };

  const setThickness = (value: number) => {
    const clamped = Math.max(
      THICKNESS_MIN,
      Math.min(THICKNESS_MAX, value)
    );
    const snapped = snapToStep(clamped, SNAP_GRID);
    updateWall(wall.id, { thickness: snapped });
  };

  const setMaterial = (material: WallMaterial) => {
    updateWall(wall.id, { material });
  };

  const setBrickVariant = (brickVariant: BrickVariant) => {
    updateWall(wall.id, { brickVariant });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
        <h3 className="text-sm font-medium text-zinc-300">
          Wall: {wall.id}
        </h3>
        <button
          type="button"
          onClick={() => setSelectedWallId(null)}
          className="text-xs text-zinc-500 hover:text-zinc-300 focus:outline-none focus:underline"
        >
          Deselect
        </button>
      </div>

      {/* Editable: Height */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Height (m)</label>
        <input
          type="number"
          min={HEIGHT_MIN}
          max={HEIGHT_MAX}
          step={SNAP_GRID}
          value={wall.height}
          onChange={(e: { target: { value: string } }) => setHeight(Number(e.target.value))}
          className="w-full rounded bg-zinc-800 border border-zinc-600 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Editable: Thickness */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1">
          Thickness (m)
        </label>
        <input
          type="number"
          min={THICKNESS_MIN}
          max={THICKNESS_MAX}
          step={SNAP_GRID}
          value={wall.thickness}
          onChange={(e: { target: { value: string } }) => setThickness(Number(e.target.value))}
          className="w-full rounded bg-zinc-800 border border-zinc-600 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Editable: Material */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Material</label>
        <select
          value={wall.material}
          onChange={(e: { target: { value: string } }) => setMaterial(e.target.value as WallMaterial)}
          className="w-full rounded bg-zinc-800 border border-zinc-600 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {MATERIAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Editable: Brick style (only when material is brick) */}
      {wall.material === "brick" && (
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Brick style</label>
          <select
            value={wall.brickVariant ?? "a"}
            onChange={(e: { target: { value: string } }) => setBrickVariant(e.target.value as BrickVariant)}
            className="w-full rounded bg-zinc-800 border border-zinc-600 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {BRICK_VARIANT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Derived data (read-only) */}
      <div className="pt-2 border-t border-zinc-700">
        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
          Derived data
        </h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Length</span>
            <span className="text-zinc-200 tabular-nums">{len.toFixed(2)} m</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Volume</span>
            <span className="text-zinc-200 tabular-nums">{vol.toFixed(3)} m³</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Cost estimate</span>
            <span className="text-zinc-200 tabular-nums">${cost.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
