import { StatusBar, DuskSkyline, Stars, Orb, Icon, TabBar, Tappable } from '../ui/Shell'

export interface Player { name: string; intent: string }
export interface Progress { confidence: number; streak: number; mission: number; totalMissions: number }

type NavId = 'home' | 'world' | 'raid' | 'progress'

interface Props {
  player: Player
  progress: Progress
  onNav: (id: NavId) => void
  onEnterWorld: () => void
  onMultiplayer: () => void
}

export function LobbyScene({ player, progress, onNav, onEnterWorld, onMultiplayer }: Props) {
  const confidencePct = progress.confidence

  return (
    <div className="screen sky-dusk">
      <Stars count={35}/>
      <DuskSkyline height={220} opacity={0.9}/>
      <StatusBar/>

      <div className="scroll scene-enter" style={{ height: '100%', paddingTop: 60, paddingBottom: 110 }}>

        {/* Greeting */}
        <div className="p-5 col gap-3">
          <div className="row between" style={{ alignItems: 'flex-end' }}>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--ember-glow)' }}>THE DUSK MINAR · CH 8</div>
              <div className="h-display" style={{ fontSize: 30, marginTop: 6 }}>
                Welcome back,<br/>
                <span style={{ color: 'var(--ember-glow)' }}>{player.name}.</span>
              </div>
            </div>
            <Orb size={52}/>
          </div>
          <div className="body" style={{ fontSize: 14 }}>The sky remembers where you left off.</div>
        </div>

        {/* Continue hero card */}
        <div className="p-4">
          <Tappable onClick={onEnterWorld} className="glass-dark"
            style={{ display: 'block', position: 'relative', overflow: 'hidden', borderRadius: 28, width: '100%' }}>
            <div style={{ position: 'relative', height: 180, background: 'linear-gradient(135deg, #3b2a62 0%, #8a3a5e 60%, #ff7849 100%)', overflow: 'hidden' }}>
              {/* mini skyline in card */}
              <svg viewBox="0 0 360 120" style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                <path d="M0 100 L40 85 L60 95 L80 70 L100 80 L120 60 L140 90
                  L 160 90 L 162 45 L 166 43 L 166 30 L 170 27 L 170 20 L 174 20 L 174 27 L 178 30 L 178 43 L 182 45 L 182 90
                  L 200 90 L 220 75 L 260 85 L 300 70 L 340 85 L 360 80 L 360 120 L 0 120Z"
                  fill="#1a0a1f" opacity="0.85"/>
              </svg>
              <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span className="chip chip-ember"><Icon name="flame" size={12}/> CONTINUE</span>
                <span className="chip">Mission {progress.mission} of {progress.totalMissions}</span>
              </div>
              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 2 }}>World of Triangles</div>
                <div className="h-title" style={{ fontSize: 22 }}>Climb the Dusk Minar</div>
              </div>
            </div>
            <div className="p-4 row between">
              <div className="col gap-1">
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.1em' }}>NEXT CONCEPT</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>sin θ, cos θ, tan θ on right triangles</div>
              </div>
              <div className="btn btn-primary" style={{ padding: '12px 18px', fontSize: 14 }}>
                <Icon name="play" size={14}/> Play
              </div>
            </div>
          </Tappable>
        </div>

        {/* Tonight's quests */}
        <div style={{ padding: '8px 20px 0' }}>
          <div className="h-section" style={{ marginBottom: 10 }}>Tonight&apos;s quests</div>
          <div className="col gap-3">
            {[
              { t: 'Triangle Tune-Up', s: '5 min · Gentle',    c: '#5eead4', ic: 'angle' as const, tag: 'Warm-up' },
              { t: 'Lighthouse Drill', s: '8 min · Chapter 9', c: '#fbbf24', ic: 'tower' as const, tag: 'New'     },
              { t: 'Identity Forge',   s: '10 min · Advanced', c: '#a78bfa', ic: 'spark' as const, tag: 'Daily'   },
            ].map((q, i) => (
              <Tappable key={i} onClick={onEnterWorld} className="glass"
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: q.c + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 0 0 1px ${q.c}44`, flexShrink: 0 }}>
                  <Icon name={q.ic} size={20} color={q.c}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{q.t}</div>
                  <div className="body" style={{ fontSize: 12 }}>{q.s}</div>
                </div>
                <span className="chip">{q.tag}</span>
              </Tappable>
            ))}
          </div>
        </div>

        {/* Multiplayer banner */}
        <div className="p-5">
          <Tappable onClick={onMultiplayer}
            style={{
              position: 'relative', overflow: 'hidden', borderRadius: 24, width: '100%',
              background: 'linear-gradient(135deg, #1a1f4d 0%, #0a1028 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(94,234,212,0.3), 0 10px 30px rgba(0,0,0,0.3)',
              display: 'block',
            }}>
            <svg viewBox="0 0 360 140" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5, pointerEvents: 'none' }}>
              <defs>
                <radialGradient id="bm" cx="0.5" cy="1">
                  <stop offset="0" stopColor="#5eead4" stopOpacity="0.7"/>
                  <stop offset="1" stopColor="#5eead4" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <path d="M180 140 L60 0 L100 0 Z" fill="url(#bm)"/>
              <path d="M180 140 L300 0 L260 0 Z" fill="url(#bm)"/>
            </svg>
            <div style={{ position: 'relative', padding: 18 }}>
              <div className="row between">
                <span className="chip chip-teal">
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: '#5eead4', boxShadow: '0 0 8px #5eead4', display: 'inline-block' }}/>
                  LIVE NOW
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>28 classmates</span>
              </div>
              <div className="h-title" style={{ fontSize: 20, marginTop: 10 }}>Raid: Awaken the Sundial</div>
              <div className="body" style={{ fontSize: 13, marginTop: 4 }}>Class 10-B is solving it together. Jump in.</div>
              <div className="row gap-2" style={{ marginTop: 12 }}>
                {['A','S','M','P','K'].map((l, i) => (
                  <div key={i} style={{ width: 28, height: 28, marginLeft: i ? -10 : 0, borderRadius: 14, background: ['#ff7849','#5eead4','#a78bfa','#fbbf24','#f472b6'][i], fontSize: 11, fontWeight: 700, color: '#0a0f24', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #0a1028' }}>{l}</div>
                ))}
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>+23</span>
              </div>
            </div>
          </Tappable>
        </div>

        {/* Confidence meter */}
        <div style={{ padding: '0 20px 12px' }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <div className="h-section">Your sky tonight</div>
            <Tappable onClick={() => onNav('progress')} style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
              See all <Icon name="chev-right" size={12}/>
            </Tappable>
          </div>
          <div className="glass p-5 col gap-3">
            <div className="row between">
              <div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Confidence</div>
                <div className="h-title" style={{ fontSize: 30, marginTop: 2 }}>
                  {confidencePct}<span style={{ fontSize: 16, color: 'var(--muted)' }}>/100</span>
                </div>
              </div>
              <div className="col gap-1" style={{ alignItems: 'flex-end' }}>
                <span className="chip chip-ember"><Icon name="flame" size={12}/> +6 today</span>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)' }}>{progress.streak}-day streak</div>
              </div>
            </div>
            <div className="meter ember"><div className="fill" style={{ width: confidencePct + '%' }}/></div>
            <div className="body" style={{ fontSize: 12 }}>
              You connected <b style={{ color: '#fff' }}>Pythagoras</b> to <b style={{ color: '#fff' }}>sin² + cos²</b> yesterday. Tonight: finish the right-triangle constellation.
            </div>
          </div>
        </div>
      </div>

      <TabBar active="home" onNav={onNav}/>
    </div>
  )
}
