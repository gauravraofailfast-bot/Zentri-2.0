import { useState } from 'react'
import { StatusBar, DuskSkyline, Stars, Orb, Icon, Tappable } from '../ui/Shell'

interface OnboardingResult {
  name: string
  intent: 'fun' | 'concept' | 'exam'
}

export function OnboardingScene({ onDone }: { onDone: (r: OnboardingResult) => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [intent, setIntent] = useState<string | null>(null)

  const intents = [
    { id: 'fun',     title: 'Just for fun',        sub: 'Explore at my pace',       icon: 'spark' as const, color: '#a78bfa' },
    { id: 'concept', title: 'Master the concept',  sub: 'Actually understand it',   icon: 'stars' as const, color: '#5eead4' },
    { id: 'exam',    title: 'Prep for boards',      sub: 'Exam is close',            icon: 'flame' as const, color: '#ff7849' },
  ]

  return (
    <div className="screen sky-dusk" style={{ position: 'relative' }}>
      <Stars count={40}/>
      <DuskSkyline height={220} opacity={0.9}/>
      <StatusBar/>

      <div className="scroll" style={{ paddingTop: 80, paddingBottom: 40, height: '100%' }}>
        {step === 0 && (
          <div className="scene-enter col gap-6 p-6" style={{ height: '100%' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', paddingTop: 40 }}>
              <Orb size={120}/>
              <div style={{ marginTop: 40 }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--ember-glow)', marginBottom: 12 }}>ZENTRI</div>
                <div className="h-display" style={{ fontSize: 42, marginBottom: 16 }}>
                  Learn like<br/>
                  <span style={{ background: 'linear-gradient(90deg, #ffb37a, #ff7849)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    it&apos;s a game.
                  </span>
                </div>
                <div className="body" style={{ maxWidth: 300 }}>
                  Your Class 10 Math chapters, turned into worlds you actually want to explore.
                </div>
              </div>
            </div>
            <div className="col gap-3" style={{ padding: '0 8px' }}>
              <button className="btn btn-primary" onClick={() => setStep(1)} style={{ padding: '18px' }}>
                Begin your journey <Icon name="chev-right" size={18}/>
              </button>
              <button className="btn btn-ghost" onClick={() => onDone({ name: 'Gaurav', intent: 'concept' })}>
                I have an account
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="scene-enter col gap-6 p-6" style={{ height: '100%', justifyContent: 'space-between' }}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.24em', color: 'var(--muted-2)', marginBottom: 10 }}>01 / 02 · YOUR CALLSIGN</div>
              <div className="h-title" style={{ fontSize: 28, marginBottom: 6 }}>What should we call you?</div>
              <div className="body">No pressure — you can change it later.</div>
            </div>

            <div className="glass p-5" style={{ marginTop: 'auto' }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Gaurav"
                autoFocus
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  color: '#fff', fontFamily: 'var(--f-display)', fontSize: 28, fontWeight: 700,
                  outline: 'none', padding: '8px 0',
                }}
              />
              <div style={{ height: 2, background: 'linear-gradient(90deg, #ff7849, transparent)', marginTop: 4 }}/>
              <div className="body" style={{ fontSize: 12, marginTop: 12 }}>This appears on your raid banner.</div>
            </div>

            <button
              className="btn btn-primary"
              disabled={!name.trim()}
              onClick={() => setStep(2)}
              style={{ padding: 18, opacity: name.trim() ? 1 : 0.4 }}
            >
              Next <Icon name="chev-right" size={18}/>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="scene-enter col gap-4 p-6" style={{ height: '100%' }}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.24em', color: 'var(--muted-2)', marginBottom: 10 }}>02 / 02 · YOUR QUEST</div>
              <div className="h-title" style={{ fontSize: 26, marginBottom: 6 }}>Why are you here?</div>
              <div className="body" style={{ fontSize: 14 }}>We&apos;ll pace the game to match.</div>
            </div>

            <div className="col gap-3" style={{ marginTop: 12 }}>
              {intents.map(it => (
                <Tappable key={it.id} onClick={() => setIntent(it.id)}
                  className="glass p-5"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    boxShadow: intent === it.id
                      ? `inset 0 0 0 2px ${it.color}, 0 10px 30px rgba(255,120,73,0.2)`
                      : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                    background: intent === it.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                  }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${it.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 0 0 1px ${it.color}55` }}>
                    <Icon name={it.icon} size={22} color={it.color}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 17 }}>{it.title}</div>
                    <div className="body" style={{ fontSize: 13 }}>{it.sub}</div>
                  </div>
                  {intent === it.id && <Icon name="check" size={20} color={it.color}/>}
                </Tappable>
              ))}
            </div>

            <div style={{ flex: 1 }}/>
            <button
              className="btn btn-primary"
              disabled={!intent}
              onClick={() => onDone({ name: name.trim() || 'Gaurav', intent: (intent as OnboardingResult['intent']) })}
              style={{ padding: 18, opacity: intent ? 1 : 0.4 }}
            >
              Enter the world <Icon name="chev-right" size={18}/>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
