/**
 * DragAngleRelease mechanic (Archer's Angle)
 * Player adjusts angle with slider to match a target trig ratio.
 *
 * Config shape:
 *   targets: number           – number of rounds
 *   angles: number[]          – target angles per round (e.g. [30, 45, 60])
 *   difficulty_ramp: string[] – easy/medium/hard per round
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

  // Triangle geometry
  const { opp, adj } = useMemo(() => {
    const rad = angle * DEG
    return { opp: ROPE * Math.sin(rad), adj: ROPE * Math.cos(rad) }
  }, [angle])

  const origin = { x: 60, y: 220 }
  const tip = { x: origin.x + adj, y: origin.y - opp }

  const handleFire = useCallback(() => {
    if (fired) return
    setFired(true)
    const diff = Math.abs(angle - targetAngle)
    const result: 'hit' | 'close' | 'miss' = diff <= tol ? 'hit' : diff <= tol * 3 ? 'close' : 'miss'
    setFeedback(result)

    const passed = result === 'hit'
    if (passed) setCorrectCount((n) => n + 1)

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

  const targetRad = targetAngle * DEG

  return (
    <div className="flex flex-col items-center gap-3 p-4 select-none">
      {/* Round indicator */}
      <div className="flex items-center gap-2 text-xs font-mono text-ember-400 uppercase tracking-widest">
        <span>Round {round + 1}/{totalTargets}</span>
        <span className="opacity-50">·</span>
        <span>{difficulty}</span>
      </div>

      {/* Target */}
      <p className="text-dusk-100 text-sm text-center">
        Set the arrow at <span className="text-ember-300 font-bold">{targetAngle}°</span>
        <br />
        <span className="text-xs text-dusk-400">
          sin {targetAngle}° = {Math.sin(targetAngle * DEG).toFixed(3)} &nbsp;·&nbsp;
          cos {targetAngle}° = {Math.cos(targetAngle * DEG).toFixed(3)} &nbsp;·&nbsp;
          tan {targetAngle}° = {Math.tan(targetAngle * DEG).toFixed(3)}
        </span>
      </p>

      {/* Triangle SVG */}
      <svg width={280} height={260} className="overflow-visible">
        {/* Ground */}
        <line x1={40} y1={220} x2={260} y2={220} stroke="#4a3f35" strokeWidth={2} />

        {/* Target ghost line */}
        <line
          x1={origin.x} y1={origin.y}
          x2={origin.x + ROPE * Math.cos(targetRad)}
          y2={origin.y - ROPE * Math.sin(targetRad)}
          stroke="#f4a261" strokeWidth={1} strokeDasharray="6 4" opacity={0.4}
        />
        <text
          x={origin.x + ROPE * Math.cos(targetRad) + 6}
          y={origin.y - ROPE * Math.sin(targetRad)}
          fill="#f4a261" fontSize={10} opacity={0.6}
        >
          target
        </text>

        {/* Arrow (hypotenuse) */}
        <line
          x1={origin.x} y1={origin.y}
          x2={tip.x} y2={tip.y}
          stroke={fired ? (feedback === 'hit' ? '#7cffb6' : feedback === 'close' ? '#ffd166' : '#ff6b6b') : '#e8d5b5'}
          strokeWidth={3} strokeLinecap="round"
          className="transition-colors duration-300"
        />

        {/* Opposite side */}
        <line x1={tip.x} y1={tip.y} x2={tip.x} y2={origin.y} stroke="#4a3f35" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Adjacent side */}
        <line x1={origin.x} y1={origin.y} x2={tip.x} y2={origin.y} stroke="#4a3f35" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Labels */}
        <text x={tip.x + 6} y={(tip.y + origin.y) / 2} fill="#c4a882" fontSize={10}>opp</text>
        <text x={(origin.x + tip.x) / 2} y={origin.y + 14} fill="#c4a882" fontSize={10} textAnchor="middle">adj</text>

        {/* Angle arc */}
        <path
          d={`M ${origin.x + 28} ${origin.y} A 28 28 0 0 0 ${origin.x + 28 * Math.cos(angle * DEG)} ${origin.y - 28 * Math.sin(angle * DEG)}`}
          fill="none" stroke="#f4a261" strokeWidth={1.5}
        />
        <text x={origin.x + 34} y={origin.y - 12} fill="#f4a261" fontSize={12} fontFamily="JetBrains Mono, monospace">
          {angle}°
        </text>

        {/* Arrowhead */}
        <circle cx={tip.x} cy={tip.y} r={5}
          fill={fired ? (feedback === 'hit' ? '#7cffb6' : '#ffd166') : '#e8d5b5'}
        />
      </svg>

      {/* Slider */}
      <div className="w-full max-w-xs flex flex-col gap-1">
        <input
          type="range" min={5} max={85} value={angle}
          onChange={(e) => !fired && setAngle(Number(e.target.value))}
          className="w-full accent-ember-400"
        />
        <div className="flex justify-between text-xs text-dusk-400 font-mono">
          <span>5°</span>
          <span className="text-ember-300 font-bold">{angle}°</span>
          <span>85°</span>
        </div>
      </div>

      {/* Fire button */}
      <button
        onClick={handleFire}
        disabled={fired}
        className="mt-1 px-8 py-2 rounded-full bg-ember-500 text-white font-bold text-sm
          disabled:opacity-40 active:scale-95 transition-all"
      >
        {fired ? '⟶ Released' : 'Release →'}
      </button>

      {/* Feedback */}
      {feedback && (
        <div className={`text-sm font-semibold px-4 py-1 rounded-full ${
          feedback === 'hit' ? 'text-green-300 bg-green-900/40' :
          feedback === 'close' ? 'text-yellow-300 bg-yellow-900/40' :
          'text-red-300 bg-red-900/30'
        }`}>
          {feedback === 'hit' ? '✓ Perfect angle!' :
           feedback === 'close' ? '→ You\'re close! Try adjusting a few degrees.' :
           '↻ Try again — aim for the target ghost line.'}
        </div>
      )}
    </div>
  )
}
