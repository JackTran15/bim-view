"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { BIMRoot, BIMLevel } from "@/types/bim";
import { SAMPLE_BIM_JSON } from "@/lib/sameple-bim";

const BIMViewerScene = dynamic(
  () => import("@/components/bim-viewer/BIMViewerScene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[400px] text-zinc-500 text-sm">
        Loading 3D viewer…
      </div>
    ),
  }
);

const SAMPLE_JSON = JSON.stringify(SAMPLE_BIM_JSON, null, 2);

function parseBIM(jsonStr: string): { data: BIMRoot } | { error: string } {
  try {
    const data = JSON.parse(jsonStr) as BIMRoot & { levels?: unknown[] };
    if (!data?.project) {
      return { error: "Invalid BIM: missing project" };
    }
    // Accept root-level "levels" when "building.levels" is missing (alternate schema)
    if (!data.building?.levels?.length && Array.isArray(data.levels) && data.levels.length > 0) {
      const rawLevels = data.levels as Array<Partial<BIMLevel> & { level?: number }>;
      data.building = {
        ...(data.building ?? {}),
        levels: rawLevels.map((lev, i): BIMLevel => ({
          level: typeof lev.level === "number" ? lev.level : i,
          elevation: typeof lev.elevation === "number" ? lev.elevation : 0,
          height: typeof lev.height === "number" ? lev.height : 2800,
          spaces: Array.isArray(lev.spaces) ? (lev.spaces as BIMLevel["spaces"]) : [],
          walls: Array.isArray(lev.walls) ? (lev.walls as BIMLevel["walls"]) : [],
          doors: Array.isArray(lev.doors) ? (lev.doors as BIMLevel["doors"]) : [],
        })),
      };
    }
    if (!data.building?.levels?.length) {
      return { error: "Invalid BIM: missing project or building.levels" };
    }
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

export default function BIMViewerPage() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const parsed = useMemo(() => parseBIM(jsonInput), [jsonInput]);

  return (
    <main className="min-h-screen flex flex-col p-4 gap-4 bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-semibold">BIM 3D Viewer</h1>
        <a
          href="/"
          className="text-sm text-zinc-400 hover:text-zinc-200 underline"
        >
          ← Back to Wall Editor
        </a>
      </header>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <section className="flex flex-col min-h-[300px] lg:min-h-0">
          <label className="text-sm text-zinc-400 mb-1 block">
            BIM JSON (paste or edit)
          </label>
          <textarea
            value={jsonInput}
            onChange={(e: { target: { value: string } }) => setJsonInput(e.target.value)}
            className="flex-1 min-h-[200px] w-full rounded-lg bg-zinc-900 border border-zinc-700 p-3 font-mono text-sm text-zinc-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
            placeholder="Paste BIM JSON here…"
            spellCheck={false}
          />
          {"error" in parsed && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {parsed.error}
            </p>
          )}
          {!("error" in parsed) && (
            <p className="mt-2 text-sm text-zinc-500">
              {parsed.data.project.name} · {parsed.data.building.levels.length} level(s)
            </p>
          )}
        </section>
        <section className="flex flex-col min-h-[400px] lg:min-h-0 rounded-lg border border-zinc-700 overflow-hidden bg-zinc-900">
          {!("error" in parsed) ? (
            <BIMViewerScene bim={parsed.data} className="flex-1 min-h-[400px]" />
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[400px] text-zinc-500 text-sm">
              Fix JSON errors to render 3D view
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
