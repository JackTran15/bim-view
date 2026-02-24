import { create } from "zustand";
import type { Wall } from "./types";

export interface WallsState {
  walls: Wall[];
  selectedWallId: string | null;
  addWall: (wall: Wall) => void;
  updateWall: (id: string, partial: Partial<Pick<Wall, "start" | "end" | "height" | "thickness" | "material" | "brickVariant">>) => void;
  removeWall: (id: string) => void;
  setSelectedWallId: (id: string | null) => void;
}

const seedWalls: Wall[] = [
  {
    id: "wall-1",
    start: { x: 1, y: 1 },
    end: { x: 5, y: 1 },
    height: 2.5,
    thickness: 0.2,
    material: "brick",
    brickVariant: "a",
  },
  {
    id: "wall-2",
    start: { x: 5, y: 1 },
    end: { x: 5, y: 4 },
    height: 2.5,
    thickness: 0.15,
    material: "drywall",
  },
];

export const useWallsStore = create<WallsState>((set) => ({
  walls: seedWalls,
  selectedWallId: null,
  addWall: (wall) =>
    set((state) => ({ walls: [...state.walls, wall] })),
  updateWall: (id, partial) =>
    set((state) => ({
      walls: state.walls.map((w) =>
        w.id === id ? { ...w, ...partial } : w
      ),
    })),
  removeWall: (id) =>
    set((state) => ({
      walls: state.walls.filter((w) => w.id !== id),
      selectedWallId: state.selectedWallId === id ? null : state.selectedWallId,
    })),
  setSelectedWallId: (id) => set({ selectedWallId: id }),
}));
