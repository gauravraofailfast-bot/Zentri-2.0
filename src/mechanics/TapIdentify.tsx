/**
 * TapIdentify mechanic
 * Player taps the correct labelled element (side of a triangle, angle, etc.)
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

  const W = 280
  const H = 200
  const adj = W * 0.6
  const opp = H * 0.7

  const A = { x: 40, y: H - 20 }
  const B = { x: A.x + adj, y: A.y }
  const C = { x: B.x, y: B.y - opp }

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
      if (isCorrect) setCorrect(n => n + 1)

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
    [feedback, current, round, targets.length, correct, onComplete],
  )

  if (!current) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 16 }}>
      {/* Progress */}
      <div className="mono" style={{ fontSize: 10, color: 'var(--ember-glow)', letterSpacing: '0.2em' }}>
        {round + 1} / {targets.length}
      </div>

      {/* Prompt */}
      <p style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontWeight: 500, fontSize: 14, padding: '0 8px' }}>
        {PROMPTS[current.side]}
      </p>

      {/* Triangle SVG */}
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        {(Object.keys(sides) as Array<keyof typeof sides>).map(side => {
          const s = sides[side]
          const isFeedback = feedback && side === current.side
          return (
            <g key={side} onClick={() => handleTap(side)} style={{ cursor: 'pointer' }}>
              <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth={12} stroke="transparent"/>
              <line
                x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                strokeWidth={4}
                stroke={
                  isFeedback
                    ? feedback === 'correct' ? '#5eead4' : '#fbbf24'
                    : 'rgba(255,255,255,0.55)'
                }
                strokeLinecap="round"
                style={{ transition: 'stroke 0.2s' }}
              />
              <text
                x={(s.x1 + s.x2) / 2 + (side === 'opposite' ? 16 : 0)}
                y={(s.y1 + s.y2) / 2 + (side === 'adjacent' ? 18 : -8)}
                fill="rgba(255,255,255,0.7)"
                fontSize={11}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
              >
                {SIDE_LABELS[side]}
              </text>
            </g>
          )
        })}
        <text x={A.x + 18} y={A.y - 8} fill="var(--ember-glow)" fontSize={14}>θ={angle}°</text>
        <rect x={B.x - 12} y={B.y - 12} width={10} height={10} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5}/>
      </svg>

      {/* Feedback */}
      {feedback && (
        <div style={{
          fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 20,
          color: feedback === 'correct' ? 'var(--teal)' : 'var(--gold)',
          background: feedback === 'correct' ? 'rgba(94,234,212,0.12)' : 'rgba(251,191,36,0.12)',
        }}>
          {feedback === 'correct' ? '✓ That\'s it!' : 'Close! Try the other sides.'}
        </div>
      )}
    </div>
  )
}
