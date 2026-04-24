import { StatusBar, Stars, Icon, TabBar, Tappable } from '../ui/Shell'

type NavId = 'home' | 'world' | 'raid' | 'progress'

interface Props {
  onBack: () => void
  onNav: (id: NavId) => void
  confidence: number
  streak: number
}

const starNodes = [
  { x: 80,  y: 120, r: 4, lit: true,  label: 'Right triangle' },
  { x: 180, y: 80,  r: 5, lit: true,  label: 'Hypotenuse'     },
  { x: 270, y: 140, r: 4, lit: true,  label: 'Opposite'       },
  { x: 120, y: 220, r: 4, lit: true,  label: 'Adjacent'       },
  { x: 220, y: 230, r: 5, lit: true,  label: 'sin θ'          },
  { x: 310, y: 250, r: 4, lit: false, label: 'cos θ'          },
  { x: 170, y: 320, r: 5, lit: false, label: 'tan θ'          },
  { x: 260, y: 340, r: 4, lit: false, label: 'Identity'       },
]
const connections = [[0,1],[1,2],[0,3],[3,4],[2,4],[4,5],[4,6],[6,7]] as [number, number][]

const timeline = [
  { t: 'Tonight',    d: 'Cracked tan θ = opposite / adjacent on your 4th try. Pattern clicked.',          c: '#ff7849' },
  { t: 'Yesterday',  d: "You kept trying after a near-miss. That's what levels up confidence.",            c: '#5eead4' },
  { t: '3 days ago', d: 'First time you named the hypotenuse without looking. Logged.',                    c: '#a78bfa' },
]

export function ProgressScene({ onBack, onNav, confidence, streak }: Props) {
  return (
    <div className="screen sky-night">
      <Stars count={80}/>
      <StatusBar/>

      <div style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Tappable onClick={onBack} className="glass" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chev-left" size={18}/>
        </Tappable>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted-2)' }}>YOUR NIGHT SKY</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Progress</div>
        </div>
      </div>

      <div className="scroll scene-enter" style={{ height: '100%', paddingTop: 110, paddingBottom: 110 }}>

        {/* Hero stats */}
        <div style={{ padding: '0 20px 16px' }}>
          <div className="glass-dark p-6">
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.2em' }}>CONFIDENCE</div>
            <div className="row between" style={{ alignItems: 'flex-end', marginTop: 4 }}>
              <div className="h-display" style={{ fontSize: 56 }}>
                {confidence}<span style={{ fontSize: 22, color: 'var(--muted)' }}>/100</span>
              </div>
              <span className="chip chip-ember"><Icon name="flame" size={12}/> {streak} nights</span>
            </div>
            <div className="meter ember" style={{ marginTop: 12 }}>
              <div className="fill" style={{ width: confidence + '%' }}/>
            </div>
            <div className="body" style={{ fontSize: 13, marginTop: 14 }}>
              You&apos;re moving the right way. <b style={{ color: '#fff' }}>Ratios</b> are clicking —
              next the game will lean into <b style={{ color: 'var(--teal)' }}>identities</b>.
            </div>
          </div>
        </div>

        {/* Constellation */}
        <div style={{ padding: '0 20px 16px' }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <div className="h-section">Constellation: Triangles</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)' }}>5 / 8 stars lit</div>
          </div>
          <div style={{ position: 'relative', height: 380, borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(180deg, #05061a 0%, #0a1028 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
            <svg viewBox="0 0 360 380" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              {connections.map(([a, b], i) => {
                const lit = starNodes[a].lit && starNodes[b].lit
                return (
                  <line key={i}
                    x1={starNodes[a].x} y1={starNodes[a].y}
                    x2={starNodes[b].x} y2={starNodes[b].y}
                    stroke={lit ? '#ffb37a' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={lit ? 1.2 : 0.6}
                    strokeDasharray={lit ? '0' : '3 3'}
                    opacity={lit ? 0.7 : 0.5}/>
                )
              })}
              {starNodes.map((s, i) => (
                <g key={i}>
                  <circle cx={s.x} cy={s.y} r={s.r + (s.lit ? 4 : 0)} fill={s.lit ? '#ffb37a' : 'rgba(255,255,255,0.2)'} opacity={s.lit ? 0.3 : 0.5}/>
                  <circle cx={s.x} cy={s.y} r={s.r} fill={s.lit ? '#fff' : 'rgba(255,255,255,0.4)'}/>
                  <text x={s.x} y={s.y + s.r + 14} fontSize="9" fill={s.lit ? '#ffd6bf' : 'rgba(255,255,255,0.4)'} textAnchor="middle" fontFamily="JetBrains Mono">{s.label}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Story timeline */}
        <div style={{ padding: '0 20px 16px' }}>
          <div className="h-section" style={{ marginBottom: 10 }}>Your story so far</div>
          <div className="col gap-2">
            {timeline.map((e, i) => (
              <div key={i} className="glass p-4" style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 3, borderRadius: 2, background: e.c, flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 10, color: e.c, letterSpacing: '0.1em' }}>{e.t.toUpperCase()}</div>
                  <div style={{ fontSize: 13, marginTop: 3, color: 'rgba(255,255,255,0.85)' }}>{e.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TabBar active="progress" onNav={onNav}/>
    </div>
  )
}
