"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import { Shape, ShapeGeometry, ExtrudeGeometry } from "three";
import type { BIMRoot, BIMWall, BIMLevel, BIMDoor, BIMSpace, Point2D } from "@/types/bim";
import { mmToM, segmentLength, segmentAngle, segmentCenterM, offsetPolygonInward, polygonCentroidM, isFinitePolygon, segmentWithDoorCuts, pointToSegmentDistSq } from "@/lib/bim-math";

const WALL_COLOR = "#ffffff";
const FLOOR_COLOR = "#1c1917";

/** Door opening height as fraction of wall height (0.7–0.8). Opening is this tall; rest is lintel (wall above). */
const DOOR_HEIGHT_RATIO = 0.75;
/** Default wall thickness (mm) when not available from level walls (e.g. for lintel). */
const DEFAULT_WALL_THICKNESS_MM = 200;

const DEFAULT_SPACE_COLORS = [
  "#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7",
  "#06b6d4", "#f97316", "#ec4899", "#84cc16", "#6366f1",
];

/** Deterministic color from space id (when space.color is not set). */
function spaceColor(space: BIMSpace): string {
  if (space.color) return space.color;
  let h = 0;
  for (let i = 0; i < space.id.length; i++) h = (h << 5) - h + space.id.charCodeAt(i);
  const idx = Math.abs(h) % DEFAULT_SPACE_COLORS.length;
  return DEFAULT_SPACE_COLORS[idx];
}

/** Small Y offset (m) so colored space floors sit above the gray FloorLevel and avoid z-fighting. */
const FLOOR_COLOR_OFFSET_Y = 0.003;

