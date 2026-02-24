# SpaceLink – Repository Overview

**SpaceLink** is a real-time 2D/3D BIM (Building Information Model) application. You can edit walls in 2D and see 3D updates live, and **view full building designs in 3D from BIM JSON**. The stack is Next.js 14, React, React-Konva (2D), Three.js via React Three Fiber (3D), and Zustand.

---

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use **BIM 3D Viewer →** in the header or go to [http://localhost:3000/bim-viewer](http://localhost:3000/bim-viewer).

---

## Project structure

| Path | Description |
|------|-------------|
| `src/app/` | Next.js App Router: `page.tsx` (home: 2D + 3D editor), `bim-viewer/page.tsx` (BIM 3D viewer) |
| `src/components/2d/` | 2D canvas (Konva) for wall editing |
| `src/components/3d/` | 3D viewport and brick wall rendering (home page) |
| `src/components/bim-viewer/` | **BIM 3D viewer scene** (spaces, walls, doors) |
| `src/components/ui/` | BIM Inspector (selection, length/volume/cost) |
| `src/store/` | Zustand store (walls, selection) for the 2D/3D editor |
| `src/types/` | TypeScript types, including **BIM schema** (`bim.ts`) |
| `src/lib/` | **`bim-math.ts`** (BIM geometry), `wall-math`, constants, brick config, sample BIM |

---

# BIM 3D Viewer (focus)

The BIM viewer renders a building in 3D from a single JSON input. It is the main “from-data” visualization path, separate from the interactive 2D wall editor.

## Route and page

- **Route:** `/bim-viewer`
- **Page:** `src/app/bim-viewer/page.tsx`
  - Left: textarea for **BIM JSON** (paste or edit).
  - Right: **3D canvas** (React Three Fiber) showing the building.
  - Parsing and validation: invalid JSON or missing `project` / `building.levels` shows an error; valid data drives the scene.

The page accepts either:

- The standard shape: `building.levels[]` with `spaces`, `walls`, `doors` per level.
- An alternate shape: root-level `levels[]`; the parser normalizes it into `building.levels`.

## BIM JSON schema (types)

All linear dimensions in the schema are in **millimeters** unless noted. Types live in `src/types/bim.ts`.

| Entity | Main fields | Notes |
|--------|-------------|--------|
| **Project** | `name`, `units`, `defaultWallThickness`, `defaultHeight` | Metadata |
| **Building** | `footprint: { width, depth }` or `width` / `depth`, `levels[]` | Size in mm |
| **Level** | `level`, `elevation`, `height`, `spaces[]`, `walls[]`, `doors[]` | One floor |
| **Space** | `id`, `name`, `area`, `polygon` (2D ring), optional `color` | Room footprint |
| **Wall** | `id`, `type`, `thickness`, `height`, `polygon` and/or `path` | See below |
| **Door** | `id`, `width`, `height`, `position` [x,y], `rotation` (degrees) | Plan position |

### Walls

- **Perimeter:** `type: "perimeter"`, `polygon` = outer footprint (closed ring). Rendered as segment boxes with door holes; segment ends are extended by half thickness so corners meet.
- **Internal (path):** `path` = list of 2D points (centerline). Each segment is extruded with `thickness` and `height`. Door openings are cut from segments.
- **Legacy polygon wall:** `polygon` only (no path) → each edge is a segment, again with door cuts.

### Spaces vs walls

- **`spaces[].polygon`** = room boundary (floor area only). Used for colored floor surfaces and labels, **not** for wall geometry.
- **`walls[].polygon`** = outer wall footprint (perimeter) or edge list.
- **`walls[].path`** = wall centerline for internal walls.

## Parsing

- **`parseBIM(jsonStr)`** in `bim-viewer/page.tsx`:
  - Parses JSON and ensures `project` and `building.levels` exist (creating `building.levels` from root `levels` if needed).
  - Normalizes each level: `elevation`, `height`, `spaces`, `walls`, `doors` (defaulting empty arrays).
  - Returns `{ data: BIMRoot }` or `{ error: string }`.

## 3D scene (`BIMViewerScene`)

**File:** `src/components/bim-viewer/BIMViewerScene.tsx`

The scene is built in **meters** and **Y-up**: plan coordinates `(x, y)` in mm map to world **X** and **-Z** (so +Y in plan is -Z in 3D).

### Constants (tunable)

| Constant | Value | Purpose |
|----------|--------|---------|
| `DOOR_HEIGHT_RATIO` | `0.75` | Door opening height = 75% of wall height; top 25% is lintel |
| `DEFAULT_WALL_THICKNESS_MM` | `200` | Fallback when a door’s host wall cannot be resolved |

### Rendered elements

1. **Spaces (rooms)**  
   - **SpaceFloor:** each `space.polygon` → `THREE.ShapeGeometry` at level elevation; color from `space.color` or derived from `space.id`.  
   - **SpaceLabel:** room name at polygon centroid (via `@react-three/drei` `Text`), flat on the floor.

2. **Building floor**  
   - **FloorLevel:** one plane per level at `elevation`, size from building `footprint` (or `width`/`depth`), slightly below space floors to avoid z-fight.

3. **Walls**  
   - **WallSegment:** one box per segment; length from segment length, thickness and height from wall. Endpoints are **extended by half thickness** along the segment so corners close without gaps.  
   - **PerimeterWallRing:** perimeter walls are rendered as **segments** (one segment per polygon edge), with door openings cut out.  
   - **PathWallSegments:** path walls → one segment per path segment, with door cuts.  
   - **WallSegments:** polygon (non-path) walls → one segment per polygon edge, with door cuts.

4. **Doors**  
   - Doors are **holes only**: wall geometry is split so no mesh is drawn where the door is (using `segmentWithDoorCuts`).  
   - **DoorLintel:** for each door, a box is drawn **above** the opening so the opening height is `DOOR_HEIGHT_RATIO` of the wall height. Lintel thickness is resolved per door by finding which wall segment the door lies on (`getWallThicknessForDoor`).

### Camera and controls

- Camera position is derived from building size.
- **OrbitControls** (R3F/drei): orbit, pan, limit polar angle so the view stays above the plan.
- Infinite grid, ambient + directional light with shadows.

---

## BIM math (`src/lib/bim-math.ts`)

Shared geometry and conversion helpers (all in mm unless noted):

| Function | Purpose |
|----------|---------|
| `mmToM(mm)` | mm → meters |
| `isFinitePoint(p)`, `isFinitePolygon(polygon)` | Guard against invalid/NaN data |
| `segmentLength(p0, p1)` | Segment length (same units as input) |
| `segmentAngle(p0, p1)` | Angle in radians (for Y rotation) |
| `segmentCenterM(p0, p1)` | Segment center in meters [X, Z] |
| `polygonCentroidM(polygon)` | Polygon centroid in meters |
| `offsetPolygonInward(polygon, thicknessMm)` | Inward offset for convex polygons (e.g. perimeter inner edge) |
| `pointToSegmentDistSq(p, p0, p1)` | Squared distance from point to segment (used to resolve door → wall) |
| `segmentWithDoorCuts(p0, p1, doors, distThresholdMm)` | Splits segment into sub-segments with door openings removed; used for walls so doors are true holes |

Invalid or undefined points are handled (e.g. `segmentLength` returns 0, `segmentWithDoorCuts` returns [] or safe segments).

---

## Sample BIM

`src/lib/sameple-bim.ts` exports **`SAMPLE_BIM_JSON`**: a small 10×10 m house with one level, multiple spaces (living, kitchen, bedrooms, bathroom, hall, entry), perimeter wall, internal partition walls (path-based), and doors. It is used as the default textarea content on `/bim-viewer` so you can load the page and see a full example immediately.

---

## Rest of the repo (short)

- **Home (`/`):** 2D canvas (Konva) to edit walls, 3D viewport (R3F) that reflects the same walls, and a BIM Inspector for selection, length, volume, and cost. Data lives in a Zustand store (`src/store/walls.ts`, `types` in `store/types.ts`).
- **3D bricks:** `BrickWallInstanced`, `useBrickGeometry`, `useBrickTextures`, and brick/texture config in `src/lib/` drive the brick-style wall rendering on the home 3D viewport, not the BIM viewer.
- **Wall math:** `src/lib/wall-math.ts` and `constants.ts` support the 2D editor (snap, length, volume, 3D placement).

For full implementation plans and requirements, see `PLAN.md` and `requirements.md` in the repo root.
