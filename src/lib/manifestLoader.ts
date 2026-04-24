/**
 * Manifest Loader
 * Loads the class10-math YAML curriculum manifest into typed CurriculumManifest.
 * Uses js-yaml (already bundled) for both browser and Node — the lightweight
 * hand-rolled parser was buggy at indent level 4+ (biome properties, mechanic_config).
 */

import { load as yamlLoad } from 'js-yaml'
import type { CurriculumManifest } from '../types'

export function parseManifest(yamlText: string): CurriculumManifest {
  return yamlLoad(yamlText) as CurriculumManifest
}

export async function loadClass10MathManifest(): Promise<CurriculumManifest> {
  const raw = await import('../../curricula/class10-math/en/manifest.yaml?raw')
  return parseManifest(raw.default)
}