/** One floor polygon per space (room) at level elevation, with optional color. */
function SpaceFloor({
  space,
  elevationMm,
}: {
  space: BIMSpace;
  elevationMm: number;
}) {
  const { polygon } = space;
  const color = spaceColor(space);
  const geom = useMemo(() => {
    if (!isFinitePolygon(polygon)) return null;
    const scale = 1 / 1000;
    const shape = new Shape();
    shape.moveTo(polygon[0][0] * scale, -polygon[0][1] * scale);
    for (let i = 1; i < polygon.length; i++) {
      shape.lineTo(polygon[i][0] * scale, -polygon[i][1] * scale);
    }
    return new ShapeGeometry(shape);
  }, [polygon]);
  const y = mmToM(elevationMm) + FLOOR_COLOR_OFFSET_Y;
  if (!geom || !Number.isFinite(y)) return null;
  return (
    <mesh
      position={[0, y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geom}
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

/** Space name label at polygon centroid, slightly above floor. */
function SpaceLabel({
  space,
  elevationMm,
}: {
  space: BIMSpace;
  elevationMm: number;
}) {
  const [cx, cz] = polygonCentroidM(space.polygon);
  const y = mmToM(elevationMm) + 0.02;
  if (!Number.isFinite(cx) || !Number.isFinite(cz) || !Number.isFinite(y)) return null;
  return (
    <Text
      position={[cx, y, cz]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={0.2}
      color="#e4e4e7"
      anchorX="center"
      anchorY="middle"
      maxWidth={4}
    >
      {space.name}
    </Text>
  );
}

/** Full building floor (backdrop) so no gaps. Skips render if dimensions invalid. */
function FloorLevel({
  widthMm,
  depthMm,
  elevationMm,
}: {
  widthMm: number;
  depthMm: number;
  elevationMm: number;
}) {
  const w = mmToM(widthMm);
  const d = mmToM(depthMm);
  const y = mmToM(elevationMm);
  if (!Number.isFinite(w) || !Number.isFinite(d) || w <= 0 || d <= 0 || !Number.isFinite(y)) {
    return null;
  }
  return (
    <mesh
      position={[w / 2, y - 0.001, d / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={FLOOR_COLOR} roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

/** Extend segment endpoints by half thickness along the segment so corners overlap and fill gaps. */
function extendSegmentEnds(p0: Point2D, p1: Point2D, thicknessMm: number): { p0: Point2D; p1: Point2D } {
  const lenMm = segmentLength(p0, p1);
  if (lenMm < 1) return { p0, p1 };
  const half = thicknessMm / 2;
  const ux = (p1[0] - p0[0]) / lenMm;
  const uy = (p1[1] - p0[1]) / lenMm;
  return {
    p0: [p0[0] - ux * half, p0[1] - uy * half],
    p1: [p1[0] + ux * half, p1[1] + uy * half],
  };
}

function WallSegment({
  p0,
  p1,
  thicknessMm,
  heightMm,
  elevationMm,
  color = WALL_COLOR,
}: {
  p0: Point2D;
  p1: Point2D;
  thicknessMm: number;
  heightMm: number;
  elevationMm: number;
  color?: string;
}) {
  const { p0: p0Ext, p1: p1Ext } = extendSegmentEnds(p0, p1, thicknessMm);
  const len = mmToM(segmentLength(p0Ext, p1Ext));
  const thick = mmToM(thicknessMm);
  const h = mmToM(heightMm);
  const elev = mmToM(elevationMm);
  if (len <= 0 || !Number.isFinite(thick) || thick <= 0 || !Number.isFinite(h) || h <= 0) return null;
  const [cx, cz] = segmentCenterM(p0Ext, p1Ext);
  const rotY = -segmentAngle(p0Ext, p1Ext);
  return (
    <mesh
      position={[cx, elev + h / 2, cz]}
      rotation={[0, rotY, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[len, h, thick]} />
      <meshStandardMaterial color={color} roughness={0.92} metalness={0.05} />
    </mesh>
  );
}

/** Perimeter wall: polygon = outer footprint. Rendered as segments with door openings cut so doors are holes. */
function PerimeterWallRing({
  wall,
  elevationMm,
  doors,
}: {
  wall: BIMWall;
  elevationMm: number;
  doors: BIMDoor[];
}) {
  const { polygon, thickness, height } = wall;
  const distThreshold = thickness * 2;
  const segments = useMemo(() => {
    if (!isFinitePolygon(polygon)) return [];
    const out: { p0: Point2D; p1: Point2D }[] = [];
    for (let i = 0; i < polygon.length; i++) {
      const next = (i + 1) % polygon.length;
      const sub = segmentWithDoorCuts(polygon[i], polygon[next], doors, distThreshold);
      sub.forEach((seg) => out.push(seg));
    }
    return out;
  }, [polygon, doors, distThreshold]);
  if (segments.length === 0) return null;
  return (
    <>
      {segments.map(({ p0, p1 }, i) => (
        <WallSegment
          key={`${wall.id}-perim-${i}`}
          p0={p0}
          p1={p1}
          thicknessMm={thickness}
          heightMm={height}
          elevationMm={elevationMm}
        />
      ))}
    </>
  );
}

/** Internal wall: path = centerline; segments rendered with door openings cut out. */
function PathWallSegments({
  wall,
  elevationMm,
  doors,
}: {
  wall: BIMWall;
  elevationMm: number;
  doors: BIMDoor[];
}) {
  const { path, thickness, height } = wall;
  if (!path || path.length < 2) return null;
  const distThreshold = thickness * 2;
  return (
    <>
      {path.slice(0, -1).map((_, i) => {
        const p0 = path[i];
        const p1 = path[i + 1];
        const segments = segmentWithDoorCuts(p0, p1, doors, distThreshold);
        return segments.map((seg, j) => (
          <WallSegment
            key={`${wall.id}-path-${i}-${j}`}
            p0={seg.p0}
            p1={seg.p1}
            thicknessMm={thickness}
            heightMm={height}
            elevationMm={elevationMm}
          />
        ));
      })}
    </>
  );
}

/** Legacy: wall polygon as segment per edge, with door openings cut out. */
function WallSegments({
  wall,
  elevationMm,
  doors,
}: {
  wall: BIMWall;
  elevationMm: number;
  doors: BIMDoor[];
}) {
  const { polygon, thickness, height } = wall;
  const distThreshold = thickness * 2;
  const segments = useMemo(() => {
    const p = polygon ?? [];
    const out: { p0: Point2D; p1: Point2D }[] = [];
    for (let i = 0; i < p.length; i++) {
      const next = (i + 1) % p.length;
      const sub = segmentWithDoorCuts(p[i], p[next], doors, distThreshold);
      sub.forEach((seg) => out.push(seg));
    }
    return out;
  }, [polygon, doors, distThreshold]);
  if (segments.length === 0) return null;
  return (
    <>
      {segments.map(({ p0, p1 }, i) => (
        <WallSegment
          key={`${wall.id}-${i}`}
          p0={p0}
          p1={p1}
          thicknessMm={thickness}
          heightMm={height}
          elevationMm={elevationMm}
        />
      ))}
    </>
  );
}

/** Resolve wall thickness for a door by finding which wall segment the door lies on. */
function getWallThicknessForDoor(door: BIMDoor, walls: BIMWall[]): number {
  const pos = door.position;
  const thresholdMm = 400; // max distance to consider door on a wall
  const thresholdSq = thresholdMm * thresholdMm;
  for (const wall of walls) {
    const segments: { p0: Point2D; p1: Point2D }[] = [];
    if (wall.path && wall.path.length >= 2) {
      for (let i = 0; i < wall.path.length - 1; i++) segments.push({ p0: wall.path[i], p1: wall.path[i + 1] });
    } else if (wall.polygon && wall.polygon.length >= 2) {
      for (let i = 0; i < wall.polygon.length; i++) {
        const next = (i + 1) % wall.polygon.length;
        segments.push({ p0: wall.polygon[i], p1: wall.polygon[next] });
      }
    }
    for (const { p0, p1 } of segments) {
      if (pointToSegmentDistSq(pos, p0, p1) <= thresholdSq) return wall.thickness;
    }
  }
  const thicknesses = walls.map((w) => w.thickness).filter((t) => Number.isFinite(t) && t > 0);
  return thicknesses.length > 0 ? Math.min(...thicknesses) : DEFAULT_WALL_THICKNESS_MM;
}

/** Wall above the door opening (lintel) so the opening height is DOOR_HEIGHT_RATIO of wall height. */
function DoorLintel({
  door,
  elevationMm,
  wallHeightMm,
  wallThicknessMm,
}: {
  door: BIMDoor;
  elevationMm: number;
  wallHeightMm: number;
  wallThicknessMm: number;
}) {
  const openingHeight = wallHeightMm * DOOR_HEIGHT_RATIO;
  const lintelHeightMm = wallHeightMm - openingHeight;
  if (lintelHeightMm <= 0) return null;
  const w = mmToM(door.width);
  const h = mmToM(lintelHeightMm);
  const thick = mmToM(wallThicknessMm);
  const elev = mmToM(elevationMm);
  const x = mmToM(door.position[0]);
  const z = mmToM(door.position[1]);
  const centerY = elev + mmToM(openingHeight) + h / 2;
  const rotY = -(door.rotation * Math.PI) / 180;
  if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0 || !Number.isFinite(thick) || thick <= 0) return null;
  return (
    <mesh position={[x, centerY, z]} rotation={[0, rotY, 0]}>
      <boxGeometry args={[w, h, thick]} />
      <meshStandardMaterial color={WALL_COLOR} roughness={0.92} metalness={0.05} />
    </mesh>
  );
}

function LevelContent({ level }: { level: BIMLevel }) {
  const { elevation, height, spaces, walls, doors = [] } = level;
  const wallHeightMm = Number.isFinite(height) && height > 0 ? height : 3000;
  return (
    <>
      {spaces.map((space) => (
        <SpaceFloor key={space.id} space={space} elevationMm={elevation} />
      ))}
      {spaces.map((space) => (
        <SpaceLabel key={`label-${space.id}`} space={space} elevationMm={elevation} />
      ))}
      {walls.map((wall) =>
        wall.type === "perimeter" && wall.polygon?.length ? (
          <PerimeterWallRing key={wall.id} wall={wall} elevationMm={elevation} doors={doors} />
        ) : wall.path?.length ? (
          <PathWallSegments key={wall.id} wall={wall} elevationMm={elevation} doors={doors} />
        ) : wall.polygon?.length ? (
          <WallSegments key={wall.id} wall={wall} elevationMm={elevation} doors={doors} />
        ) : null
      )}
      {doors.map((door) => (
        <DoorLintel
          key={door.id}
          door={door}
          elevationMm={elevation}
          wallHeightMm={wallHeightMm}
          wallThicknessMm={getWallThicknessForDoor(door, walls)}
        />
      ))}
    </>
  );
}

/** Resolve building width/depth (mm) from building.footprint or building.width/depth. */
function getBuildingSize(building: BIMRoot["building"]): { widthMm: number; depthMm: number } {
  const w = building.footprint?.width ?? building.width ?? 10000;
  const d = building.footprint?.depth ?? building.depth ?? 10000;
  const widthMm = typeof w === "number" && Number.isFinite(w) && w > 0 ? w : 10000;
  const depthMm = typeof d === "number" && Number.isFinite(d) && d > 0 ? d : 10000;
  return { widthMm, depthMm };
}

function BIMSceneContent({ bim }: { bim: BIMRoot }) {
  const { building } = bim;
  const { widthMm, depthMm } = useMemo(() => getBuildingSize(building), [building]);
  const { levels } = building;
  const gridSize = useMemo(() => {
    const w = mmToM(widthMm);
    const d = mmToM(depthMm);
    const max = Math.max(w, d);
    const cells = Math.ceil(max / 2) * 2;
    return Math.max(10, Math.min(100, cells));
  }, [widthMm, depthMm]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <Grid
        args={[gridSize, gridSize]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#3f3f46"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#52525b"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid
      />
      {levels.map((level) => (
        <FloorLevel
          key={level.level}
          widthMm={widthMm}
          depthMm={depthMm}
          elevationMm={level.elevation}
        />
      ))}
      {levels.map((level) => (
        <LevelContent key={level.level} level={level} />
      ))}
    </>
  );
}

export default function BIMViewerScene({
  bim,
  className,
}: {
  bim: BIMRoot;
  className?: string;
}) {
  const { widthMm, depthMm } = useMemo(() => getBuildingSize(bim.building), [bim.building]);
  const w = mmToM(widthMm);
  const d = mmToM(depthMm);
  const { camPos, orbitTarget } = useMemo(() => {
    const centerX = w / 2;
    const centerZ = d / 2;
    // Camera height is 2x the building size
    const camHeight = Math.max(w, d) * 2;
    return {
      camPos: [centerX, camHeight, centerZ] as [number, number, number],
      orbitTarget: [centerX, 0, centerZ] as [number, number, number],
    };
  }, [w, d]);

  return (
    <div className={className ?? "w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-zinc-950"}>
      <Canvas
        camera={{ position: camPos, fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <BIMSceneContent bim={bim} />
        <OrbitControls
          makeDefault
          target={orbitTarget}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 - 0.1}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
