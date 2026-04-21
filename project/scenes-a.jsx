// Scenes 1/3 — Onboarding & Lobby
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

// ———— ONBOARDING ————
function OnboardingScene({ onDone, tweaks }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [intent, setIntent] = useState(null);

  const intents = [
    { id: 'fun', title: 'Just for fun', sub: 'Explore at my pace', icon: 'spark', color: '#a78bfa' },
    { id: 'concept', title: 'Master the concept', sub: 'Actually understand it', icon: 'stars', color: '#5eead4' },
    { id: 'exam', title: 'Prep for boards', sub: 'Exam is close', icon: 'flame', color: '#ff7849' },
  ];

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
                  <span style={{ background: 'linear-gradient(90deg, #ffb37a, #ff7849)', WebkitBackgroundClip: 'text', color: 'transparent' }}>it&apos;s a game.</span>
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
              <button className="btn btn-ghost" onClick={() => onDone({ name: 'Aarav', intent: 'concept' })}>
                I have an account
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="scene-enter col gap-6 p-6" style={{ height: '100%', justifyContent: 'space-between' }}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.24em', color: 'var(--muted-2)', marginBottom: 10 }}>01 / 03 · YOUR CALLSIGN</div>
              <div className="h-title" style={{ fontSize: 28, marginBottom: 6 }}>What should we call you?</div>
              <div className="body">No pressure — you can change it later.</div>
            </div>

            <div className="glass p-5" style={{ marginTop: 'auto' }}>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Aarav"
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

            <button className="btn btn-primary" disabled={!name.trim()}
              onClick={() => setStep(2)}
              style={{ padding: 18, opacity: name.trim() ? 1 : 0.4 }}>
              Next <Icon name="chev-right" size={18}/>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="scene-enter col gap-4 p-6" style={{ height: '100%' }}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.24em', color: 'var(--muted-2)', marginBottom: 10 }}>02 / 03 · YOUR QUEST</div>
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
            <button className="btn btn-primary" disabled={!intent}
              onClick={() => onDone({ name: name.trim() || 'Aarav', intent })}
              style={{ padding: 18, opacity: intent ? 1 : 0.4 }}>
              Enter the world <Icon name="chev-right" size={18}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ———— GAME LOBBY ————
function LobbyScene({ player, progress, onNav, onEnterWorld, onMultiplayer }) {
  const confidencePct = progress.confidence;

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
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--ember-glow)' }}>THE DUSK MINAR · CH 10</div>
              <div className="h-display" style={{ fontSize: 30, marginTop: 6 }}>
                Welcome back,<br/>
                <span style={{ color: 'var(--ember-glow)' }}>{player.name}.</span>
              </div>
            </div>
            <Orb size={52}/>
          </div>
          <div className="body" style={{ fontSize: 14 }}>The sky remembers where you left off.</div>
        </div>

        {/* Continue journey hero card */}
        <div className="p-4">
          <Tappable onClick={() => onEnterWorld('trig')} className="glass-dark"
            style={{ display: 'block', position: 'relative', overflow: 'hidden', borderRadius: 28 }}>
            <div style={{ position: 'relative', height: 180, background: 'linear-gradient(135deg, #3b2a62 0%, #8a3a5e 60%, #ff7849 100%)', overflow: 'hidden' }}>
              {/* mini-skyline in card */}
              <svg viewBox="0 0 360 120" style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                <path d="M0 100 L40 85 L60 95 L80 70 L100 80 L120 60 L140 90
                  L 160 90 L 162 45 L 166 43 L 166 30 L 170 27 L 170 20 L 174 20 L 174 27 L 178 30 L 178 43 L 182 45 L 182 90
                  L 200 90 L 220 75 L 260 85 L 300 70 L 340 85 L 360 80 L 360 120 L 0 120Z" fill="#1a0a1f" opacity="0.85"/>
              </svg>
              <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span className="chip chip-ember"><Icon name="flame" size={12}/> CONTINUE</span>
                <span className="chip">Mission 3 of 7</span>
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

        {/* Quick rails */}
        <div style={{ padding: '8px 20px 0' }}>
          <div className="h-section" style={{ marginBottom: 10 }}>Tonight&apos;s quests</div>
          <div className="col gap-3">
            {[
              { t: 'Triangle Tune-Up', s: '5 min · Gentle', c: '#5eead4', ic: 'angle', tag: 'Warm-up' },
              { t: 'Lighthouse Drill', s: '8 min · Chapter 9', c: '#fbbf24', ic: 'tower', tag: 'New' },
              { t: 'Identity Forge', s: '10 min · Advanced', c: '#a78bfa', ic: 'spark', tag: 'Daily' },
            ].map((q, i) => (
              <Tappable key={i} onClick={() => onEnterWorld('trig')} className="glass" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: q.c + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 0 0 1px ${q.c}44` }}>
                  <Icon name={q.ic} size={20} color={q.c}/>
                </div>
                <div style={{ flex: 1 }}>
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
            }}>
            {/* Beams */}
            <svg viewBox="0 0 360 140" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}>
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
                <span className="chip chip-teal"><span style={{ width: 6, height: 6, borderRadius: 3, background: '#5eead4', boxShadow: '0 0 8px #5eead4' }}/> LIVE NOW</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>28 classmates</span>
              </div>
              <div className="h-title" style={{ fontSize: 20, marginTop: 10 }}>Raid: Awaken the Sundial</div>
              <div className="body" style={{ fontSize: 13, marginTop: 4 }}>Class 10-B is solving it together. Jump in.</div>
              <div className="row gap-2" style={{ marginTop: 12 }}>
                {['A','S','M','P','K'].map((l,i) => (
                  <div key={i} style={{ width: 28, height: 28, marginLeft: i ? -10 : 0, borderRadius: 14, background: ['#ff7849','#5eead4','#a78bfa','#fbbf24','#f472b6'][i], fontSize: 11, fontWeight: 700, color: '#0a0f24', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #0a1028' }}>{l}</div>
                ))}
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>+23</span>
              </div>
            </div>
          </Tappable>
        </div>

        {/* Confidence constellation mini */}
        <div style={{ padding: '0 20px 12px' }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <div className="h-section">Your sky tonight</div>
            <Tappable onClick={() => onNav('progress')} style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>See all <Icon name="chev-right" size={12}/></Tappable>
          </div>
          <div className="glass p-5 col gap-3">
            <div className="row between">
              <div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Confidence</div>
                <div className="h-title" style={{ fontSize: 30, marginTop: 2 }}>{confidencePct}<span style={{ fontSize: 16, color: 'var(--muted)' }}>/100</span></div>
              </div>
              <div className="col gap-1" style={{ alignItems: 'flex-end' }}>
                <span className="chip chip-ember"><Icon name="flame" size={12}/> +6 today</span>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)' }}>7-day streak</div>
              </div>
            </div>
            <div className="meter ember"><div className="fill" style={{ width: confidencePct + '%' }}/></div>
            <div className="body" style={{ fontSize: 12 }}>You connected <b style={{ color: '#fff' }}>Pythagoras</b> to <b style={{ color: '#fff' }}>sin² + cos²</b> yesterday. Tonight: finish the right-triangle constellation.</div>
          </div>
        </div>
      </div>

      <TabBar active="home" onNav={onNav}/>
    </div>
  );
}

function TabBar({ active, onNav }) {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Lobby' },
    { id: 'world', icon: 'map', label: 'World' },
    { id: 'raid', icon: 'users', label: 'Raid' },
    { id: 'progress', icon: 'stars', label: 'Sky' },
  ];
  return (
    <div className="tabbar">
      {tabs.map(t => (
        <button key={t.id} className={active === t.id ? 'active' : ''} onClick={() => onNav(t.id)}>
          <Icon name={t.icon} size={22} color={active === t.id ? '#ff7849' : 'rgba(255,255,255,0.5)'}/>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { OnboardingScene, LobbyScene, TabBar });
