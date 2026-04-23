/**
 * TwoPointMeasure mechanic (River Boss / Two-angle problem)
 * Player must lock TWO independent angle sliders before advancing.
 *
 * Config shape:
 *   scenarios: number
 *   angle_types: string[]
 */

import { useState, useEffect } from 'react'

interface TwoPointMeasureConfig {
  scenarios?: number
  angle_types?: string[]
}

interface Props {
  config: TwoPointMeasureConfig
  onComplete: (result: { passed: boolean; score?: number }) => void
}

const DEG = Math.PI / 180
const TOL = 2.0

const SCENARIOS = [
  {
    label: 'River Crossing',
    description: 'Lock both beams on the far bank to find the river width.',
    target1: 30, target2: 45,
    label1: 'Left beam', label2: 'Right beam',
  },
  {
    label: 'Tower Heights',
    description: 'Measure elevation angles from two positions 20 m apart.',
    target1: 40, target2: 55,
    label1: 'Near position', label2: 'Far position',
  },
]

export function TwoPointMeasure({ config, onComplete }: Props) {
  const totalScenarios = config.scenarios ?? 1
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [angle1, setAngle1] = useState(15)
  const [angle2, setAngle2] = useState(15)
  const [locked1, setLocked1] = useState(false)
  const [locked2, setLocked2] = useState(false)
  const [phase, setPhase] = useState<'aim' | 'answer' | 'done'>('aim')

  const sc = SCENARIOS[scenarioIdx % SCENARIOS.length]

  useEffect(() => {
    if (!locked1 && Math.abs(angle1 - sc.target1) <= TOL) setLocked1(true)
    if (locked1 && Math.abs(angle1 - sc.target1) > TOL) setLocked1(false)
  }, [angle1, sc.target1, locked1])

  useEffect(() => {
    if (!locked2 && Math.abs(angle2 - sc.target2) <= TOL) setLocked2(true)
    if (locked2 && Math.abs(angle2 - sc.target2) > TOL) setLocked2(false)
  }, [angle2, sc.target2, locked2])

  useEffect(() => {
    if (locked1 && locked2 && phase === 'aim') {
      setTimeout(() => setPhase('answer'), 500)
    }
  }, [locked1, locked2, phase])

  function advance() {
    const next = scenarioIdx + 1
    if (next >= totalScenarios) {
      onComplete({ passed: true, score: 100 })
    } else {
      setScenarioIdx(next)
      setAngle1(15)
      setAngle2(15)
      setLocked1(false)
      setLocked2(false)
      setPhase('aim')
    }
  }

  // SVG diagram
  const W = 280
  const groundY = 160
  const p1x = 50, p2x = 230

  function beam(px: number, angleDeg: number, len = 100, locked: boolean) {
    const rad = angleDeg * DEG
    return {
      x2: px + len * Math.cos(Math.PI - rad),
      y2: groundY - len * Math.sin(rad),
      color: locked ? '#7cffb6' : '#c4a882',
    }
  }
  const b1 = beam(p1x, angle1, 100, locked1)
  const b2 = beam(p2x, angle2, 100, locked2)

  return (
    <div className="flex flex-col items-center gap-3 p-4 select-none">
      <div className="text-xs text-ember-400 font-mono uppercase tracking-widest">
        {sc.label} · {scenarioIdx + 1}/{totalScenarios}
      </div>
      <p className="text-dusk-100 text-sm text-center text-xs">{sc.description}</p>

      {/* Diagram */}
      <svg width={W} height={180}>
        {/* Ground */}
        <line x1={20} y1={groundY} x2={W - 20} y2={groundY} stroke="#4a3f35" strokeWidth={2} />

        {/* Target ghost beams */}
        {[{ px: p1x, t: sc.target1 }, { px: p2x, t: sc.target2 }].map(({ px, t }, i) => {
          const rad = t * DEG
          const gx = px + 90 * Math.cos(Math.PI - rad)
          const gy = groundY - 90 * Math.sin(rad)
          return (
            <line key={i} x1={px} y1={groundY} x2={gx} y2={gy}
              stroke="#f4a261" strokeWidth={1} strokeDasharray="5 3" opacity={0.3} />
          )
        })}

        {/* Beam 1 */}
        <line x1={p1x} y1={groundY} x2={b1.x2} y2={b1.y2}
          stroke={b1.color} strokeWidth={2} className="transition-all duration-150" />
        <circle cx={p1x} cy={groundY} r={5} fill={locked1 ? '#7cffb6' : '#c4a882'} />

        {/* Beam 2 */}
        <line x1={p2x} y1={groundY} x2={b2.x2} y2={b2.y2}
          stroke={b2.color} strokeWidth={2} className="transition-all duration-150" />
        <circle cx={p2x} cy={groundY} r={5} fill={locked2 ? '#7cffb6' : '#c4a882'} />

        {/* Distance marker */}
        <line x1={p1x} y1={groundY + 20} x2={p2x} y2={groundY + 20} stroke="#4a3f35" strokeWidth={1} />
        <text x={(p1x + p2x) / 2} y={groundY + 32} fill="#c4a882" fontSize={9} textAnchor="middle">20 m</text>
      </svg>

      {phase === 'aim' && (
        <>
          {/* Slider 1 */}
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-dusk-400">{sc.label1}</span>
              <span className={`font-mono ${locked1 ? 'text-green-400' : 'text-ember-300'}`}>
                {angle1}°{locked1 ? ' ✓' : ''}
              </span>
            </div>
            <input type="range" min={5} max={80} value={angle1}
              onChange={(e) => setAngle1(Number(e.target.value))}
              className="w-full accent-ember-400" />
          </div>

          {/* Slider 2 */}
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-dusk-400">{sc.label2}</span>
              <span className={`font-mono ${locked2 ? 'text-green-400' : 'text-ember-300'}`}>
                {angle2}°{locked2 ? ' ✓' : ''}
              </span>
            </div>
            <input type="range" min={5} max={80} value={angle2}
              onChange={(e) => setAngle2(Number(e.target.value))}
              className="w-full accent-ember-400" />
          </div>

          <p className="text-xs text-dusk-500">
            {locked1 && locked2 ? '✓ Both locked!' :
             locked1 ? `✓ Left locked — now adjust ${sc.label2}` :
             locked2 ? `✓ Right locked — now adjust ${sc.label1}` :
             'Sweep each beam to its target angle'}
          </p>
        </>
      )}

      {phase === 'answer' && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-green-400 font-semibold">✓ Both angles locked!</div>
          <div className="bg-dusk-800/60 rounded-xl p-3 text-sm text-center">
            <div className="text-dusk-400 text-xs mb-1">Using tan — Height formula</div>
            <div className="font-mono text-dusk-100">
              H = d · tan{sc.target1}° · tan{sc.target2}°<br />
              <span className="text-dusk-400">/ (tan{sc.target2}° − tan{sc.target1}°)</span>
            </div>
          </div>
          <button onClick={advance}
            className="px-8 py-2 rounded-full bg-ember-500 text-white font-bold text-sm active:scale-95">
            Continue →
          </button>
        </div>
      )}
    </div>
  )
}
