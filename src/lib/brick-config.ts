import type { BrickVariant } from "@/store/types";

const BASE = "/objs/brick01set";

/**
 * Variants that have color + nmap textures in public/objs/brick01set.
 * Only these will be requested; others use flat material (no 404s).
 * Add a variant when you've added brick01X_color.jpg and brick01X_nmap.jpg.
 */
export const BRICK_VARIANTS_WITH_TEXTURES: BrickVariant[] = ["f", "g"];

/** OBJ and texture paths for each brick01 variant (a–g). Matches files in public/objs/brick01set. */
export const BRICK_VARIANTS: Record<
  BrickVariant,
  { obj: string; color: string; nmap: string; label: string }
> = {
  a: {
    obj: `${BASE}/brick01a.obj`,
    color: `${BASE}/brick01a_brick01_color.jpg`,
    nmap: `${BASE}/brick01a_brick01_nmap.jpg`,
    label: "Brick 01A",
  },
  b: {
    obj: `${BASE}/brick01b.obj`,
    color: `${BASE}/brick01b_color.jpg`,
    nmap: `${BASE}/brick01b_nmap.jpg`,
    label: "Brick 01B",
  },
  c: {
    obj: `${BASE}/brick01c.obj`,
    color: `${BASE}/brick01c_color.jpg`,
    nmap: `${BASE}/brick01c_nmap.jpg`,
    label: "Brick 01C",
  },
  d: {
    obj: `${BASE}/brick01d.obj`,
    color: `${BASE}/brick01d_color.jpg`,
    nmap: `${BASE}/brick01d_nmap.jpg`,
    label: "Brick 01D",
  },
  e: {
    obj: `${BASE}/brick01e.obj`,
    color: `${BASE}/brick01e_color.jpg`,
    nmap: `${BASE}/brick01e_nmap.jpg`,
    label: "Brick 01E",
  },
  f: {
    obj: `${BASE}/brick01f.obj`,
    color: `${BASE}/brick01f_color.jpg`,
    nmap: `${BASE}/brick01f_nmap.jpg`,
    label: "Brick 01F",
  },
  g: {
    obj: `${BASE}/brick01g.obj`,
    color: `${BASE}/brick01g_color.jpg`,
    nmap: `${BASE}/brick01g_nmap.jpg`,
    label: "Brick 01G",
  },
};

export const BRICK_VARIANT_OPTIONS: { value: BrickVariant; label: string }[] = (
  ["a", "b", "c", "d", "e", "f", "g"] as BrickVariant[]
).map((v) => ({ value: v, label: BRICK_VARIANTS[v].label }));
