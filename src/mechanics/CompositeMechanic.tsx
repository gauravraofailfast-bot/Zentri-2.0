/**
 * CompositeMechanic (Boss Landmark)
 * Orchestrates multiple sub-mechanics in sequence based on step weights.
 *
 * Config shape:
 *   steps: [{mechanic: string, weight: number}]
 */

import { useState } from 'react'
import { TwoPointMeasure } from './TwoPointMeasure'
import { DragToOrder } from './DragToOrder'
import { BuildDiagram } from './BuildDiagram'

interface Step {
  mechanic: string
  weight: number
}

interface CompositeMechanicConfig {
  steps: Step[]
}

interface Props {
  config: CompositeMechanicConfig
  onComplete: (result: { passed: boolean; score?: number }) => void
}

const MECHANIC_MAP: Record<string, React.ComponentType<{ config: Record<string, unknown>; onComplete: (r: { passed: boolean; score?: number }) => void }>> = {
  'two-point-measure': TwoPointMeasure as never,
  'drag-to-order': DragToOrder as never,
  'build-diagram': BuildDiagram as never,
}

export function CompositeMechanic({ config, onComplete }: Props) {
  const steps = config.steps ?? []
  const [stepIdx, setStepIdx] = useState(0)
  const [scores, setScores] = useState<number[]>([])

  if (steps.length === 0) {
    return <div className="text-dusk-400 text-center p-4">No steps configured.</div>
  }

  const current = steps[stepIdx]
  const Mechanic = MECHANIC_MAP[current.mechanic]

  function handleStepDone(result: { passed: boolean; score?: number }) {
    const newScores = [...scores, result.score ?? (result.passed ? 100 : 0)]
    setScores(newScores)

    const next = stepIdx + 1
    if (next >= steps.length) {
      const weighted = steps.reduce((acc, s, i) => acc + (newScores[i] ?? 0) * s.weight, 0)
      const totalWeight = steps.reduce((acc, s) => acc + s.weight, 0)
      onComplete({ passed: true, score: Math.round(weighted / totalWeight) })
    } else {
      setStepIdx(next)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Step progress */}
      <div className="flex gap-1 px-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i < stepIdx ? 'bg-green-400' :
              i === stepIdx ? 'bg-ember-400' :
              'bg-dusk-700'
            }`}
          />
        ))}
      </div>

      <div className="text-xs text-center text-dusk-500 font-mono">
        Stage {stepIdx + 1} of {steps.length}: {current.mechanic}
      </div>

      {Mechanic ? (
        <Mechanic config={{}} onComplete={handleStepDone} />
      ) : (
        <div className="text-dusk-400 text-sm text-center p-4">
          Mechanic "{current.mechanic}" not found.
          <br />
          <button
            onClick={() => handleStepDone({ passed: true, score: 100 })}
            className="mt-2 px-4 py-1 rounded bg-dusk-700 text-dusk-200 text-xs"
          >
            Skip →
          </button>
        </div>
      )}
    </div>
  )
}
