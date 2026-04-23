/**
 * Mechanic library — exports all 7 reusable mechanics + router
 */

export { TapIdentify } from './TapIdentify'
export { DragAngleRelease } from './DragAngleRelease'
export { SliderLiveReadout } from './SliderLiveReadout'
export { DragToOrder } from './DragToOrder'
export { TwoPointMeasure } from './TwoPointMeasure'
export { DragMatchSlot } from './DragMatchSlot'
export { BuildDiagram } from './BuildDiagram'
export { CompositeMechanic } from './CompositeMechanic'

import type React from 'react'
import { TapIdentify } from './TapIdentify'
import { DragAngleRelease } from './DragAngleRelease'
import { SliderLiveReadout } from './SliderLiveReadout'
import { DragToOrder } from './DragToOrder'
import { TwoPointMeasure } from './TwoPointMeasure'
import { DragMatchSlot } from './DragMatchSlot'
import { BuildDiagram } from './BuildDiagram'
import { CompositeMechanic } from './CompositeMechanic'

type MechanicResult = { passed: boolean; score?: number }
type MechanicComponent = React.ComponentType<{
  config: Record<string, unknown>
  onComplete: (result: MechanicResult) => void
}>

// We cast via unknown because each mechanic has a narrow config type;
// the runtime registry accepts generic Record<string, unknown> config.
const REGISTRY: Record<string, MechanicComponent> = {
  'tap-identify': TapIdentify as unknown as MechanicComponent,
  'drag-angle-release': DragAngleRelease as unknown as MechanicComponent,
  'slider-live-readout': SliderLiveReadout as unknown as MechanicComponent,
  'drag-to-order': DragToOrder as unknown as MechanicComponent,
  'two-point-measure': TwoPointMeasure as unknown as MechanicComponent,
  'drag-match-slot': DragMatchSlot as unknown as MechanicComponent,
  'build-diagram': BuildDiagram as unknown as MechanicComponent,
  'composite-challenge': CompositeMechanic as unknown as MechanicComponent,
}

/**
 * Look up a mechanic component by its manifest type string.
 * Returns null if not found (renders a "not implemented" placeholder).
 */
export function getMechanic(type: string): MechanicComponent | null {
  return REGISTRY[type] ?? null
}
