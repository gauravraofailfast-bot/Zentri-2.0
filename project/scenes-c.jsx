// Scenes C — Gameplay (THE HEART OF THE APP)
// Two mechanics: Archer's Angle + Lighthouse Surveyor + Mission intro + Success screen

// ———— MISSION INTRO (brief, then straight to play) ————
function MissionIntro({ mission, onStart, onBack }) {
  return (
    <div className="screen sky-dusk">
      <Stars count={30}/>
      <DuskSkyline height={220} opacity={0.85}/>
      <StatusBar/>

      <div style={{ position: 'absolute', top: 60, left: 16, zIndex: 10 }}>
        <Tappable onClick={onBack} className="glass" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chev-left" size={18}/>
        </Tappable>
      </div>

      <div className="scene-enter col" style={{ height: '100%', padding: '110px 24px 40px', justifyContent: 'space-between' }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ember-glow)', letterSpacing: '0.24em' }}>MISSION {mission.num || '03'}</div>
          <div className="h-display" style={{ fontSize: 38, marginTop: 8 }}>{mission.title}</div>
          <div className="body" style={{ fontSize: 15, marginTop: 12, maxWidth: 320 }}>{mission.story}</div>
        </div>

        <div className="glass-dark p-5 col gap-3">
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.2em' }}>WHAT YOU&apos;LL LEARN</div>
          {mission.learns.map((l, i) => (
            <div key={i} className="row gap-3" style={{ alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: 'rgba(255,120,73,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: '#ff7849' }}/>
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>{l}</div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{ padding: 18 }} onClick={onStart}>
          <Icon name="play" size={16}/> Enter the mission
        </button>
      </div>
    </div>
  );
}

// ———— ARCHER'S ANGLE — Chapter 8 sin/cos/tan ————
// The player sees a right triangle with the target at the top of the opposite side.
// A ratio challenge appears ("Hit the target where sin θ = 0.5") — player drags the
// bow angle; the triangle visually UPDATES its sides, and the length labels animate.
// Releasing fires the arrow; if |sin(actual) - target| < 0.04, star is lit.

function ArcherMission({ onDone, tweaks }) {
  const [stage, setStage] = useState(0); // rounds
  const rounds = [
    { ratio: 'sin', target: 0.5, hintAngle: 30, story: 'The banner flutters where the opposite meets half the rope. Aim where sin θ equals this.' },
    { ratio: 'cos', target: 0.866, hintAngle: 30, story: 'Shield up, keep most of the rope flush against the ground. cos θ ≈ 0.87.' },
    { ratio: 'tan', target: 1, hintAngle: 45, story: 'Opposite equals adjacent. tan θ = 1. Find the 45°.' },
  ];
  const r = rounds[stage];

  const [angle, setAngle] = useState(20); // in degrees
  const [fired, setFired] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const ropeLen = 180;
  const rad = angle * Math.PI / 180;
  const sin = Math.sin(rad), cos = Math.cos(rad), tan = Math.tan(rad);
  const actual = r.ratio === 'sin' ? sin : r.ratio === 'cos' ? cos : tan;
  const delta = Math.abs(actual - r.target);
  const tolerance = 0.05;

  // Anchor (origin) of the triangle
  const ox = 60, oy = 420;
  const tipX = ox + ropeLen * cos;
  const tipY = oy - ropeLen * sin;
  const targetAngle = r.hintAngle;
  const tRad = targetAngle * Math.PI / 180;
  const targetX = ox + ropeLen * Math.cos(tRad);
  const targetY = oy - ropeLen * Math.sin(tRad);

  const fire = () => {
    setFired(true);
    setAttempts(a => a + 1);
    setTimeout(() => {
      if (delta < tolerance) {
        setFeedback('hit');
      } else if (delta < 0.15) {
        setFeedback('close');
      } else {
        setFeedback('try');
      }
      setFired(false);
    }, 700);
  };

  const next = () => {
    setFeedback(null);
    setAngle(20);
    setAttempts(0);
    setShowHint(false);
    if (stage < rounds.length - 1) setStage(stage + 1);
    else onDone({ success: true });
  };

  // invisible AI: after 2 misses, nudge the slider toward target and show hint
  useEffect(() => {
    if (attempts === 2 && tweaks?.adaptive !== false) {
      setShowHint(true);
    }
  }, [attempts, tweaks]);

  return (
    <div className="screen sky-dusk" style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 100%, rgba(255,120,73,0.55) 0%, rgba(138,58,94,0.5) 30%, transparent 60%), linear-gradient(180deg, #0a1028 0%, #1a1f4d 40%, #3b2a62 70%, #8a3a5e 95%)' }}>
      <Stars count={25} topBias={0.4}/>
      <StatusBar/>

      {/* HUD top */}
      <div className="hud-top">
        <div className="row gap-2">
          <Tappable onClick={onDone} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={16}/>
          </Tappable>
          <div className="glass" style={{ padding: '8px 12px', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.15em' }}>ROUND</span>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{stage + 1}/{rounds.length}</span>
          </div>
        </div>
        <Tappable onClick={() => setShowHint(true)} className="glass" style={{ padding: '8px 12px', borderRadius: 18, display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name="hint" size={14} color="#fbbf24"/>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Hint</span>
        </Tappable>
      </div>

      {/* Prompt */}
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16, zIndex: 20 }}>
        <div className="glass-dark p-4">
          <div className="mono" style={{ fontSize: 10, color: 'var(--ember-glow)', letterSpacing: '0.2em' }}>AIM WHERE</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, fontFamily: 'var(--f-mono)' }}>
            <span style={{ color: '#ff7849' }}>{r.ratio} θ</span> = <span style={{ color: '#fff' }}>{r.target}</span>
          </div>
          <div className="body" style={{ fontSize: 12, marginTop: 4 }}>{r.story}</div>
        </div>
      </div>

      {/* Triangle arena */}
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, bottom: 220 }}>
        <svg viewBox="0 0 402 400" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="ropeG" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#ffb37a"/>
              <stop offset="1" stopColor="#ff7849"/>
            </linearGradient>
            <radialGradient id="targetG" cx="0.5" cy="0.5">
              <stop offset="0" stopColor="#fbbf24"/>
              <stop offset="0.5" stopColor="#ff7849"/>
              <stop offset="1" stopColor="#8a3a5e"/>
            </radialGradient>
          </defs>

          {/* Ground / horizon */}
          <line x1="0" y1={oy} x2="402" y2={oy} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 5"/>

          {/* Target silhouette - far minar */}
          <g transform={`translate(${targetX - 12}, ${targetY - 30})`}>
            <rect x="8" y="8" width="8" height="30" fill="#1a0a1f" opacity="0.9"/>
            <polygon points="6,8 18,8 12,0" fill="#1a0a1f" opacity="0.9"/>
            <circle cx="12" cy="8" r="10" fill="url(#targetG)" opacity="0.8">
              <animate attributeName="r" values="9;11;9" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="12" cy="8" r="3" fill="#fff"/>
          </g>

          {/* Right triangle — adjacent (horizontal), opposite (vertical down from tip), hypotenuse (the shot) */}
          {/* Adjacent side */}
          <line x1={ox} y1={oy} x2={tipX} y2={oy}
            stroke={showHint ? '#5eead4' : 'rgba(255,255,255,0.4)'}
            strokeWidth="2" strokeDasharray="4 4"/>
          {/* Opposite side */}
          <line x1={tipX} y1={oy} x2={tipX} y2={tipY}
            stroke={showHint ? '#5eead4' : 'rgba(255,255,255,0.4)'}
            strokeWidth="2" strokeDasharray="4 4"/>
          {/* Hypotenuse = arrow path */}
          <line x1={ox} y1={oy} x2={tipX} y2={tipY}
            stroke="url(#ropeG)" strokeWidth="3" strokeLinecap="round"/>

          {/* Right angle marker */}
          <rect x={tipX - 10} y={oy - 10} width="10" height="10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>

          {/* Angle arc */}
          <path d={`M ${ox + 30} ${oy} A 30 30 0 0 0 ${ox + 30 * Math.cos(-rad)} ${oy - 30 * Math.sin(rad) * 0}` } />
          <path d={`M ${ox + 40} ${oy} A 40 40 0 0 0 ${ox + 40 * cos} ${oy - 40 * sin}`}
            fill="none" stroke="#ff7849" strokeWidth="2"/>
          <text x={ox + 55} y={oy - 12} fontSize="14" fill="#ff7849" fontFamily="JetBrains Mono" fontWeight="700">θ = {angle.toFixed(0)}°</text>

          {/* Side labels */}
          {r.ratio !== 'cos' && (
            <text x={tipX + 8} y={(tipY + oy) / 2} fontSize="10" fill={r.ratio === 'sin' || r.ratio === 'tan' ? '#ff7849' : 'rgba(255,255,255,0.6)'} fontFamily="JetBrains Mono" fontWeight="700">
              opp {(ropeLen * sin).toFixed(0)}
            </text>
          )}
          {r.ratio === 'cos' && (
            <text x={tipX + 8} y={(tipY + oy) / 2} fontSize="10" fill="rgba(255,255,255,0.6)" fontFamily="JetBrains Mono">opp</text>
          )}
          <text x={(ox + tipX) / 2 - 20} y={oy + 16} fontSize="10"
            fill={r.ratio === 'cos' || r.ratio === 'tan' ? '#ff7849' : 'rgba(255,255,255,0.6)'}
            fontFamily="JetBrains Mono" fontWeight="700">
            adj {(ropeLen * cos).toFixed(0)}
          </text>
          <text x={(ox + tipX) / 2 - 15} y={(oy + tipY) / 2 - 8} fontSize="10" fill="#ffb37a" fontFamily="JetBrains Mono" fontWeight="700" transform={`rotate(${-angle} ${(ox + tipX)/2} ${(oy + tipY)/2})`}>
            hyp {ropeLen}
          </text>

          {/* Archer (you) as orb */}
          <circle cx={ox} cy={oy} r="10" fill="url(#ropeG)" filter="drop-shadow(0 0 8px #ff7849)"/>

          {/* Arrow animation */}
          {fired && (
            <g>
              <line x1={ox} y1={oy} x2={tipX} y2={tipY}
                stroke="#fff" strokeWidth="2" strokeLinecap="round"
                strokeDasharray={ropeLen} strokeDashoffset={ropeLen}
                opacity="0.9">
                <animate attributeName="stroke-dashoffset" from={ropeLen} to="0" dur="0.6s" fill="freeze"/>
              </line>
            </g>
          )}
        </svg>
      </div>

      {/* Ratio readout panel */}
      <div style={{ position: 'absolute', bottom: 210, left: 16, right: 16, zIndex: 20 }}>
        <div className="glass-dark p-4">
          <div className="row between" style={{ marginBottom: 8 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.2em' }}>LIVE RATIOS</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ember-glow)' }}>target {r.target}</div>
          </div>
          <div className="row gap-2">
            {[
              { name: 'sin', val: sin, desc: 'opp/hyp' },
              { name: 'cos', val: cos, desc: 'adj/hyp' },
              { name: 'tan', val: tan, desc: 'opp/adj' },
            ].map(x => {
              const active = x.name === r.ratio;
              const match = active && Math.abs(x.val - r.target) < tolerance;
              return (
                <div key={x.name} className="flex-1" style={{
                  padding: 10, borderRadius: 12, textAlign: 'center',
                  background: active ? (match ? 'rgba(94,234,212,0.15)' : 'rgba(255,120,73,0.12)') : 'rgba(255,255,255,0.04)',
                  boxShadow: active ? `inset 0 0 0 1px ${match ? '#5eead4' : '#ff7849'}` : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                }}>
                  <div className="mono" style={{ fontSize: 10, color: active ? '#ffb37a' : 'var(--muted-2)', letterSpacing: '0.1em', fontWeight: 700 }}>{x.name.toUpperCase()} θ</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: active ? '#fff' : 'rgba(255,255,255,0.4)', marginTop: 2 }}>{x.val.toFixed(2)}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted-2)', marginTop: 1 }}>{x.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bow control + fire */}
      <div style={{ position: 'absolute', bottom: 48, left: 16, right: 16, zIndex: 20 }}>
        <div className="glass-dark p-4">
          <div className="row between" style={{ marginBottom: 10 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em' }}>DRAW THE BOW</span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#ffb37a' }}>{angle.toFixed(0)}°</span>
          </div>
          <input type="range" min="5" max="85" step="0.5" value={angle}
            onChange={e => setAngle(parseFloat(e.target.value))}
            className="dial"/>
          <div className="row between" style={{ marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 9, color: 'var(--muted-2)' }}>5°</span>
            <span className="mono" style={{ fontSize: 9, color: 'var(--muted-2)' }}>85°</span>
          </div>
          <button className="btn btn-primary" onClick={fire} disabled={fired}
            style={{ width: '100%', marginTop: 12, padding: 14, opacity: fired ? 0.5 : 1 }}>
            <Icon name="bolt" size={16}/> Release arrow
          </button>
        </div>
      </div>

      {/* Hint bubble */}
      {showHint && (
        <div style={{ position: 'absolute', top: 240, left: 16, right: 16, zIndex: 30, animation: 'slideUp .3s' }}>
          <div style={{ background: 'rgba(94,234,212,0.15)', borderRadius: 18, padding: 14, boxShadow: 'inset 0 0 0 1px rgba(94,234,212,0.4)' }}>
            <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
              <Orb size={28} style={{ flexShrink: 0 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#a7f3d7', fontWeight: 600 }}>Try this approach</div>
                <div style={{ fontSize: 12, marginTop: 3, color: 'rgba(255,255,255,0.85)' }}>
                  {r.ratio === 'sin' && 'sin θ = opposite ÷ hypotenuse. You want opp/hyp = 0.5. That means opp is half of hyp → the classic 30° angle.'}
                  {r.ratio === 'cos' && 'cos θ = adjacent ÷ hypotenuse. 0.87 ≈ √3/2 — the adjacent is the longer leg. Think 30°.'}
                  {r.ratio === 'tan' && 'tan θ = opp ÷ adj. For them to be equal, the triangle is isosceles. Angle: 45°.'}
                </div>
              </div>
              <Tappable onClick={() => setShowHint(false)} style={{ color: 'var(--muted)' }}>
                <Icon name="close" size={14}/>
              </Tappable>
            </div>
          </div>
        </div>
      )}

      {/* Feedback modal */}
      {feedback && (
        <GameFeedback kind={feedback} onNext={next} onRetry={() => setFeedback(null)}
          concept={r.ratio === 'sin' ? 'sin θ = opp / hyp' : r.ratio === 'cos' ? 'cos θ = adj / hyp' : 'tan θ = opp / adj'}
          actual={actual} target={r.target}/>
      )}
    </div>
  );
}

// ———— LIGHTHOUSE SURVEYOR — Chapter 9 ————
// Player stands in a lighthouse at height H (given). A ship appears at unknown
// distance D. Player rotates the beam (angle of depression from horizontal).
// When the beam hits the ship, the game REVEALS tan(θ) = H / D → you compute D.
// Then the game asks the player to confirm D by dragging a distance marker.

function LighthouseMission({ onDone, tweaks }) {
  const H = 40; // tower height (m)
  const [beam, setBeam] = useState(15); // deg below horizontal
  const [D_actual] = useState(70); // ship distance
  const [phase, setPhase] = useState('aim'); // aim -> solve -> done
  const [guess, setGuess] = useState(100);

  const targetAngle = Math.atan(H / D_actual) * 180 / Math.PI; // ~29.7°
  const delta = Math.abs(beam - targetAngle);
  const locked = delta < 1.2;

  useEffect(() => {
    if (locked && phase === 'aim') {
      setTimeout(() => setPhase('reveal'), 600);
    }
  }, [locked, phase]);

  // viewport coords
  const W = 402;
  const HH = 500;
  const lx = 70, ly = 120; // lighthouse top
  const sy = ly + 200; // sea level baseline (ish)
  const pxPerM = 3; // scale
  const shipX = lx + D_actual * pxPerM / 1.5;
  const shipY = sy;

  const beamRad = beam * Math.PI / 180;
  const beamLen = 400;
  const beamEndX = lx + beamLen * Math.cos(beamRad);
  const beamEndY = ly + beamLen * Math.sin(beamRad);

  const computedD = Math.round(H / Math.tan(beamRad));

  return (
    <div className="screen" style={{ background: 'linear-gradient(180deg, #0a1028 0%, #1a1f4d 30%, #3b2a62 55%, #8a3a5e 75%, #ff7849 90%, #ffb37a 100%)' }}>
      <Stars count={18} topBias={0.3}/>
      <StatusBar/>

      <div className="hud-top">
        <Tappable onClick={onDone} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={16}/>
        </Tappable>
        <div className="glass" style={{ padding: '8px 14px', borderRadius: 18 }}>
          <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>CH 9 · LIGHTHOUSE</span>
        </div>
      </div>

      {/* Prompt */}
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16, zIndex: 20 }}>
        <div className="glass-dark p-4">
          <div className="mono" style={{ fontSize: 10, color: 'var(--ember-glow)', letterSpacing: '0.2em' }}>
            {phase === 'aim' ? 'MISSION' : phase === 'reveal' ? 'PHYSICS REVEALED' : 'SOLVE IT'}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
            {phase === 'aim' && 'A ship drifts in the dusk. Lock your beam onto it.'}
            {phase === 'reveal' && 'Now: how far is the ship?'}
            {phase === 'solve' && `Drag the distance marker until you're confident. tan ${targetAngle.toFixed(0)}° = ${H}/D`}
          </div>
        </div>
      </div>

      {/* Scene */}
      <div style={{ position: 'absolute', top: 210, left: 0, right: 0, bottom: 220 }}>
        <svg viewBox="0 0 402 500" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="beamG" x1="0" x2="1">
              <stop offset="0" stopColor="#ffd166" stopOpacity="0.9"/>
              <stop offset="1" stopColor="#ffd166" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3b2a62"/>
              <stop offset="1" stopColor="#8a3a5e"/>
            </linearGradient>
          </defs>

          {/* Sea */}
          <rect x="0" y={sy} width="402" height="200" fill="url(#seaG)"/>
          {/* Sea ripples */}
          {[0, 1, 2, 3].map(i => (
            <path key={i} d={`M 0 ${sy + 20 + i * 30} Q 100 ${sy + 15 + i * 30} 200 ${sy + 20 + i * 30} T 402 ${sy + 20 + i * 30}`}
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          ))}

          {/* Lighthouse */}
          <g>
            <rect x={lx - 12} y={ly + 10} width="24" height={sy - ly - 10} fill="#1a0a1f"/>
            <polygon points={`${lx-16},${ly+10} ${lx+16},${ly+10} ${lx+12},${ly} ${lx-12},${ly}`} fill="#1a0a1f"/>
            <circle cx={lx} cy={ly - 4} r="6" fill="#ffd166" filter="drop-shadow(0 0 10px #ffd166)"/>
          </g>

          {/* Horizontal reference line (from lighthouse top) */}
          <line x1={lx} y1={ly} x2="402" y2={ly}
            stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 4"/>
          <text x={lx + 10} y={ly - 8} fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono">horizontal</text>

          {/* Light beam (clip) */}
          <g>
            <polygon points={`${lx},${ly} ${beamEndX},${beamEndY - 12} ${beamEndX},${beamEndY + 12}`}
              fill="url(#beamG)" opacity={locked ? 0.9 : 0.5}/>
            <line x1={lx} y1={ly} x2={beamEndX} y2={beamEndY}
              stroke={locked ? '#7cffb6' : '#ffd166'} strokeWidth={locked ? 2.5 : 2} strokeLinecap="round"/>
          </g>

          {/* Angle of depression arc */}
          <path d={`M ${lx + 25} ${ly} A 25 25 0 0 1 ${lx + 25 * Math.cos(beamRad)} ${ly + 25 * Math.sin(beamRad)}`}
            fill="none" stroke="#ff7849" strokeWidth="2"/>
          <text x={lx + 36} y={ly + 14} fontSize="12" fill="#ff7849" fontFamily="JetBrains Mono" fontWeight="700">
            {beam.toFixed(1)}°
          </text>

          {/* Triangle reveal once locked */}
          {(phase === 'reveal' || phase === 'solve') && (
            <g style={{ animation: 'fadeIn .4s' }}>
              {/* Vertical from tower base to top */}
              <line x1={lx} y1={ly} x2={lx} y2={sy}
                stroke="#5eead4" strokeWidth="2" strokeDasharray="3 3"/>
              <text x={lx - 36} y={(ly + sy) / 2} fontSize="11" fill="#5eead4" fontFamily="JetBrains Mono" fontWeight="700">H = {H}m</text>
              {/* Horizontal base */}
              <line x1={lx} y1={sy} x2={shipX} y2={sy}
                stroke="#5eead4" strokeWidth="2" strokeDasharray="3 3"/>
              <text x={(lx + shipX) / 2 - 20} y={sy + 16} fontSize="11" fill="#5eead4" fontFamily="JetBrains Mono" fontWeight="700">D = ?</text>
              {/* Right angle */}
              <rect x={lx} y={sy - 8} width="8" height="8" fill="none" stroke="#5eead4" strokeWidth="1"/>
            </g>
          )}

          {/* Ship */}
          <g transform={`translate(${shipX}, ${shipY})`}>
            <path d="M -18 0 L 18 0 L 14 8 L -14 8 Z" fill="#1a0a1f"/>
            <rect x="-1" y="-18" width="2" height="18" fill="#1a0a1f"/>
            <path d="M 0 -18 L 10 -6 L 0 -6 Z" fill="#ffb37a"/>
            {/* glow when locked */}
            {locked && (
              <circle cx="0" cy="0" r="20" fill="none" stroke="#7cffb6" strokeWidth="1.5" opacity="0.8">
                <animate attributeName="r" values="14;24;14" dur="1.2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.2s" repeatCount="indefinite"/>
              </circle>
            )}
          </g>
        </svg>
      </div>

      {/* Bottom control panel */}
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16, zIndex: 20 }}>
        {phase === 'aim' && (
          <div className="glass-dark p-4">
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em' }}>ROTATE BEAM · ANGLE OF DEPRESSION</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: locked ? '#7cffb6' : '#ffd166' }}>
                {locked ? 'LOCKED' : beam.toFixed(1) + '°'}
              </span>
            </div>
            <input type="range" min="5" max="60" step="0.5" value={beam}
              onChange={e => setBeam(parseFloat(e.target.value))} className="dial"/>
            <div className="body" style={{ fontSize: 11, marginTop: 6 }}>
              Small angle → far away. Big angle → ship is close.
            </div>
          </div>
        )}

        {phase === 'reveal' && (
          <div className="glass-dark p-5 scene-enter">
            <div className="mono" style={{ fontSize: 10, color: 'var(--ember-glow)', letterSpacing: '0.2em' }}>BEAM LOCKED · YOUR ANGLE = {targetAngle.toFixed(1)}°</div>
            <div style={{ fontSize: 16, fontWeight: 600, margin: '8px 0 10px', color: '#fff' }}>
              You just built a right triangle with the ship.
            </div>
            <div style={{ padding: 12, background: 'rgba(94,234,212,0.1)', borderRadius: 12, fontFamily: 'var(--f-mono)', boxShadow: 'inset 0 0 0 1px rgba(94,234,212,0.3)' }}>
              <div style={{ fontSize: 13, color: '#a7f3d7' }}>
                tan({targetAngle.toFixed(1)}°) = opposite / adjacent = <b>{H}</b> / D
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: '#fff' }}>
                → D = {H} / tan({targetAngle.toFixed(1)}°) ≈ <span style={{ color: '#7cffb6' }}>{computedD} m</span>
              </div>
            </div>
            <button className="btn btn-teal" style={{ width: '100%', marginTop: 12, padding: 14 }}
              onClick={() => onDone({ success: true })}>
              <Icon name="check" size={16}/> I got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ———— POST-SHOT FEEDBACK (Archer) ————
function GameFeedback({ kind, onNext, onRetry, concept, actual, target }) {
  const cfg = {
    hit: { title: 'Bullseye.', sub: 'Clean logic, clean shot.', color: '#7cffb6', bg: 'rgba(94,234,212,0.15)', cta: 'Next round' },
    close: { title: 'Almost there.', sub: 'You\u2019re in the right neighborhood. Sharpen the angle.', color: '#ffd166', bg: 'rgba(251,191,36,0.12)', cta: 'Try again' },
    try: { title: 'Try a different approach.', sub: 'No harm done. Watch what the ratios do as you turn the dial.', color: '#ffb37a', bg: 'rgba(255,120,73,0.15)', cta: 'Try again' },
  }[kind];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', animation: 'fadeIn .3s' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,20,0.65)', backdropFilter: 'blur(8px)' }}/>
      <div className="scene-enter" style={{
        position: 'relative', width: '100%',
        background: `linear-gradient(180deg, ${cfg.bg} 0%, rgba(10,16,40,0.95) 80%)`,
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '28px 20px 32px',
        boxShadow: `inset 0 1px 0 ${cfg.color}44`,
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 18px' }}/>
        <div className="row gap-3">
          <div style={{ width: 48, height: 48, borderRadius: 24, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 0 0 1px ${cfg.color}` }}>
            <Icon name={kind === 'hit' ? 'check' : 'spark'} size={22} color={cfg.color}/>
          </div>
          <div style={{ flex: 1 }}>
            <div className="h-title" style={{ color: cfg.color, fontSize: 22 }}>{cfg.title}</div>
            <div className="body" style={{ fontSize: 13, marginTop: 2 }}>{cfg.sub}</div>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 14, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.15em', marginBottom: 4 }}>WHAT STUCK</div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 14, color: '#fff' }}>{concept}</div>
          <div className="mono" style={{ fontSize: 11, marginTop: 6, color: 'var(--muted)' }}>
            your aim: <b style={{ color: '#fff' }}>{actual.toFixed(2)}</b> · target: <b style={{ color: cfg.color }}>{target}</b>
          </div>
        </div>

        <div className="row gap-2" style={{ marginTop: 14 }}>
          {kind !== 'hit' && (
            <button className="btn btn-ghost flex-1" onClick={onRetry}>Retry</button>
          )}
          <button className="btn btn-primary flex-1" onClick={onNext} style={{ padding: 14 }}>
            {cfg.cta} <Icon name="chev-right" size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MissionIntro, ArcherMission, LighthouseMission, GameFeedback });
