/**
 * BuildDiagram mechanic (Unit Circle / Identity Verifier)
 * Player rotates angle slider; diagram animates to verify an identity holds at any θ.
 *
 * Config shape:
 *   steps: [{mechanic, weight}]  – composite step config (used by boss mechanic)
 */

import { useState, useMemo, useCallback } from 'react'

interface BuildDiagramConfig {
  steps?: Array<{ mechanic: string; weight: number }>
}

interface Props {
  config: BuildDiagramConfig
  onComplete: (result: { passed: boolean; score?: number }) => void
}

const DEG = Math.PI / 180
const R = 80 // circle radius
const CX = 140, CY = 130

const IDENTITIES = [
  {
    label: 'sin²θ + cos²θ = 1',
    compute: (a: number) => {
      const s = Math.sin(a * DEG), c = Math.cos(a * DEG)
      return { lhs: `${(s * s).toFixed(3)} + ${(c * c).toFixed(3)}`, value: s * s + c * c }
    },
  },
  {
    label: '1 + tan²θ = sec²θ',
    compute: (a: number) => {
      const t = Math.tan(a * DEG), s = 1 / Math.cos(a * DEG)
      const lhsVal = 1 + t * t
      return { lhs: `${(1 + t * t).toFixed(3)}`, value: lhsVal, rhs: `${(s * s).toFixed(3)}` }
    },
  },
]

export function BuildDiagram({ config: _config, onComplete }: Props) {
  const [angle, setAngle] = useState(30)
  const [identityIdx] = useState(0)
  const [verified, setVerified] = useState(0)
  const VERIFY_TARGET = 5 // player must verify at 5 different angles

  const identity = IDENTITIES[identityIdx]
  const { lhs, value } = useMemo(() => identity.compute(angle), [angle, identity])
  const holds = Math.abs(value - 1) < 0.001

  // Unit circle point
  const rad = angle * DEG
  const px = CX + R * Math.cos(rad)
  const py = CY - R * Math.sin(rad)

  const handleVerify = useCallback(() => {
    if (!holds) return
    const next = verified + 1
    setVerified(next)
    if (next >= VERIFY_TARGET) {
      setTimeout(() => onComplete({ passed: true, score: 100 }), 600)
    }
    // Move to a new angle so user sweeps the circle
    setAngle((a) => (a + 37) % 90 + 5)
  }, [holds, verified, onComplete])

  return (
    <div className="flex flex-col items-center gap-3 p-4 select-none">
      <div className="text-xs text-ember-400 uppercase tracking-widest font-mono">
        Verify the identity
      </div>

      <div className="font-mono text-base text-dusk-100 bg-dusk-800/50 px-4 py-2 rounded-xl">
        {identity.label}
      </div>

      {/* Unit circle */}
      <svg width={280} height={270}>
        {/* Axes */}
        <line x1={CX - R - 10} y1={CY} x2={CX + R + 10} y2={CY} stroke="#4a3f35" strokeWidth={1} />
        <line x1={CX} y1={CY - R - 10} x2={CX} y2={CY + R + 10} stroke="#4a3f35" strokeWidth={1} />

        {/* Circle */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#4a3f35" strokeWidth={1.5} />

        {/* sin line (vertical) */}
        <line x1={px} y1={CY} x2={px} y2={py}
          stroke="#f4a261" strokeWidth={2} strokeDasharray="4 2" />
        <text x={px + 4} y={(CY + py) / 2} fill="#f4a261" fontSize={9}>sin</text>

        {/* cos line (horizontal) */}
        <line x1={CX} y1={py} x2={px} y2={py}
          stroke="#7eb8d4" strokeWidth={2} strokeDasharray="4 2" />
        <text x={(CX + px) / 2} y={py - 4} fill="#7eb8d4" fontSize={9} textAnchor="middle">cos</text>

        {/* Radius */}
        <line x1={CX} y1={CY} x2={px} y2={py}
          stroke={holds ? '#7cffb6' : '#e8d5b5'} strokeWidth={2.5}
          className="transition-colors duration-200"
        />

        {/* Point */}
        <circle cx={px} cy={py} r={6}
          fill={holds ? '#7cffb6' : '#c4a882'}
          className="transition-colors duration-200"
        />

        {/* Angle arc */}
        <path
          d={`M ${CX + 22} ${CY} A 22 22 0 0 0 ${CX + 22 * Math.cos(rad)} ${CY - 22 * Math.sin(rad)}`}
          fill="none" stroke="#f4a261" strokeWidth={1.5}
        />
        <text x={CX + 26} y={CY + 2} fill="#f4a261" fontSize={10} fontFamily="monospace">θ</text>

        {/* Identity computation */}
        <text x={CX} y={CY + R + 30} fill={holds ? '#7cffb6' : '#c4a882'}
          fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
          {lhs} = {value.toFixed(4)}
          {holds ? ' ✓' : ''}
        </text>
        <text x={CX} y={CY + R + 44} fill="#888" fontSize={10} textAnchor="middle">
          at θ = {angle}°
        </text>
      </svg>

      {/* Angle slider */}
      <div className="w-full max-w-xs flex flex-col gap-1">
        <input type="range" min={5} max={89} value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
          className="w-full accent-ember-400"
        />
        <div className="flex justify-between text-xs text-dusk-400 font-mono">
          <span>5°</span>
          <span className="text-ember-300">{angle}°</span>
          <span>89°</span>
        </div>
      </div>

      {/* Verify button */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleVerify}
          disabled={!holds}
          className="px-8 py-2 rounded-full bg-ember-500 text-white font-bold text-sm
            disabled:opacity-30 active:scale-95 transition-all"
        >
          Verify at {angle}° →
        </button>
        <div className="text-xs text-dusk-400">
          Verified at {verified}/{VERIFY_TARGET} angles
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {Array.from({ length: VERIFY_TARGET }).map((_, i) => (
          <div key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < verified ? 'bg-green-400' : 'bg-dusk-600'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
