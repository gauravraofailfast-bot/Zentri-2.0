/**
 * SliderLiveReadout mechanic (Lighthouse / angle of depression)
 * Player rotates a beam by dragging a slider until it locks onto the target angle.
 *
 * Config shape:
 *   readout_values: string[]  – e.g. ['sin', 'cos', 'tan']
 *   angle_range: [min, max]  – e.g. [0, 90]
 */

import { useState, useEffect, useCallback } from 'react'

interface SliderLiveReadoutConfig {
  readout_values?: string[]
  angle_range?: [number, number]
}

interface Props {
  config: SliderLiveReadoutConfig
  onComplete: (result: { passed: boolean; score?: number }) => void
}

const DEG = Math.PI / 180

// Pick a pseudo-random target inside the range on mount
function pickTarget(min: number, max: number) {
  const SNAPSHOTS = [25, 30, 35, 40, 45]
  const feasible = SNAPSHOTS.filter((a) => a >= min && a <= max)
  return feasible[Math.floor(Math.random() * feasible.length)] ?? 30
}

export function SliderLiveReadout({ config, onComplete }: Props) {
  const [angleMin, angleMax] = config.angle_range ?? [0, 90]
  const readouts = config.readout_values ?? ['sin', 'cos', 'tan']

  const [target] = useState(() => pickTarget(angleMin, angleMax))
  const [angle, setAngle] = useState(angleMin)
  const [locked, setLocked] = useState(false)
  const [phase, setPhase] = useState<'aim' | 'reveal'>('aim')

  const TOLERANCE = 1.5
  const delta = Math.abs(angle - target)
  const isNear = delta <= TOLERANCE

  useEffect(() => {
    if (isNear && !locked) {
      setLocked(true)
      setTimeout(() => setPhase('reveal'), 600)
    }
  }, [isNear, locked])

  const handleReveal = useCallback(() => {
    onComplete({ passed: true, score: 100 })
  }, [onComplete])

  // Beam geometry (top-down lighthouse view)
  const CX = 140
  const CY = 80
  const BEAM_LEN = 120
  const rad = angle * DEG
  const bx = CX + BEAM_LEN * Math.cos(rad)
  const by = CY + BEAM_LEN * Math.sin(rad)

  const tRad = target * DEG
  const tx = CX + BEAM_LEN * Math.cos(tRad)
  const ty = CY + BEAM_LEN * Math.sin(tRad)

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      <div className="text-xs font-mono text-ember-400 uppercase tracking-widest">
        Angle Finder
      </div>

      {phase === 'aim' && (
        <>
          <p className="text-dusk-100 text-sm text-center">
            Sweep the beam until it <span className="text-ember-300 font-bold">locks</span> on the target.
          </p>

          {/* Readout values */}
          <div className="flex gap-4">
            {readouts.map((r) => {
              const val = r === 'sin' ? Math.sin(angle * DEG)
                       : r === 'cos' ? Math.cos(angle * DEG)
                       : Math.tan(angle * DEG)
              return (
                <div key={r} className="text-center">
                  <div className="text-xs text-dusk-400 uppercase">{r}</div>
                  <div className="text-ember-300 font-mono text-sm">{val.toFixed(3)}</div>
                </div>
              )
            })}
          </div>

          {/* Beam diagram */}
          <svg width={280} height={180}>
            {/* Target ghost beam */}
            <line x1={CX} y1={CY} x2={tx} y2={ty}
              stroke="#f4a261" strokeWidth={1} strokeDasharray="6 4" opacity={0.35} />
            <circle cx={tx} cy={ty} r={6} fill="none" stroke="#f4a261" strokeWidth={1} opacity={0.5} />
            <text x={tx + 8} y={ty} fill="#f4a261" fontSize={10} opacity={0.6}>target</text>

            {/* Live beam */}
            <line x1={CX} y1={CY} x2={bx} y2={by}
              stroke={locked ? '#7cffb6' : '#c4a882'}
              strokeWidth={locked ? 3 : 2}
              className="transition-all duration-150"
            />
            <circle cx={bx} cy={by} r={locked ? 8 : 5}
              fill={locked ? '#7cffb6' : '#c4a882'}
              className="transition-all duration-200"
            />

            {/* Lighthouse */}
            <circle cx={CX} cy={CY} r={10} fill="#4a3f35" stroke="#c4a882" strokeWidth={2} />
            <text x={CX} y={CY + 4} textAnchor="middle" fill="#e8d5b5" fontSize={9}>⚡</text>

            {/* Angle label */}
            <text x={CX + 16} y={CY + 18} fill={locked ? '#7cffb6' : '#f4a261'} fontSize={12} fontFamily="monospace">
              {angle}°{locked ? ' ✓ LOCKED' : ''}
            </text>
          </svg>

          {/* Slider */}
          <div className="w-full max-w-xs flex flex-col gap-1">
            <input
              type="range" min={angleMin} max={angleMax} value={angle}
              onChange={(e) => !locked && setAngle(Number(e.target.value))}
              className="w-full accent-ember-400"
            />
            <div className="flex justify-between text-xs font-mono text-dusk-400">
              <span>{angleMin}°</span>
              <span className={isNear ? 'text-green-400' : 'text-ember-300'}>{angle}°</span>
              <span>{angleMax}°</span>
            </div>
          </div>

          {locked && (
            <div className="text-green-300 text-sm font-semibold bg-green-900/40 px-4 py-1 rounded-full">
              ✓ Beam locked at {target}°
            </div>
          )}
        </>
      )}

      {phase === 'reveal' && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="text-green-400 text-2xl">✓</div>
          <p className="text-dusk-100 text-sm text-center">
            Locked at <span className="text-ember-300 font-bold">{target}°</span>
          </p>
          <div className="flex gap-4">
            {readouts.map((r) => {
              const val = r === 'sin' ? Math.sin(target * DEG)
                       : r === 'cos' ? Math.cos(target * DEG)
                       : Math.tan(target * DEG)
              return (
                <div key={r} className="text-center bg-dusk-800/60 px-3 py-2 rounded-lg">
                  <div className="text-xs text-dusk-400 uppercase mb-1">{r} {target}°</div>
                  <div className="text-green-300 font-mono font-bold">{val.toFixed(4)}</div>
                </div>
              )
            })}
          </div>
          <button
            onClick={handleReveal}
            className="mt-2 px-8 py-2 rounded-full bg-ember-500 text-white font-bold text-sm
              active:scale-95 transition-all"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  )
}
