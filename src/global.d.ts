/**
 * Fallback JSX typings when React types are not resolved (e.g. missing node_modules).
 * Ensures "JSX.IntrinsicElements" exists so TSX files type-check.
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: Record<string, unknown> & { children?: unknown };
    }
  }
}

export {};
