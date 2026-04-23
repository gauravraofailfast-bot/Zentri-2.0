/**
 * DragMatchSlot mechanic (Ratio Decoder)
 * Player taps choices to fill ratio slots (sin, cos, tan) from given info.
 *
 * Config shape: generic — component uses concept defaults
 */

import { useState, useCallback } from 'react'

interface DragMatchSlotConfig {
  // No mandatory config — the mechanic generates its own round
  rounds?: number
}

interface Props {
  config: DragMatchSlotConfig
  onComplete: (result: { passed: boolean; score?: number }) => void
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}
function simplify(num: number, den: number): string {
  const g = gcd(Math.abs(num), Math.abs(den))
  return `${num / g}/${den / g}`
}

interface Round {
  opp: number
  adj: number
  hyp: number
  slots: ('sin' | 'cos' | 'tan')[]
}

function makeRound(): Round {
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]
  const t = TRIPLES[Math.floor(Math.random() * TRIPLES.length)]
  const slots: ('sin' | 'cos' | 'tan')[] = ['sin', 'cos', 'tan']
  return { opp: t[0], adj: t[1], hyp: t[2], slots }
}

function makeOptions(opp: number, adj: number, hyp: number, slot: 'sin' | 'cos' | 'tan'): string[] {
  const correct =
    slot === 'sin' ? simplify(opp, hyp) :
    slot === 'cos' ? simplify(adj, hyp) :
    simplify(opp, adj)

  // Two plausible distractors
  const d1 = slot === 'sin' ? simplify(adj, hyp) : simplify(opp, hyp)
  const d2 = slot === 'tan' ? simplify(adj, opp) : simplify(opp, adj)

  return [correct, d1, d2].sort(() => Math.random() - 0.5)
}

export function DragMatchSlot({ config, onComplete }: Props) {
  const totalRounds = config.rounds ?? 3

  const [round, setRound] = useState(0)
  const [rdata] = useState<Round[]>(() => Array.from({ length: totalRounds }, makeRound))
  const [answered, setAnswered] = useState<Record<string, boolean>>({})
  const [tries, setTries] = useState(0)

  const r = rdata[round]
  const allDone = r.slots.every((s) => answered[s])

  const correct: Record<string, string> = {
    sin: simplify(r.opp, r.hyp),
    cos: simplify(r.adj, r.hyp),
    tan: simplify(r.opp, r.adj),
  }

  const handlePick = useCallback(
    (slot: 'sin' | 'cos' | 'tan', choice: string) => {
      if (answered[slot]) return
      const isRight = choice === correct[slot]
      setTries((n) => n + 1)
      if (isRight) {
        setAnswered((prev) => ({ ...prev, [slot]: true }))
      }
    },
    [answered, correct]
  )

  const advance = useCallback(() => {
    const next = round + 1
    if (next >= totalRounds) {
      onComplete({ passed: true, score: Math.max(0, 100 - tries * 5) })
    } else {
      setRound(next)
      setAnswered({})
    }
  }, [round, totalRounds, tries, onComplete])

  return (
    <div className="flex flex-col gap-4 p-4 select-none">
      <div className="text-xs text-ember-400 font-mono uppercase tracking-widest text-center">
        Round {round + 1}/{totalRounds}
      </div>

      {/* Triangle info */}
      <div className="text-center">
        <div className="text-dusk-400 text-xs mb-1">Given triangle (sides)</div>
        <div className="font-mono text-sm text-dusk-100">
          opp = {r.opp} &nbsp; adj = {r.adj} &nbsp; hyp = {r.hyp}
        </div>
      </div>

      {/* SVG right triangle */}
      <svg width={200} height={140} className="mx-auto">
        <line x1={20} y1={120} x2={160} y2={120} stroke="#c4a882" strokeWidth={2} />
        <line x1={160} y1={120} x2={160} y2={20} stroke="#c4a882" strokeWidth={2} />
        <line x1={20} y1={120} x2={160} y2={20} stroke="#e8d5b5" strokeWidth={2.5} />
        <rect x={150} y={110} width={10} height={10} fill="none" stroke="#c4a882" strokeWidth={1.5} />
        <text x={85} y={135} fill="#c4a882" fontSize={10} textAnchor="middle">adj = {r.adj}</text>
        <text x={170} y={72} fill="#c4a882" fontSize={10}>opp = {r.opp}</text>
        <text x={70} y={62} fill="#e8d5b5" fontSize={10} transform="rotate(-34,70,62)">hyp = {r.hyp}</text>
        <text x={32} y={110} fill="#f4a261" fontSize={12}>θ</text>
      </svg>

      {/* Slots */}
      {r.slots.map((slot) => {
        const opts = makeOptions(r.opp, r.adj, r.hyp, slot)
        const done = answered[slot]
        return (
          <div key={slot} className="border border-dusk-700 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-ember-300 font-mono font-bold">{slot} θ =</span>
              {done ? (
                <span className="text-green-300 font-mono bg-green-900/30 px-2 py-0.5 rounded">
                  {correct[slot]} ✓
                </span>
              ) : (
                <span className="text-dusk-500 font-mono">?</span>
              )}
            </div>
            {!done && (
              <div className="flex flex-wrap gap-2">
                {opts.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handlePick(slot, opt)}
                    className="px-3 py-1 rounded-lg bg-dusk-700 text-dusk-100 text-sm font-mono
                      hover:bg-ember-800/60 active:scale-95 transition-all border border-dusk-600"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {allDone && (
        <button
          onClick={advance}
          className="mx-auto mt-1 px-8 py-2 rounded-full bg-ember-500 text-white font-bold text-sm active:scale-95"
        >
          {round + 1 >= totalRounds ? 'Complete ✓' : 'Next Round →'}
        </button>
      )}
    </div>
  )
}
