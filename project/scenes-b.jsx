// Scenes B — World Map, Progress, Feedback, Multiplayer Raid

// ———— WORLD MAP ————
function WorldScene({ onBack, onEnterMission, progress, onNav }) {
  // Trigonometry world — Qutub-inspired minar with levels as stars
  const missions = [
    { id: 'm1', x: 80, y: 640, title: 'The Right Triangle', sub: 'Meet opposite, adjacent, hypotenuse', done: true },
    { id: 'm2', x: 210, y: 560, title: 'Ratio Workshop', sub: 'sin, cos, tan — first hits', done: true },
    { id: 'm3', x: 120, y: 460, title: 'Archer\u2019s Angle', sub: 'Aim to learn the ratios', done: false, active: true, kind: 'archer' },
    { id: 'm4', x: 260, y: 380, title: 'Special Angles', sub: '30°, 45°, 60°, 0°, 90°', done: false, locked: false },
    { id: 'm5', x: 140, y: 290, title: 'Identity Forge', sub: 'sin²θ + cos²θ = 1', done: false, locked: true },
    { id: 'm6', x: 240, y: 210, title: 'Lighthouse', sub: 'Angles of elevation & depression', done: false, locked: true, kind: 'light' },
    { id: 'm7', x: 180, y: 110, title: 'The Dusk Minar', sub: 'Boss: measure a tower without a tape', done: false, locked: true, boss: true },
  ];

  return (
    <div className="screen sky-night">
      <Stars count={60}/>
      <StatusBar/>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Tappable onClick={onBack} className="glass" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chev-left" size={18}/>
        </Tappable>
        <div className="flex-1">
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted-2)' }}>CH 8 · WORLD OF TRIANGLES</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Trigonometry</div>
        </div>
        <div className="chip chip-ember">2 / 7</div>
      </div>

      <div className="scroll scene-enter" style={{ height: '100%', paddingTop: 110, paddingBottom: 110, position: 'relative' }}>
        {/* Constellation map */}
        <div style={{ position: 'relative', width: '100%', height: 760, margin: '0 auto' }}>
          <svg viewBox="0 0 360 760" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {/* Connecting path */}
            <path d="M80 640 L210 560 L120 460 L260 380 L140 290 L240 210 L180 110"
              fill="none"
              stroke="url(#pathGrad)"
              strokeWidth="2"
              strokeDasharray="4 6"
              strokeLinecap="round"/>
            <defs>
              <linearGradient id="pathGrad" x1="0" x2="0" y1="1" y2="0">
                <stop offset="0" stopColor="#ff7849"/>
                <stop offset="0.45" stopColor="#ffb37a" stopOpacity="0.5"/>
                <stop offset="1" stopColor="#5eead4" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
            {/* glow rings on active */}
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
            <MissionNode key={m.id} m={m} onTap={() => !m.locked && onEnterMission(m)}/>
          ))}

          {/* Minar silhouette at the top */}
          <svg viewBox="0 0 360 120" style={{ position: 'absolute', top: 0, width: '100%', height: 120, opacity: 0.4, pointerEvents: 'none' }}>
            <path d="M170 120 L170 60 L174 55 L174 30 L178 26 L178 12 L180 8 L182 12 L182 26 L186 30 L186 55 L190 60 L190 120 Z" fill="#1a1432"/>
          </svg>
        </div>
      </div>

      <TabBar active="world" onNav={onNav}/>
    </div>
  );
}

function MissionNode({ m, onTap }) {
  const size = m.boss ? 72 : m.active ? 64 : 56;
  const c = m.done ? '#5eead4' : m.active ? '#ff7849' : m.locked ? 'rgba(255,255,255,0.4)' : '#fbbf24';
  return (
    <Tappable onClick={onTap} style={{
      position: 'absolute', left: m.x, top: m.y,
      transform: 'translate(-50%, -50%)',
      width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      <div style={{
        width: size, height: size, borderRadius: size/2,
        background: m.done ? 'linear-gradient(180deg, #5eead4, #2dd4bf)'
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
      }}>
        {m.done && <Icon name="check" size={24} color="#042f2e"/>}
        {m.active && <Icon name="play" size={22} color="#1a0f08"/>}
        {m.locked && <Icon name="lock" size={18} color="rgba(255,255,255,0.5)"/>}
        {m.boss && !m.done && !m.active && !m.locked && <Icon name="crown" size={24} color="#fbbf24"/>}
        {!m.done && !m.active && !m.locked && !m.boss && <div style={{ width: 8, height: 8, borderRadius: 4, background: c, boxShadow: `0 0 10px ${c}` }}/>}
      </div>
      <div style={{ textAlign: 'center', marginTop: 2 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: m.locked ? 'rgba(255,255,255,0.5)' : '#fff' }}>{m.title}</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 1 }}>{m.sub}</div>
      </div>
    </Tappable>
  );
}

