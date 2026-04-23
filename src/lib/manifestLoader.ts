/**
 * Manifest Loader
 * Loads a YAML curriculum manifest and returns typed CurriculumManifest.
 * Works in two modes:
 *   1. Browser (Vite): imports YAML as raw text via ?raw suffix
 *   2. Node (scripts): uses js-yaml directly
 */

import type { CurriculumManifest, Biome, Landmark } from '../types'

// Raw YAML import (Vite handles ?raw)
// Usage: import manifestRaw from '../../curricula/class10-math/en/manifest.yaml?raw'
// Then call: parseManifest(manifestRaw)

export function parseManifest(yamlText: string): CurriculumManifest {
  // Inline minimal YAML parser for the manifest structure.
  // We use js-yaml only when available (Node scripts); in browser
  // we rely on Vite's import pipeline (JSON alternative) or inline parse.

  // Dynamic import guard — try js-yaml, fall back to manual parsing for SSR/scripts
  if (typeof window === 'undefined') {
    // Node environment — use js-yaml
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const yaml = require('js-yaml')
    return yaml.load(yamlText) as CurriculumManifest
  }

  // Browser: parse manually (lightweight, covers our manifest structure)
  // This avoids shipping js-yaml to the browser bundle
  return parseManifestLight(yamlText)
}

/**
 * Lightweight YAML → JS for our specific manifest schema.
 * Handles only what our manifest.yaml uses (no anchors, no multi-doc).
 */
function parseManifestLight(yaml: string): CurriculumManifest {
  // Split into lines, track indent depth, build object tree
  // For a real app we'd just import as JSON via a Vite transform;
  // this is a fallback safe for the S0 milestone.

  // Simple line-by-line approach for known structure
  const lines = yaml.split('\n')
  const obj: Record<string, unknown> = {}
  let currentBiome: Record<string, unknown> | null = null
  let currentLandmark: Record<string, unknown> | null = null
  let inBiomes = false
  let inLandmarks = false

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    if (!line || line.trimStart().startsWith('#')) continue
    const indent = line.length - line.trimStart().length
    const content = line.trimStart()

    if (indent === 0) {
      inBiomes = false
      inLandmarks = false
      currentBiome = null
      currentLandmark = null

      const [key, ...rest] = content.split(':')
      const value = rest.join(':').trim()
      if (value) {
        obj[key.trim()] = parseScalar(value)
      } else if (key.trim() === 'biomes') {
        obj.biomes = []
        inBiomes = true
      }
    } else if (inBiomes && indent === 2) {
      if (content.startsWith('- id:')) {
        currentBiome = { id: parseScalar(content.replace('- id:', '').trim()), landmarks: [] }
        ;(obj.biomes as unknown[]).push(currentBiome)
        currentLandmark = null
        inLandmarks = false
      } else if (currentBiome) {
        const [key, ...rest] = content.split(':')
        const value = rest.join(':').trim()
        if (key.trim() === 'landmarks') {
          inLandmarks = true
        } else if (value) {
          currentBiome[key.trim()] = parseScalar(value)
        }
      }
    } else if (inLandmarks && indent === 6) {
      if (content.startsWith('- id:')) {
        currentLandmark = { id: parseScalar(content.replace('- id:', '').trim()) }
        ;(currentBiome!.landmarks as unknown[]).push(currentLandmark)
      } else if (currentLandmark) {
        const [key, ...rest] = content.split(':')
        const value = rest.join(':').trim()
        if (value) currentLandmark[key.trim()] = parseScalar(value)
      }
    }
  }

  const manifest: CurriculumManifest = {
    curriculum: String(obj.curriculum ?? ''),
    language: String(obj.language ?? 'en'),
    title: String(obj.title ?? ''),
    description: String(obj.description ?? ''),
    biomes: ((obj.biomes ?? []) as unknown[]).map(mapBiome),
  }

  return manifest
}

function parseScalar(val: string): string | number | boolean {
  if (val === 'true') return true
  if (val === 'false') return false
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1)
  }
  const n = Number(val)
  return isNaN(n) ? val : n
}

function mapBiome(raw: unknown): Biome {
  const b = raw as Record<string, unknown>
  return {
    id: String(b.id ?? ''),
    title: String(b.title ?? ''),
    location: String(b.location ?? ''),
    theme: String(b.theme ?? ''),
    chapter: String(b.chapter ?? ''),
    companion: String(b.companion ?? ''),
    description: String(b.description ?? ''),
    landmarks: ((b.landmarks ?? []) as unknown[]).map(mapLandmark),
  }
}

function mapLandmark(raw: unknown): Landmark {
  const l = raw as Record<string, unknown>
  return {
    id: String(l.id ?? ''),
    name: String(l.name ?? ''),
    concept_id: String(l.concept_id ?? ''),
    mechanic: String(l.mechanic ?? ''),
    mechanic_config: (l.mechanic_config ?? {}) as Record<string, unknown>,
  }
}

/**
 * Load the Class X Math manifest from the bundled YAML.
 * In Vite: import the YAML file as a raw string, then call this.
 * In Node scripts: read file with fs.readFileSync.
 */
export async function loadClass10MathManifest(): Promise<CurriculumManifest> {
  // Vite static import at build time
  const raw = await import('../../curricula/class10-math/en/manifest.yaml?raw')
  return parseManifest(raw.default)
}
