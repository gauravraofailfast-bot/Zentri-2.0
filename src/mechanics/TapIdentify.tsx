/**
 * TapIdentify mechanic
 * Player taps the correct labelled element (side of a triangle, angle, etc.)
 *
 * Config shape:
 *   targets: Array<{ side: string; angle: number }>
 *   angle_range: number[]
 */

import { useState, useCallback } from 'react'

interface Target {
  side: 'opposite' | 'adjacent' | 'hypotenuse'
  angle: number
}

interface TapIdentifyConfig {
  targets: Target[]
  angle_range: number[]
}

interface Props {
  config: TapIdentifyConfig
  onComplete: (result: { passed: boolean; score?: number }) => void
}

const SIDE_LABELS: Record<string, string> = {
  opposite: 'Opposite',
  adjacent: 'Adjacent',
  hypotenuse: 'Hypotenuse',
}

const PROMPTS: Record<string, string> = {
  opposite: 'Tap the side OPPOSITE to angle θ',
  adjacent: 'Tap the side ADJACENT to angle θ',
  hypotenuse: 'Tap the longest side (HYPOTENUSE)',
}

export function TapIdentify({ config, onComplete }: Props) {
  const targets = config.targets ?? []
  const [round, setRound] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [correct, setCorrect] = useState(0)

  const current = targets[round]
  const angle = current?.angle ?? 30

  // Triangle vertices (right angle at bottom-right)
  const W = 280
  const H = 200
  const adj = W * 0.6
  const opp = H * 0.7

  const A = { x: 40, y: H - 20 }           // vertex with θ
  const B = { x: A.x + adj, y: A.y }       // right angle
  const C = { x: B.x, y: B.y - opp }       // top

  const sides: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
    adjacent:   { x1: A.x, y1: A.y, x2: B.x, y2: B.y },
    opposite:   { x1: B.x, y1: B.y, x2: C.x, y2: C.y },
    hypotenuse: { x1: A.x, y1: A.y, x2: C.x, y2: C.y },
  }

  const handleTap = useCallback(
    (side: string) => {
      if (feedback) return
      const isCorrect = side === current.side
      setFeedback(isCorrect ? 'correct' : 'wrong')
      if (isCorrect) setCorrect((n) => n + 1)

      setTimeout(() => {
        setFeedback(null)
        const next = round + 1
        if (next >= targets.length) {
          onComplete({ passed: true, score: Math.round(((correct + (isCorrect ? 1 : 0)) / targets.length) * 100) })
        } else {
          setRound(next)
        }
      }, 700)
    },
    [feedback, current, round, targets.length, correct, onComplete]
  )

  if (!current) return null

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Progress */}
      <div className="text-xs text-ember-400 font-mono tracking-widest uppercase">
        {round + 1} / {targets.length}
      </div>

      {/* Prompt */}
      <p className="text-dusk-100 text-center font-medium text-sm px-4">
        {PROMPTS[current.side]}
      </p>

      {/* Triangle SVG */}
      <svg width={W} height={H} className="overflow-visible">
        {/* Draw each side as a clickable area */}
        {(Object.keys(sides) as Array<keyof typeof sides>).map((side) => {
          const s = sides[side]
          const isFeedback = feedback && side === current.side
          return (
            <g key={side} onClick={() => handleTap(side)} className="cursor-pointer">
              <line
                x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                strokeWidth={12}
                stroke="transparent"
              />
              <line
                x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                strokeWidth={4}
                stroke={
                  isFeedback
                    ? feedback === 'correct' ? '#7cffb6' : '#ffd166'
                    : '#c4a882'
                }
                strokeLinecap="round"
                className="transition-all duration-200"
              />
              {/* Mid-point label */}
              <text
                x={(s.x1 + s.x2) / 2 + (side === 'opposite' ? 14 : 0)}
                y={(s.y1 + s.y2) / 2 + (side === 'adjacent' ? 18 : -8)}
                fill="#e8d5b5"
                fontSize={11}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
              >
                {SIDE_LABELS[side]}
              </text>
            </g>
          )
        })}

        {/* Angle arc */}
        <text x={A.x + 18} y={A.y - 8} fill="#f4a261" fontSize={14}>θ={angle}°</text>

        {/* Right-angle marker */}
        <rect x={B.x - 12} y={B.y - 12} width={10} height={10} fill="none" stroke="#c4a882" strokeWidth={1.5} />
      </svg>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`text-sm font-semibold px-4 py-1 rounded-full ${
            feedback === 'correct' ? 'text-green-300 bg-green-900/40' : 'text-yellow-300 bg-yellow-900/40'
          }`}
        >
          {feedback === 'correct' ? '✓ That\'s it!' : 'Close! Try the other sides.'}
        </div>
      )}
    </div>
  )
}
