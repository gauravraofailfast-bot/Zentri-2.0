import { StatusBar, Stars, Icon, TabBar, Tappable } from '../ui/Shell'

type NavId = 'home' | 'world' | 'raid' | 'progress'

interface Mission {
  id: string; x: number; y: number; title: string; sub: string
  done?: boolean; active?: boolean; locked?: boolean; boss?: boolean
}

interface Props {
  onBack: () => void
  onNav: (id: NavId) => void
}

const missions: Mission[] = [
  { id: 'm1', x: 80,  y: 640, title: 'The Right Triangle', sub: 'Opposite, adjacent, hypotenuse',  done: true },
  { id: 'm2', x: 210, y: 560, title: 'Ratio Workshop',     sub: 'sin, cos, tan — first hits',       done: true },
  { id: 'm3', x: 120, y: 460, title: "Archer's Angle",      sub: 'Aim to learn the ratios',          active: true },
  { id: 'm4', x: 260, y: 380, title: 'Special Angles',      sub: '30°, 45°, 60°, 0°, 90°' },
  { id: 'm5', x: 140, y: 290, title: 'Identity Forge',       sub: 'sin²θ + cos²θ = 1',               locked: true },
  { id: 'm6', x: 240, y: 210, title: 'Lighthouse',           sub: 'Angles of elevation & depression', locked: true },
  { id: 'm7', x: 180, y: 110, title: 'The Dusk Minar',       sub: 'Boss: measure a tower without a tape', locked: true, boss: true },
]

function MissionNode({ m, onTap }: { m: Mission; onTap: () => void }) {
  const size = m.boss ? 72 : m.active ? 64 : 56
  const c = m.done ? '#5eead4' : m.active ? '#ff7849' : m.locked ? 'rgba(255,255,255,0.4)' : '#fbbf24'

  return (
    <Tappable onClick={onTap} style={{
      position: 'absolute', left: m.x, top: m.y,
      transform: 'translate(-50%, -50%)',
      width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      <div style={{
        width: size, height: size, borderRadius: size / 2,
        background: m.done   ? 'linear-gradient(180deg, #5eead4, #2dd4bf)'
                  : m.active ? 'linear-gradient(180deg, #ff8a5c, #ff6b3d)'
                  : m.locked ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.12)',
        border: m.boss ? '2px solid #fbbf24' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: m.active
          ? '0 0 0 2px rgba(255,120,73,0.3), 0 0 40px rgba(255,120,73,0.5), inset 0 2px 4px rgba(255,255,255,0.4)'
          : m.done
          ? '0 0 20px rgba(94,234,212,0.4), inset 0 2px 4px rgba(255,255,255,0.3)'
          : 'inset 0 0 0 1px rgba(255,255,255,0.15)',
        flexShrink: 0,
      }}>
        {m.done   && <Icon name="check"  size={24} color="#042f2e"/>}
        {m.active && <Icon name="play"   size={22} color="#1a0f08"/>}
        {m.locked && <Icon name="lock"   size={18} color="rgba(255,255,255,0.5)"/>}
        {m.boss && !m.done && !m.active && !m.locked && <Icon name="crown" size={24} color="#fbbf24"/>}
        {!m.done && !m.active && !m.locked && !m.boss && (
          <div style={{ width: 8, height: 8, borderRadius: 4, background: c, boxShadow: `0 0 10px ${c}` }}/>
        )}
      </div>
      <div style={{ textAlign: 'center', marginTop: 2 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: m.locked ? 'rgba(255,255,255,0.5)' : '#fff' }}>{m.title}</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 1 }}>{m.sub}</div>
      </div>
    </Tappable>
  )
}

export function WorldScene({ onBack, onNav }: Props) {
  return (
    <div className="screen sky-night">
      <Stars count={60}/>
      <StatusBar/>

      <div style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Tappable onClick={onBack} className="glass" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chev-left" size={18}/>
        </Tappable>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted-2)' }}>CH 8 · WORLD OF TRIANGLES</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Trigonometry</div>
        </div>
        <div className="chip chip-ember">2 / 7</div>
      </div>

      <div className="scroll scene-enter" style={{ height: '100%', paddingTop: 110, paddingBottom: 110, position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', height: 760, margin: '0 auto' }}>
          <svg viewBox="0 0 360 760" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="pathGrad" x1="0" x2="0" y1="1" y2="0">
                <stop offset="0" stopColor="#ff7849"/>
                <stop offset="0.45" stopColor="#ffb37a" stopOpacity="0.5"/>
                <stop offset="1" stopColor="#5eead4" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
            <path d="M80 640 L210 560 L120 460 L260 380 L140 290 L240 210 L180 110"
              fill="none" stroke="url(#pathGrad)" strokeWidth="2"
              strokeDasharray="4 6" strokeLinecap="round"/>
            {missions.filter(m => m.active).map(m => (
              <g key={m.id + 'g'}>
                <circle cx={m.x} cy={m.y} r="40" fill="none" stroke="#ff7849" strokeOpacity="0.3" strokeWidth="1">
                  <animate attributeName="r" from="30" to="50" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="stroke-opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite"/>
                </circle>
              </g>
            ))}
          </svg>

          {missions.map(m => (
            <MissionNode key={m.id} m={m} onTap={() => !m.locked && onBack()}/>
          ))}

          <svg viewBox="0 0 360 120" style={{ position: 'absolute', top: 0, width: '100%', height: 120, opacity: 0.4, pointerEvents: 'none' }}>
            <path d="M170 120 L170 60 L174 55 L174 30 L178 26 L178 12 L180 8 L182 12 L182 26 L186 30 L186 55 L190 60 L190 120 Z" fill="#1a1432"/>
          </svg>
        </div>
      </div>

      <TabBar active="world" onNav={onNav}/>
    </div>
  )
}
