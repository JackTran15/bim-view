# SpaceLink – Implementation Plan

A phased plan to build the 2D/3D BIM editor from the PRD. Order is chosen so the 2D ↔ 3D sync loop works early, then we add selection and inspector.

---

## Constants & Conventions

| Concept | Value | Usage |
|--------|--------|--------|
| World unit | **1 unit = 1 meter** | All math in meters; pass to renderers as-is for 3D, scale for 2D. |
| 2D scale | **100 px/m** | `PIXELS_PER_METER = 100` for Konva. |
| Grid snap | **0.1 m** | `SNAP_GRID = 0.1`; snap handle positions. |
| 3D “up” | **Y axis** | Wall height → Y; 2D plane is XZ (X = 2D x, Z = 2D y). |

---

## Phase 0: Project Setup

**Goal:** Next.js app with TypeScript, deps, and base layout.

- [ ] Create Next.js 14+ (App Router) + TypeScript project.
- [ ] Install: `react-konva`, `konva`, `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `tailwindcss`.
- [ ] Configure Tailwind.
- [ ] Layout: single page with two main areas (2D canvas left/top, 3D viewport right/bottom) and a sidebar or panel for the BIM Inspector (Phase 3).

**Suggested structure:**

```
src/
  app/
    layout.tsx
    page.tsx
  components/
    2d/           # Konva stage, walls, handles
    3d/           # R3F scene, wall meshes, grid
    ui/           # Inspector panel, material selector, etc.
  store/          # Zustand store + types
  lib/            # wall math, snap, constants
```

---

## Phase A: Unified Data Model (BIM Source)

**Goal:** Single source of truth for walls; types and store in place.

- [ ] **Types:** Define `Wall` and any helper types (e.g. `Point2D`) in `store/types.ts` (or `lib/types.ts`).
- [ ] **Store:** Create Zustand store in `store/walls.ts` with:
  - `walls: Wall[]`
  - `selectedWallId: string | null`
  - `addWall(wall)`, `updateWall(id, partial)`, `removeWall(id)`, `setSelectedWallId(id | null)`
- [ ] **Math helpers** in `lib/wall-math.ts`:
  - `length(wall): number` (meters)
  - `volume(wall): number` (m³)
  - `snapToGrid(value, grid): number`
  - Optional: `getWallRotation(wall)`, `getWallCenter(wall)` for 3D (as per PRD “Smart Wall” math).
- [ ] **Constants:** `PIXELS_PER_METER`, `SNAP_GRID` in `lib/constants.ts` (or inside `lib/wall-math.ts`).
- [ ] Seed 1–2 walls in initial state so we can test 2D and 3D without adding UI first.

**Deliverable:** Store and math used by both 2D and 3D; no UI yet.

---

## Phase B: Interactive 2D Canvas (Phase 1)

**Goal:** Draw walls and drag handles with grid snap; all updates go through the store so 3D can react.

- [x] **Konva setup:** `<Stage>` + `<Layer>`; scale or offset so that 1 meter = 100 px (use `PIXELS_PER_METER`).
- [x] **Wall rectangles:** For each wall, draw a rectangle (or line with thickness):
  - Position/rotation from `wall.start` and `wall.end`; width = length, height = thickness (convert to px).
- [x] **Handles:** Two draggable shapes (e.g. circles) at `start` and `end` (in px).
- [x] **Drag behavior:**
  - On handle drag: compute new position in **meters** (divide by `PIXELS_PER_METER`), **snap** with `snapToGrid`, then `updateWall(id, { start: … }` or `{ end: … })`.
  - No local-only state: every move updates the store so 3D stays in sync.
- [x] **Grid snap:** Apply to both axes when updating `start` or `end`.

**Deliverable:** Dragging a handle in 2D updates the store and (once Phase C is done) the 3D view in real time.

---

## Phase C: Reactive 3D Viewport (Phase 2)

**Goal:** 3D view that mirrors the same walls and updates during 2D drag.

- [x] **R3F scene:** `<Canvas>` with camera (e.g. `OrbitControls` from drei), `GridHelper` (scale in meters).
- [x] **2D → 3D mapping:**
  - 2D `(x, y)` → 3D `(x, 0, y)` for floor plane; wall **height** → 3D **Y**.
- [x] **Wall mesh per wall:**
  - Geometry: `BoxGeometry(length, height, thickness)` (length from `length(wall)`).
  - Position: center at `[(start.x+end.x)/2, height/2, (start.y+end.y)/2]`.
  - Rotation: `Math.atan2(end.y - start.y, end.x - start.x)` around Y axis.
  - Material: `MeshStandardMaterial` (color or map by `wall.material` later).
- [x] **Reactivity:** Walls from Zustand; no local copy. When store updates (e.g. during handle drag), 3D re-renders immediately.
- [x] **Visuals:** GridHelper for scale; optional subtle ground plane.

**Deliverable:** Moving a wall in 2D updates the 3D box in real time; one source of truth.

---

## Phase D: BIM Inspector (Phase 3)

**Goal:** Select a wall in 2D or 3D and show derived data.

- [x] **Selection in 2D:** Click on wall or handle → `setSelectedWallId(wall.id)`.
- [x] **Selection in 3D:** Raycast on wall meshes (e.g. R3F `onClick` on mesh) → `setSelectedWallId(wall.id)`.
- [x] **Inspector panel:** When `selectedWallId` is set, show:
  - **Length** (m): `length(wall)`
  - **Volume** (m³): `volume(wall)`
  - **Cost estimate:** e.g. `volume(wall) * materialUnitCost[wall.material]` (define simple `materialUnitCost`: brick, concrete, drywall).
- [x] **Deselect:** Click empty space in 2D or 3D clears selection; Deselect button in inspector; Escape key clears selection.

**Deliverable:** Click wall → see length, volume, cost; selection shared between 2D and 3D.

---

## Phase E: Polish & Bonus (If Time)

- [ ] **Undo/Redo:** Zustand middleware (e.g. `temporal` or custom) for `updateWall`; bind Ctrl+Z / Ctrl+Shift+Z.
- [ ] **ContactShadows (drei):** Add under walls for a more “construction-ready” look.
- [ ] **WASM:** Optional small Rust crate for `volume` and cost; call from JS. Lower priority than a solid 2D/3D sync and inspector.

---

## Suggested Implementation Order (Summary)

1. **Phase 0** – Next.js, deps, layout.
2. **Phase A** – Types, store, wall math, constants, seed data.
3. **Phase B** – 2D canvas, walls, handles, drag + snap, store updates.
4. **Phase C** – 3D scene, wall meshes, position/rotation from store.
5. **Phase D** – Selection (2D + 3D), inspector UI (length, volume, cost).
6. **Phase E** – Undo/redo, shadows, optional WASM.

---

## Next Step

Start with **Phase 0** (scaffold) and **Phase A** (Zustand store + math helpers). Once those are in place, Phase B and C can be built in parallel or one after the other with minimal rework.

If you want, the next concrete step is: **generate the Zustand store, `Wall` type, and the wall-math helpers** (length, volume, snap, and the 3D position/rotation helpers) so you can plug them into the 2D and 3D components.
