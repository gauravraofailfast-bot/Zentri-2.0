import { Stars, Icon, Tappable } from '../ui/Shell'

interface Props {
  confidence: number
  streak: number
  completedConceptIds: string[]
  onClose: () => void
}

const starNodes = [
  { x: 80,  y: 100, r: 4, label: 'Right triangle' },
  { x: 180, y: 65,  r: 5, label: 'Hypotenuse'     },
  { x: 270, y: 115, r: 4, label: 'Opposite'       },
  { x: 120, y: 195, r: 4, label: 'Adjacent'       },
  { x: 220, y: 205, r: 5, label: 'sin θ'          },
  { x: 310, y: 225, r: 4, label: 'cos θ'          },
  { x: 170, y: 295, r: 5, label: 'tan θ'          },
  { x: 260, y: 315, r: 4, label: 'Identity'       },
]

const CONCEPT_STAR_MAP: Record<string, number> = {
  'class10-math-ch8-triangle-anatomy': 0,
  'class10-math-ch8-ratio-definition': 4,
  'class10-math-ch8-standard-angles':  1,
  'class10-math-ch9-elevation-depression': 5,
  'class10-math-ch9-synthesis': 7,
}

const connections: [number, number][] = [[0,1],[1,2],[0,3],[3,4],[2,4],[4,5],[4,6],[6,7]]

const timeline = [
  { t: 'Right now',  d: 'Your journey across India has begun. Each landmark lights a new star.',              c: 'var(--ember)' },
  { t: 'Next',       d: 'Complete Jantar Mantar Ratios to light sin θ and connect the constellation.',         c: 'var(--teal)'  },
  { t: 'Ahead',      d: 'Archer\'s Angle will show you how sin, cos, and tan relate to every real angle.',    c: 'var(--violet)'},
]

export function SkyOverlay({ confidence, streak, completedConceptIds, onClose }: Props) {
  const litStars = new Set(completedConceptIds.map(id => CONCEPT_STAR_MAP[id]).filter(i => i !== undefined))

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 40,
      background: 'linear-gradient(180deg,#05061a 0%,#0a0f24 100%)',
      display: 'flex', flexDirection: 'column',
      animation: 'skySlideDown 0.38s cubic-bezier(0.16,1,0.3,1)',
      overflowY: 'auto',
      scrollbarWidth: 'none',
    }}>
      <style>{`
        @keyframes skySlideDown {
          from { transform: translateY(-40px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>

      <Stars count={70} topBias={0.8}/>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, padding: '52px 20px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--muted-2)' }}>YOUR NIGHT SKY</div>
          <div style={{ fontWeight: 700, fontSize: 22, marginTop: 4 }}>Progress</div>
        </div>
        <Tappable onClick={onClose} className="glass" style={{
          width: 38, height: 38, borderRadius: 19, marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="close" size={16}/>
        </Tappable>
      </div>

      {/* Hero stats */}
      <div style={{ padding: '0 20px 16px', position: 'relative', zIndex: 10 }}>
        <div className="glass-dark p-5">
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.18em' }}>CONFIDENCE</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
            <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'var(--f-display)', lineHeight: 1 }}>
              {confidence}<span style={{ fontSize: 18, color: 'var(--muted)', fontWeight: 400 }}>/100</span>
            </div>
            <span className="chip chip-ember"><Icon name="flame" size={12}/> {streak} nights</span>
          </div>
          <div className="meter ember" style={{ marginTop: 12 }}>
            <div className="fill" style={{ width: confidence + '%' }}/>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 10, lineHeight: 1.5 }}>
            You're moving the right way. Keep lighting stars on your constellation.
          </div>
        </div>
      </div>

      {/* Constellation */}
      <div style={{ padding: '0 20px 16px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="h-section">Constellation: Triangles</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)' }}>{litStars.size} / {starNodes.length} lit</div>
        </div>
        <div style={{ position: 'relative', height: 360, borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(180deg,#05061a 0%,#0a1028 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}>
          <svg viewBox="0 0 360 360" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {connections.map(([a, b], i) => {
              const bothLit = litStars.has(a) && litStars.has(b)
              return (
                <line key={i}
                  x1={starNodes[a].x} y1={starNodes[a].y}
                  x2={starNodes[b].x} y2={starNodes[b].y}
                  stroke={bothLit ? '#ffb37a' : 'rgba(255,255,255,0.12)'}
                  strokeWidth={bothLit ? 1.2 : 0.6}
                  strokeDasharray={bothLit ? '0' : '3 4'}
                  opacity={bothLit ? 0.7 : 0.5}
                />
              )
            })}
            {starNodes.map((s, i) => {
              const lit = litStars.has(i)
              return (
                <g key={i}>
                  {lit && <circle cx={s.x} cy={s.y} r={s.r + 6} fill="#ffb37a" opacity={0.2}/>}
                  <circle cx={s.x} cy={s.y} r={s.r} fill={lit ? '#fff' : 'rgba(255,255,255,0.35)'}/>
                  <text x={s.x} y={s.y + s.r + 13} fontSize="9" fill={lit ? '#ffd6bf' : 'rgba(255,255,255,0.35)'} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                    {s.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Story timeline */}
      <div style={{ padding: '0 20px 32px', position: 'relative', zIndex: 10 }}>
        <div className="h-section" style={{ marginBottom: 10 }}>Your story so far</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {timeline.map((e, i) => (
            <div key={i} className="glass" style={{ display: 'flex', gap: 12, padding: 14 }}>
              <div style={{ width: 3, borderRadius: 2, background: e.c, flexShrink: 0 }}/>
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 10, color: e.c, letterSpacing: '0.12em' }}>{e.t.toUpperCase()}</div>
                <div style={{ fontSize: 12, marginTop: 3, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{e.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Return button */}
      <div style={{ padding: '0 20px 32px', position: 'relative', zIndex: 10 }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ width: '100%', padding: 14 }}>
          <Icon name="chev-down" size={16}/> Back to Journey
        </button>
      </div>
    </div>
  )
}
