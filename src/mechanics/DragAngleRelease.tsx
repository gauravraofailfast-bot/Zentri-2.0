/**
 * DragAngleRelease mechanic (Archer's Angle)
 * Player adjusts angle with slider to match a target trig ratio.
 */

import { useState, useMemo, useCallback } from 'react'

interface DragAngleReleaseConfig {
  targets?: number
  angles?: number[]
  difficulty_ramp?: string[]
}

interface Props {
  config: DragAngleReleaseConfig
  onComplete: (result: { passed: boolean; score?: number }) => void
}

const DEG = Math.PI / 180
const ROPE = 160
const TOLERANCE = { easy: 7, medium: 4, hard: 2 }

export function DragAngleRelease({ config, onComplete }: Props) {
  const angles = config.angles ?? [30, 45, 60]
  const ramp = (config.difficulty_ramp ?? []) as string[]
  const totalTargets = config.targets ?? angles.length

  const [round, setRound] = useState(0)
  const [angle, setAngle] = useState(45)
  const [fired, setFired] = useState(false)
  const [feedback, setFeedback] = useState<'hit' | 'close' | 'miss' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const targetAngle = angles[round % angles.length]
  const difficulty = ramp[round] ?? 'medium'
  const tol = TOLERANCE[difficulty as keyof typeof TOLERANCE] ?? 4

  const { opp, adj } = useMemo(() => {
    const rad = angle * DEG
    return { opp: ROPE * Math.sin(rad), adj: ROPE * Math.cos(rad) }
  }, [angle])

  const origin = { x: 60, y: 220 }
  const tip = { x: origin.x + adj, y: origin.y - opp }
  const targetRad = targetAngle * DEG

  const handleFire = useCallback(() => {
    if (fired) return
    setFired(true)
    const diff = Math.abs(angle - targetAngle)
    const result: 'hit' | 'close' | 'miss' = diff <= tol ? 'hit' : diff <= tol * 3 ? 'close' : 'miss'
    setFeedback(result)

    const passed = result === 'hit'
    if (passed) setCorrectCount(n => n + 1)

    setTimeout(() => {
      setFired(false)
      setFeedback(null)
      setAngle(45)
      const next = round + 1
      if (next >= totalTargets) {
        onComplete({ passed: true, score: Math.round(((correctCount + (passed ? 1 : 0)) / totalTargets) * 100) })
      } else {
        setRound(next)
      }
    }, 1200)
  }, [fired, angle, targetAngle, tol, round, totalTargets, correctCount, onComplete])

  const arrowColor = fired
    ? feedback === 'hit' ? '#5eead4' : feedback === 'close' ? '#fbbf24' : '#f87171'
    : 'rgba(255,255,255,0.8)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 16, userSelect: 'none' }}>
      {/* Round indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ember-glow)', letterSpacing: '0.18em' }}>
          ROUND {round + 1}/{totalTargets}
        </span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--muted-2)' }}>· {difficulty}</span>
      </div>

      {/* Target */}
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center', lineHeight: 1.5 }}>
        Set the arrow at <span style={{ color: 'var(--ember-glow)', fontWeight: 700 }}>{targetAngle}°</span>
        <br/>
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted-2)' }}>
          sin {targetAngle}° = {Math.sin(targetAngle * DEG).toFixed(3)} &nbsp;·&nbsp;
          cos {targetAngle}° = {Math.cos(targetAngle * DEG).toFixed(3)}
        </span>
      </p>

      {/* Triangle SVG */}
      <svg width={280} height={260} style={{ overflow: 'visible' }}>
        {/* Ground */}
        <line x1={40} y1={220} x2={260} y2={220} stroke="rgba(255,255,255,0.2)" strokeWidth={2}/>

        {/* Target ghost */}
        <line
          x1={origin.x} y1={origin.y}
          x2={origin.x + ROPE * Math.cos(targetRad)}
          y2={origin.y - ROPE * Math.sin(targetRad)}
          stroke="var(--ember-glow)" strokeWidth={1} strokeDasharray="6 4" opacity={0.4}
        />
        <text
          x={origin.x + ROPE * Math.cos(targetRad) + 6}
          y={origin.y - ROPE * Math.sin(targetRad)}
          fill="var(--ember-glow)" fontSize={10} opacity={0.6}
        >target</text>

        {/* Arrow */}
        <line
          x1={origin.x} y1={origin.y} x2={tip.x} y2={tip.y}
          stroke={arrowColor} strokeWidth={3} strokeLinecap="round"
          style={{ transition: 'stroke 0.3s' }}
        />

        {/* Dashed sides */}
        <line x1={tip.x} y1={tip.y} x2={tip.x} y2={origin.y} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="4 3"/>
        <line x1={origin.x} y1={origin.y} x2={tip.x} y2={origin.y} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="4 3"/>

        {/* Labels */}
        <text x={tip.x + 6} y={(tip.y + origin.y) / 2} fill="rgba(255,255,255,0.5)" fontSize={10}>opp</text>
        <text x={(origin.x + tip.x) / 2} y={origin.y + 14} fill="rgba(255,255,255,0.5)" fontSize={10} textAnchor="middle">adj</text>

        {/* Angle arc */}
        <path
          d={`M ${origin.x + 28} ${origin.y} A 28 28 0 0 0 ${origin.x + 28 * Math.cos(angle * DEG)} ${origin.y - 28 * Math.sin(angle * DEG)}`}
          fill="none" stroke="var(--ember-glow)" strokeWidth={1.5}
        />
        <text x={origin.x + 34} y={origin.y - 12} fill="var(--ember-glow)" fontSize={12} fontFamily="JetBrains Mono, monospace">
          {angle}°
        </text>

        {/* Arrowhead */}
        <circle cx={tip.x} cy={tip.y} r={5} fill={arrowColor} style={{ transition: 'fill 0.3s' }}/>
      </svg>

      {/* Slider */}
      <div style={{ width: '100%', maxWidth: 280 }}>
        <input
          type="range" min={5} max={85} value={angle}
          onChange={e => !fired && setAngle(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--ember)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-2)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>
          <span>5°</span>
          <span style={{ color: 'var(--ember-glow)', fontWeight: 700 }}>{angle}°</span>
          <span>85°</span>
        </div>
      </div>

      {/* Fire button */}
      <button
        onClick={handleFire}
        disabled={fired}
        className="btn btn-primary"
        style={{ padding: '10px 28px', fontSize: 13, opacity: fired ? 0.4 : 1 }}
      >
        {fired ? '⟶ Released' : 'Release →'}
      </button>

      {/* Feedback */}
      {feedback && (
        <div style={{
          fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 20,
          color: feedback === 'hit' ? 'var(--teal)' : feedback === 'close' ? 'var(--gold)' : '#f87171',
          background: feedback === 'hit' ? 'rgba(94,234,212,0.12)' : feedback === 'close' ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
        }}>
          {feedback === 'hit'   ? '✓ Perfect angle!'
           : feedback === 'close' ? 'You\'re close! Try adjusting a few degrees.'
           : '↻ Try again — aim for the target ghost line.'}
        </div>
      )}
    </div>
  )
}
