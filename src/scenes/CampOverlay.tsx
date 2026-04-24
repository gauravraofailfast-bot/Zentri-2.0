import { Stars, DuskSkyline, Orb, Icon, Tappable } from '../ui/Shell'

interface Props {
  playerName: string
  confidence: number
  streak: number
  completedCount: number
  totalCount: number
  onResume: () => void
}

export function CampOverlay({ playerName, confidence, streak, completedCount, totalCount, onResume }: Props) {
  const quests = [
    { t: 'Triangle Tune-Up',  s: '5 min · Warm-up',     c: 'var(--teal)',   ic: 'angle' as const, tag: 'Warm-up' },
    { t: 'Archer\'s Angle',   s: '8 min · Ratios',       c: 'var(--ember)',  ic: 'target' as const, tag: 'Active'  },
    { t: 'Identity Forge',    s: '10 min · Challenging', c: 'var(--violet)', ic: 'spark' as const, tag: 'Locked'  },
  ]

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 40,
      background: 'rgba(5,7,20,0.75)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'campSlideIn 0.38s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <style>{`
        @keyframes campSlideIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sheetUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Tap backdrop to close */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onResume}/>

      {/* Sheet */}
      <div style={{
        position: 'relative',
        borderRadius: '28px 28px 0 0',
        background: 'linear-gradient(180deg,#1a1f4d 0%,#0a0f24 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 -20px 60px rgba(0,0,0,0.5)',
        animation: 'sheetUp 0.38s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Dusk skyline decorative header */}
        <div style={{ position: 'relative', height: 90, overflow: 'hidden', flexShrink: 0 }}>
          <Stars count={20} topBias={1}/>
          <DuskSkyline height={90} opacity={0.6}/>
          {/* Pull indicator */}
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }}/>
          {/* Greeting */}
          <div style={{ position: 'absolute', bottom: 14, left: 20, right: 56 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--ember-glow)' }}>CAMP · REST STOP</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 2 }}>Welcome back, {playerName}.</div>
          </div>
          {/* Close */}
          <Tappable onClick={onResume} className="glass" style={{
            position: 'absolute', bottom: 14, right: 16,
            width: 36, height: 36, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="close" size={16}/>
          </Tappable>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'none' }}>

          {/* Confidence card */}
          <div style={{ padding: '16px 20px 0' }}>
            <div className="glass-dark p-5">
              <div className="row between" style={{ alignItems: 'flex-end' }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted-2)' }}>CONFIDENCE</div>
                  <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--f-display)', lineHeight: 1, marginTop: 4 }}>
                    {confidence}<span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 400 }}>/100</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className="chip chip-ember" style={{ gap: 4 }}>
                    <Icon name="flame" size={11}/> +4 today
                  </span>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)' }}>{streak}-night streak</div>
                </div>
              </div>
              <div className="meter ember" style={{ marginTop: 12 }}>
                <div className="fill" style={{ width: confidence + '%' }}/>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 10 }}>
                {completedCount} of {totalCount} landmarks cleared on this journey.
              </div>
            </div>
          </div>

          {/* Tonight's quests */}
          <div style={{ padding: '16px 20px 0' }}>
            <div className="h-section" style={{ marginBottom: 10 }}>Tonight&apos;s quests</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quests.map((q, i) => (
                <div key={i} className="glass" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: q.c + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `inset 0 0 0 1px ${q.c}44`,
                  }}>
                    <Icon name={q.ic} size={18} color={q.c}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{q.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>{q.s}</div>
                  </div>
                  <span className="chip" style={{ fontSize: 10 }}>{q.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Orb teaser */}
          <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Orb size={36}/>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              The sky remembers where you left off. Your next landmark is close.
            </div>
          </div>
        </div>

        {/* Continue CTA */}
        <div style={{ padding: '12px 20px 28px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button className="btn btn-primary" onClick={onResume} style={{ width: '100%', padding: 16, fontSize: 15 }}>
            <Icon name="play" size={16}/> Continue Journey
          </button>
        </div>
      </div>
    </div>
  )
}
