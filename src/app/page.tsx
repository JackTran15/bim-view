"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import BIMInspector from "@/components/ui/BIMInspector";
import { useWallsStore } from "@/store/walls";

const Canvas2D = dynamic(() => import("@/components/2d/Canvas2D"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
      Loading 2D canvas…
    </div>
  ),
});

const Viewport3D = dynamic(() => import("@/components/3d/Viewport3D"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[400px] text-zinc-500 text-sm">
      Loading 3D viewport…
    </div>
  ),
});

export default function Home() {
  const setSelectedWallId = useWallsStore((s) => s.setSelectedWallId);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedWallId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSelectedWallId]);

  return (
    <main className="min-h-screen grid grid-cols-2 grid-rows-[auto_1fr_1fr] gap-4 p-4 max-h-90dvh w-full">
      <header className="col-span-2 flex justify-end">
        <a href="/bim-viewer" className="text-sm text-zinc-400 hover:text-zinc-200 underline">
          BIM 3D Viewer →
        </a>
      </header>
      {/* 2D Canvas area */}
      <section className="col-span-1 row-span-1 bg-zinc-900/80 rounded-lg border border-zinc-700 flex items-center justify-center min-h-[400px]">
        <Canvas2D />
      </section>
      {/* 3D Viewport */}
      <section className="col-span-1 row-span-1 bg-zinc-900/80 rounded-lg border border-zinc-700 flex items-center justify-center min-h-[400px]">
        <Viewport3D />
      </section>
      {/* BIM Inspector: selected wall props + length, volume, cost */}
      <section className="col-span-2 row-span-1 bg-zinc-900/80 rounded-lg border border-zinc-700 min-h-[120px]">
        <BIMInspector />
      </section>
    </main>
  );
}
