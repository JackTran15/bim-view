# SpaceLink – 2D/3D BIM Editor

Real-time wall geometry editor: manipulate walls in 2D and see 3D update live. Built with Next.js 14, React-Konva, Three.js (R3F), and Zustand.

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- **`src/store/`** – Zustand store (`walls`, `selectedWallId`) and `Wall` type
- **`src/lib/`** – `constants` (PIXELS_PER_METER, SNAP_GRID), `wall-math` (length, volume, snap, 3D position/rotation)
- **`src/app/`** – App Router layout and page (placeholders for 2D, 3D, Inspector)
- **`PLAN.md`** – Phased implementation plan

## Implemented

- **Phase 0:** Next.js 14 (App Router), TypeScript, Tailwind, deps (Konva, R3F, Zustand)
- **Phase A:** Unified data model (types, store with seed walls, wall-math helpers)

## Next

- **Phase B:** Interactive 2D canvas (Konva walls + draggable handles, grid snap)
- **Phase C:** Reactive 3D viewport (R3F boxes from store)
- **Phase D:** BIM Inspector (selection, length/volume/cost)

See `requirements.md` and `PLAN.md` for full spec.
