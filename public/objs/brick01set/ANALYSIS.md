# brick01set – Analysis

## What’s in the set

| File        | Role |
|------------|------|
| `brick01a.obj` … `brick01g.obj` | 7 OBJ meshes (Wavefront) |
| `brick01a.mtl` … `brick01g.mtl` | 7 MTL materials (diffuse + bump paths) |

- **Geometry:** All 7 OBJs use the **same box**: 8 vertices, 6 faces. Approx. size in file units:
  - **X:** ~9 (e.g. -4.53 to 4.49)
  - **Y:** ~4 (0 to 4)
  - **Z:** ~20 (-10 to 10)
- **Difference between a–g:** Only **UVs** (`vt`) and **material names** change; each MTL points to different texture filenames.
- **Textures:** The app loads textures from this folder using the names **`brick01X_color.jpg`** and **`brick01X_nmap.jpg`** (X = a, b, c, d, e, f, g). Add those files here to get per-variant colors and normals. If a set is missing, the wall falls back to the material color.

## Should we use this for the 3D walls?

### Current approach (recommended for main walls)

- **Box + tiling PBR texture** per wall: one box per wall, scaled to `length × height × thickness`, with a single brick (or concrete/drywall) texture that tiles.
- **Pros:** One draw call per wall, one texture set per material, simple scaling to any size, works with our existing `public/textures` (AmbientCG) setup.
- **Cons:** No geometric brick detail, only shading from the texture.

### Using brick01set

- **Pros**
  - Already in the project; OBJ is supported (e.g. Three.js `OBJLoader`).
  - Has UVs and normals; ready for texturing if we provide images and fix MTL paths.
  - 7 variants (a–g) could be used for visual variation (e.g. pick one at random per wall).
- **Cons**
  - **Fixed size:** The mesh is a fixed box (~9×4×20). Our walls are **dynamic** (length × height × thickness in meters). To use this we must either:
    - **Scale** one OBJ to match each wall (same approach as now, but with a more complex mesh than a box), or
    - **Tile** multiple instances (more logic and draw calls / instancing).
  - **Missing assets:** No texture files; MTL paths are broken. We’d need to add textures (e.g. under `public/objs/brick01set/`) and change MTL to relative paths (e.g. `brick01a_brick01_color.jpg`).
  - **Performance:** One OBJ per wall with more triangles than a box; if we ever tile segments, more objects. For many walls, box + texture is usually cheaper and simpler.

## Recommendation

- **Do not switch the main wall pipeline** to brick01set. Keeping **box + tiling PBR texture** is better for performance, simplicity, and arbitrary wall sizes.
- **Optional use of brick01set:**
  - **Single “hero” wall or showcase:** Load one OBJ (e.g. `brick01a.obj`), scale it to one wall’s length/height/thickness, and assign a brick texture (e.g. from `public/textures/brick/` or new textures next to the OBJ). Good for a dedicated “brick wall” demo.
  - **If you add the texture files:** Put the expected images (e.g. `brick01a_brick01_color.jpg`, `brick01a_brick01_nmap.jpg`) in `public/objs/brick01set/` and fix the MTL to use relative paths (e.g. `map_Kd brick01a_brick01_color.jpg`) so loaders can find them.

**Summary:** Keep using box + tiling textures for all walls. Use brick01set only optionally for one scaled mesh or a separate showcase, and only after adding textures and fixing MTL paths.
