This is a professional-grade **Project Requirements Document (PRD)**. You can treat this as a self-imposed "Take-Home Challenge." If you complete even 80% of this, you will be ahead of 90% of other candidates.

---

# Project Challenge: "SpaceLink" – Real-time 2D/3D BIM Engine

## 1. Project Overview

The goal is to build a "Vertical Slice" of an interior design tool. You will create a web-based editor where a user can manipulate wall geometry in 2D and see a high-fidelity, data-rich 3D representation update in real-time.

## 2. Technical Stack Recommendation

To align with Spacejot’s tech stack, use the following:

* **Framework:** Next.js 14+ (App Router) with TypeScript.
* **2D Engine:** `Konva.js` or `React-Konva` (Best for canvas-based object manipulation).
* **3D Engine:** `Three.js` with `@react-three/fiber` and `@react-three/drei`.
* **State Management:** `Zustand` (Ideal for high-frequency updates across different renderers).
* **Styling:** Tailwind CSS.

---

## 3. Core Requirements

### A. The Unified Data Model (The BIM Source)

Define a central store that represents the architectural "Truth."

* **State Shape:** ```typescript
interface Wall {
id: string;
start: { x: number; y: number }; // 2D Coordinates (meters)
end: { x: number; y: number };
height: number;
thickness: number;
material: 'brick' | 'concrete' | 'drywall';
}
```


```



### B. Phase 1: Interactive 2D Canvas

* **Rendering:** Draw walls as rectangles based on the `thickness` property.
* **Interaction:** * Implement "Handles" at the `start` and `end` points.
* Users should be able to drag handles to resize/reorient walls.


* **Snapping:** Implement a simple grid snap (e.g., snaps to every 0.1m).

### C. Phase 2: Reactive 3D Viewport

* **Mapping:** Map 2D  to 3D . Use the 3D -axis for the wall `height`.
* **Geometry:** Dynamically generate a `BoxGeometry` or `ExtrudeGeometry`.
* **Updates:** The 3D view must update **during** the 2D drag (not just on mouse-up).
* **Visuals:** Use a `MeshStandardMaterial` and add a `GridHelper` to the scene for scale.

### D. Phase 3: The BIM Inspector (UI)

* **Selection:** Clicking a wall in 2D or 3D selects it.
* **Calculations:** Display real-time derived data:
* **Length:** 
* **Volume:** 
* **Cost Estimate:** A simple multiplier based on the selected material (e.g., Brick = ).



---

## 4. Technical Logic Tips

### Coordinate System Synchronization

To keep 2D and 3D in sync, use a "World Unit" approach.

* Decide that **1 unit = 1 meter**.
* The 2D Canvas might render at **100 pixels per meter**.
* Always perform your math in **meters** before passing coordinates to the renderers.

### The "Smart Wall" Math

When updating the 3D wall's position and rotation:

1. **Rotation:** `Math.atan2(end.y - start.y, end.x - start.x)`
2. **Position:** `[(start.x + end.x)/2, height/2, (start.y + end.y)/2]`
3. **Scale:** The width of your 3D box should be the calculated `Length`.

---

## 5. Bonus Goals (To really impress Shaun)

* **WASM Logic:** Move the Volume/Cost calculations into a small Rust function compiled to WebAssembly.
* **Undo/Redo:** Use Zustand's middleware to allow `Ctrl+Z` for wall movements.
* **Ambient Occlusion:** Use `ContactShadows` in Three.js to make the 3D output look "construction-ready" and professional.

---

### How to use this for the interview:

1. **Code it:** Spend 4 hours getting the 2D drag  3D update loop working.
2. **Host it:** Deploy it to Vercel.
3. **The Hook:** In your interview, say: *"I was thinking about the precision challenges you mentioned, so I built a quick prototype to test a unified state sync between Konva and Three.js. Would you like to see how I handled the spatial mapping?"*

**Would you like me to generate a starter `Zustand` store and the math helper function to get your coordinates right?**