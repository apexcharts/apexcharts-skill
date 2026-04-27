import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const packageRoot = dirname(fileURLToPath(import.meta.url));

/** Absolute path to the package root (where SKILL.md lives). */
export const packageDir = packageRoot;

/** Absolute path to SKILL.md (the top-level skill index). */
export const skillFile = join(packageRoot, 'SKILL.md');

/** Absolute path to the references/ directory containing per-topic markdown docs. */
export const referencesDir = join(packageRoot, 'references');

/**
 * Filenames of every reference doc shipped with this package, relative to
 * `referencesDir`. Useful for iterating without scanning the filesystem.
 */
export const referenceFiles = [
  'bar-charts.md',
  'cartesian-charts.md',
  'circular-charts.md',
  'financial-charts.md',
  'framework-wrappers.md',
  'grid-charts.md',
  'radar-charts.md',
  'ssr.md',
  'tree-shaking.md',
];

/** Resolve a reference file by its filename. Throws if not in the known list. */
export function referencePath(filename) {
  if (!referenceFiles.includes(filename)) {
    throw new Error(
      `Unknown reference file "${filename}". Known files: ${referenceFiles.join(', ')}`,
    );
  }
  return join(referencesDir, filename);
}

export default {
  packageDir,
  skillFile,
  referencesDir,
  referenceFiles,
  referencePath,
};
