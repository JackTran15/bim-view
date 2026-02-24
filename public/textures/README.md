# Wall textures (optional)

This folder is **empty by default**. Box walls (concrete, drywall) use flat colors unless you add texture files here and enable them.

- **Brick walls** use instanced bricks from `public/objs/brick01set/` (see Brick style in the inspector); they do **not** use this folder.

## Enabling textures for concrete / drywall

1. Create subfolders: `concrete/`, `drywall/` (and optionally `brick/` for box-style brick).
2. Add PBR maps (e.g. from [AmbientCG](https://ambientcg.com/) — CC0). Expected filenames are in `src/lib/texture-config.ts`:
   - **Concrete:** `Concrete046_1K-JPG_Color.jpg`, `Concrete046_1K-JPG_NormalDX.jpg`, `Concrete046_1K-JPG_Roughness.jpg`
   - **Drywall:** `Plaster005_1K-JPG_Color.jpg`, `Plaster005_1K-JPG_NormalDX.jpg`, `Plaster005_1K-JPG_Roughness.jpg`
3. In `src/lib/texture-config.ts`, set **`WALL_TEXTURES_ENABLED`** to the materials you added, e.g.:
   ```ts
   export const WALL_TEXTURES_ENABLED: WallMaterial[] = ["concrete", "drywall"];
   ```

If `WALL_TEXTURES_ENABLED` is empty (default), no texture requests are made and walls use flat colors.
