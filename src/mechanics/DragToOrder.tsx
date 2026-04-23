/**
 * DragToOrder mechanic (Proof Builder)
 * Player taps tiles in the correct order to build a mathematical proof.
 *
 * Config shape (from manifest.yaml mechanic_config — not directly exposed as YAML;
 * this component uses sensible defaults so it works with any concept_id):
 */

import { useState, useCallback } from 'react'

interface DragToOrderConfig {
  steps?: string[]
  distractors?: string[]
  claim?: string
}

interface Props {
  config: DragToOrderConfig
  onComplete: (result: { passed: boolean; score?: number }) => void
}

// Default proof: sin²θ + cos²θ = 1
const DEFAULT_CLAIM = 'sin²θ + cos²θ = 1'
const DEFAULT_STEPS = ['= sin²θ + cos²θ', '= (y)² + (x)²', '= r²/r²', '= 1 ✓']
const DEFAULT_DISTRACTORS = ['= 2sinθcosθ', '= tan²θ + 1']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function DragToOrder({ config, onComplete }: Props) {
  const claim = config.claim ?? DEFAULT_CLAIM
  const steps = config.steps ?? DEFAULT_STEPS
  const distractors = config.distractors ?? DEFAULT_DISTRACTORS

  const [pool, setPool] = useState<string[]>(() => shuffle([...steps, ...distractors]))
  const [chosen, setChosen] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  const handlePick = useCallback(
    (tile: string) => {
      const newChosen = [...chosen, tile]
      const newPool = pool.filter((t) => t !== tile)
      setPool(newPool)
      setChosen(newChosen)

      if (newChosen.length === steps.length) {
        const isCorrect = steps.every((s, i) => s === newChosen[i])
        setFeedback(isCorrect ? 'correct' : 'wrong')
        if (isCorrect) {
          setTimeout(() => onComplete({ passed: true, score: 100 }), 900)
        } else {
          // Reset after wrong
          setTimeout(() => {
            setPool(shuffle([...steps, ...distractors]))
            setChosen([])
            setFeedback(null)
          }, 1000)
        }
      }
    },
    [chosen, pool, steps, distractors, onComplete]
  )

  const handleRemove = useCallback(
    (index: number) => {
      if (feedback) return
      const tile = chosen[index]
      setChosen(chosen.filter((_, i) => i !== index))
      setPool([...pool, tile])
    },
    [chosen, pool, feedback]
  )

  return (
    <div className="flex flex-col gap-4 p-4 select-none">
      {/* Claim */}
      <div className="text-center">
        <div className="text-xs text-ember-400 uppercase tracking-widest mb-1">Prove that</div>
        <div className="text-dusk-100 font-mono font-bold text-base bg-dusk-800/50 px-4 py-2 rounded-xl inline-block">
          {claim}
        </div>
      </div>

      {/* Your proof slots */}
      <div>
        <div className="text-xs text-dusk-400 uppercase tracking-widest mb-2">Your Proof ({chosen.length}/{steps.length})</div>
        <div className="min-h-[80px] border border-dusk-700 rounded-xl p-2 flex flex-col gap-1">
          {chosen.map((tile, i) => (
            <button
              key={i}
              onClick={() => handleRemove(i)}
              className={`text-left px-3 py-1.5 rounded-lg text-sm font-mono
                ${feedback === 'correct' ? 'bg-green-800/50 text-green-200' :
                  feedback === 'wrong' ? 'bg-red-800/30 text-red-200' :
                  'bg-dusk-700/50 text-dusk-100 hover:bg-dusk-600/50'} transition-colors`}
            >
              {i + 1}. {tile}
            </button>
          ))}
          {chosen.length === 0 && (
            <p className="text-dusk-500 text-xs text-center mt-2">Tap a tile below to add it here</p>
          )}
        </div>
      </div>

      {/* Tile pool */}
      <div>
        <div className="text-xs text-dusk-400 uppercase tracking-widest mb-2">Available Tiles</div>
        <div className="flex flex-wrap gap-2">
          {pool.map((tile, i) => (
            <button
              key={i}
              onClick={() => handlePick(tile)}
              className="px-3 py-1.5 rounded-lg bg-dusk-700 text-dusk-100 text-sm font-mono
                hover:bg-ember-800/60 active:scale-95 transition-all border border-dusk-600"
            >
              {tile}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-sm font-semibold text-center px-4 py-2 rounded-xl ${
          feedback === 'correct'
            ? 'text-green-300 bg-green-900/40'
            : 'text-yellow-300 bg-yellow-900/30'
        }`}>
          {feedback === 'correct'
            ? '✓ Proof complete! That\'s the Pythagorean identity.'
            : '→ Not quite — try a different order.'}
        </div>
      )}
    </div>
  )
}