// ———— PROGRESS / CONFIDENCE ————
function ProgressScene({ onBack, progress, onNav }) {
  const stars = [
    { x: 80, y: 120, r: 4, lit: true, label: 'Right triangle' },
    { x: 180, y: 80, r: 5, lit: true, label: 'Hypotenuse' },
    { x: 270, y: 140, r: 4, lit: true, label: 'Opposite' },
    { x: 120, y: 220, r: 4, lit: true, label: 'Adjacent' },
    { x: 220, y: 230, r: 5, lit: true, label: 'sin θ' },
    { x: 310, y: 250, r: 4, lit: false, label: 'cos θ' },
    { x: 170, y: 320, r: 5, lit: false, label: 'tan θ' },
    { x: 260, y: 340, r: 4, lit: false, label: 'Identity' },
  ];
  const connections = [[0,1],[1,2],[0,3],[3,4],[2,4],[4,5],[4,6],[6,7]];

  return (
    <div className="screen sky-night">
      <Stars count={80}/>
      <StatusBar/>

      <div style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Tappable onClick={onBack} className="glass" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chev-left" size={18}/>
        </Tappable>
        <div className="flex-1">
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
              <div className="h-display" style={{ fontSize: 56 }}>{progress.confidence}<span style={{ fontSize: 22, color: 'var(--muted)' }}>/100</span></div>
              <span className="chip chip-ember"><Icon name="flame" size={12}/> 7 nights</span>
            </div>
            <div className="meter ember" style={{ marginTop: 12 }}><div className="fill" style={{ width: progress.confidence + '%' }}/></div>
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
                const lit = stars[a].lit && stars[b].lit;
                return (
                  <line key={i} x1={stars[a].x} y1={stars[a].y} x2={stars[b].x} y2={stars[b].y}
                    stroke={lit ? '#ffb37a' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={lit ? 1.2 : 0.6}
                    strokeDasharray={lit ? '0' : '3 3'}
                    opacity={lit ? 0.7 : 0.5}/>
                );
              })}
              {stars.map((s, i) => (
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
            {[
              { t: 'Tonight', d: 'Cracked tan θ = opposite / adjacent on your 4th try. Pattern clicked.', c: '#ff7849' },
              { t: 'Yesterday', d: 'You kept trying after a near-miss. That&apos;s what levels up confidence, not the score.', c: '#5eead4' },
              { t: '3 days ago', d: 'First time you named the hypotenuse without looking. Logged.', c: '#a78bfa' },
            ].map((e, i) => (
              <div key={i} className="glass p-4" style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 3, borderRadius: 2, background: e.c, flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 10, color: e.c, letterSpacing: '0.1em' }}>{e.t.toUpperCase()}</div>
                  <div style={{ fontSize: 13, marginTop: 3, color: 'rgba(255,255,255,0.85)' }} dangerouslySetInnerHTML={{__html: e.d}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TabBar active="progress" onNav={onNav}/>
    </div>
  );
}

// ———— MULTIPLAYER RAID ————
function RaidScene({ onBack, onNav }) {
  const [raidHp, setRaidHp] = useState(68);
  const [players] = useState([
    { n: 'Aarav', me: true, contrib: 12, c: '#ff7849' },
    { n: 'Sara', contrib: 18, c: '#5eead4' },
    { n: 'Misha', contrib: 15, c: '#a78bfa' },
    { n: 'Priya', contrib: 9, c: '#fbbf24' },
    { n: 'Kabir', contrib: 14, c: '#f472b6' },
    { n: 'Ishaan', contrib: 6, c: '#60a5fa' },
  ]);

  useEffect(() => {
    const iv = setInterval(() => setRaidHp(h => Math.max(0, h - Math.random() * 2)), 1200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="screen sky-dusk">
      <Stars count={30}/>
      <StatusBar/>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Tappable onClick={onBack} className="glass" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chev-left" size={18}/>
        </Tappable>
        <div className="flex-1">
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ember-glow)' }}>· LIVE · CLASS 10-B</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Awaken the Sundial</div>
        </div>
        <span className="chip chip-teal">{players.length + 22} in</span>
      </div>

      <div className="scene-enter" style={{ height: '100%', paddingTop: 110, paddingBottom: 110, display: 'flex', flexDirection: 'column' }}>
        {/* Boss arena */}
        <div style={{ position: 'relative', flex: 1, margin: '0 16px', borderRadius: 24, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 100%, rgba(255,120,73,0.3), transparent 60%), linear-gradient(180deg, #1a1f4d 0%, #3b2a62 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
          {/* Sundial boss */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <SundialBoss hp={raidHp}/>
          </div>
          {/* Contribution beams */}
          <svg viewBox="0 0 360 400" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {players.slice(0, 5).map((p, i) => {
              const x = 30 + i * 75;
              return (
                <g key={i}>
                  <line x1={x} y1="380" x2="180" y2="200" stroke={p.c} strokeWidth="1.5" strokeOpacity="0.35"
                    strokeDasharray="4 6">
                    <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="1s" repeatCount="indefinite"/>
                  </line>
                </g>
              );
            })}
          </svg>

          {/* HP bar */}
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
            <div className="row between" style={{ marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ember-glow)', letterSpacing: '0.2em' }}>SUNDIAL SHIELD</span>
              <span className="mono" style={{ fontSize: 11, color: '#fff' }}>{Math.round(raidHp)}%</span>
            </div>
            <div className="meter ember"><div className="fill" style={{ width: raidHp + '%' }}/></div>
          </div>

          {/* Floating praise */}
          <div style={{ position: 'absolute', bottom: 100, left: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
            <FloatingNote text="Sara found the 45° weak spot!" color="#5eead4"/>
            <FloatingNote text="Misha set up the cot hint — beautiful." color="#a78bfa" delay={1.2}/>
          </div>
        </div>

        {/* Player rail */}
        <div style={{ padding: '12px 16px 0' }}>
          <div className="glass-dark p-4">
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="h-section">Your raid party</div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--muted-2)' }}>SHARED GOAL · NO RANKS</span>
            </div>
            <div className="row gap-3" style={{ overflowX: 'auto', paddingBottom: 4 }}>
              {players.map(p => (
                <div key={p.n} style={{ minWidth: 64, textAlign: 'center' }}>
                  <div style={{
                    width: 48, height: 48, margin: '0 auto 6px', borderRadius: 24,
                    background: p.c + '33',
                    boxShadow: p.me ? `inset 0 0 0 2px ${p.c}, 0 0 15px ${p.c}66` : `inset 0 0 0 1px ${p.c}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: p.c, fontWeight: 700, fontSize: 17,
                  }}>{p.n[0]}</div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{p.me ? 'You' : p.n}</div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--muted-2)' }}>{p.contrib} beams</div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }}>
              <Icon name="bolt" size={16}/> Fire your beam
            </button>
          </div>
        </div>
      </div>

      <TabBar active="raid" onNav={onNav}/>
    </div>
  );
}

function SundialBoss({ hp }) {
  return (
    <div style={{ position: 'relative', width: 200, height: 200 }}>
      <svg viewBox="0 0 200 200">
        <defs>
          <radialGradient id="sunCore" cx="0.5" cy="0.5">
            <stop offset="0" stopColor="#ffd166"/>
            <stop offset="0.6" stopColor="#ff7849"/>
            <stop offset="1" stopColor="#3b2a62"/>
          </radialGradient>
        </defs>
        {/* Rotating rings */}
        <g style={{ transformOrigin: '100px 100px', animation: 'spin 20s linear infinite' }}>
          <circle cx="100" cy="100" r="90" fill="none" stroke="#ffb37a" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 8"/>
          <circle cx="100" cy="100" r="70" fill="none" stroke="#ffd166" strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="4 4"/>
        </g>
        <g style={{ transformOrigin: '100px 100px', animation: 'spin 15s linear infinite reverse' }}>
          <circle cx="100" cy="100" r="55" fill="none" stroke="#ff7849" strokeOpacity="0.6" strokeWidth="1.5"/>
          {/* Tick marks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => (
            <line key={a} x1={100 + 55 * Math.cos(a * Math.PI / 180)} y1={100 + 55 * Math.sin(a * Math.PI / 180)}
              x2={100 + 62 * Math.cos(a * Math.PI / 180)} y2={100 + 62 * Math.sin(a * Math.PI / 180)}
              stroke="#ffb37a" strokeWidth="1.5"/>
          ))}
        </g>
        {/* Core */}
        <circle cx="100" cy="100" r="40" fill="url(#sunCore)"/>
        {/* Gnomon */}
        <path d="M100 100 L 100 60" stroke="#1a0a1f" strokeWidth="4" strokeLinecap="round"/>
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FloatingNote({ text, color, delay = 0 }) {
  return (
    <div style={{
      alignSelf: 'flex-start', padding: '6px 12px', borderRadius: 16,
      background: `${color}22`, color, fontSize: 12, fontWeight: 600,
      boxShadow: `inset 0 0 0 1px ${color}55`, backdropFilter: 'blur(10px)',
      animation: `floatNote 4s ease-out ${delay}s infinite`,
    }}>
      {text}
      <style>{`@keyframes floatNote {
        0% { opacity: 0; transform: translateY(10px); }
        20%, 70% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
      }`}</style>
    </div>
  );
}

// ———— FEEDBACK ————
function FeedbackSheet({ show, onClose, onSubmit }) {
  const [fun, setFun] = useState(null);
  const [confusing, setConfusing] = useState(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { if (!show) { setFun(null); setConfusing(null); setNote(''); setSubmitted(false); } }, [show]);

  if (!show) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', animation: 'fadeIn .3s' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}/>
      <div className="scene-enter" style={{
        position: 'relative', width: '100%',
        background: 'linear-gradient(180deg, #1a1f4d 0%, #0a1028 100%)',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '24px 20px 40px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)', margin: '0 auto 20px' }}/>

        {submitted ? (
          <div className="col gap-3 center" style={{ padding: '20px 0 10px', textAlign: 'center' }}>
            <Orb size={60}/>
            <div className="h-title" style={{ marginTop: 8 }}>Noted. Thanks.</div>
            <div className="body">The world will remember. Next mission will pace itself to you.</div>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 10 }}>Keep going</button>
          </div>
        ) : (
          <>
            <div className="h-title" style={{ fontSize: 20 }}>Quick pulse check</div>
            <div className="body" style={{ fontSize: 13 }}>30 seconds. No right answer.</div>

            <div className="group" style={{ marginTop: 18 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.15em', marginBottom: 8 }}>WAS IT FUN?</div>
              <div className="row gap-2">
                {[
                  { id: 'no', t: 'Not really', c: '#6b7280' },
                  { id: 'ok', t: 'It was fine', c: '#fbbf24' },
                  { id: 'yes', t: 'Actually, yes', c: '#5eead4' },
                  { id: 'love', t: 'Loved it', c: '#ff7849' },
                ].map(o => (
                  <Tappable key={o.id} onClick={() => setFun(o.id)} className="glass" style={{
                    flex: 1, padding: '10px 6px', textAlign: 'center', fontSize: 12, fontWeight: 600,
                    boxShadow: fun === o.id ? `inset 0 0 0 2px ${o.c}` : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                    background: fun === o.id ? `${o.c}22` : 'rgba(255,255,255,0.04)',
                    color: fun === o.id ? o.c : '#fff',
                  }}>{o.t}</Tappable>
                ))}
              </div>
            </div>

            <div className="group">
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.15em', marginBottom: 8 }}>WAS IT CONFUSING?</div>
              <div className="row gap-2">
                {[
                  { id: 'no', t: 'Made sense' },
                  { id: 'mid', t: 'A little' },
                  { id: 'yes', t: 'Lost me' },
                ].map(o => (
                  <Tappable key={o.id} onClick={() => setConfusing(o.id)} className="glass" style={{
                    flex: 1, padding: '10px 6px', textAlign: 'center', fontSize: 12, fontWeight: 600,
                    boxShadow: confusing === o.id ? 'inset 0 0 0 2px #a78bfa' : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                    background: confusing === o.id ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
                  }}>{o.t}</Tappable>
                ))}
              </div>
            </div>

            <div className="group">
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.15em', marginBottom: 8 }}>ANYTHING ELSE? (optional)</div>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="A moment you liked, a part you&rsquo;d change&hellip;"
                rows="2" className="glass" style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)', border: 'none',
                  padding: 12, borderRadius: 14, color: '#fff', fontSize: 13,
                  fontFamily: 'inherit', resize: 'none', outline: 'none',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                }}/>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: 16, marginTop: 6 }}
              onClick={() => { onSubmit({ fun, confusing, note }); setSubmitted(true); }}>
              <Icon name="send" size={16}/> Send pulse
            </button>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { WorldScene, MissionNode, ProgressScene, RaidScene, FeedbackSheet });
