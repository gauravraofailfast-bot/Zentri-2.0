// scenes-f — Chapter 9 full engines + Ch8 boss

// Shared solver — dial-driven angle + derived answer tolerance
function useDialSolver(target, tol = 0.05) {
  const [v, setV] = useState(0);
  const locked = Math.abs(v - target) < tol * Math.abs(target || 1);
  return [v, setV, locked];
}

// Numeric keypad for answer entry
function NumKeypad({ value, onChange, onSubmit }) {
  const keys = [1,2,3,4,5,6,7,8,9,'.',0,'⌫'];
  return (
    <div>
      <div className="col gap-2">
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {keys.map(k => (
            <Tappable key={k} onClick={() => {
              if (k === '⌫') onChange(value.slice(0, -1));
              else if (value.length < 6) onChange(value + k);
            }} className="glass" style={{ flex: '1 0 28%', padding: '14px 0', textAlign: 'center', fontSize: 20, fontFamily: 'var(--f-mono)', fontWeight: 700 }}>{k}</Tappable>
          ))}
        </div>
        <button className="btn btn-primary" onClick={onSubmit} style={{ padding: 14 }}><Icon name="check" size={16}/> Submit</button>
      </div>
    </div>
  );
}

// ───────────── CH9 · M3: Flagstaff on the Tower ─────────────
// NCERT Example 4 vibe: From point P the angle of elevation to the top of a 10m building is 30°,
// from P the angle to the top of a flagstaff on the building is 45°. Find flag length.
function FlagstaffMission({ onDone }) {
  const buildH = 10;          // fixed
  const angleBuild = 30;      // fixed
  const angleFlag = 45;       // fixed
  // Distance from P = buildH / tan(30°) = 10√3
  const dist = buildH / Math.tan(30 * Math.PI / 180);
  const flagTotal = dist * Math.tan(45 * Math.PI / 180); // = 10√3
  const flagLen = flagTotal - buildH; // ≈ 7.32
  const [ans, setAns] = useState('');
  const [result, setResult] = useState(null);

  const check = () => {
    const n = parseFloat(ans);
    if (!isFinite(n)) return;
    if (Math.abs(n - flagLen) < 0.6) { setResult('yes'); setTimeout(() => onDone({ success: true }), 1000); }
    else setResult('close');
  };

  return (
    <div className="screen sky-dusk">
      <Stars count={20}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip chip-ember">FLAGSTAFF</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="mono" style={{ fontSize: 10, color: '#ffb37a', letterSpacing: '0.2em' }}>MISSION · FESTIVAL FLAG</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, lineHeight: 1.35 }}>
            You stand on the ground. A 10m building has a flagstaff on top.
            Elevation to building top = <b style={{ color: '#ffd166' }}>30°</b>, to flag top = <b style={{ color: '#7cffb6' }}>45°</b>.
            How tall is the flag?
          </div>
        </div>
      </div>
      {/* Scene */}
      <svg viewBox="0 0 402 360" style={{ position: 'absolute', top: 240, width: '100%', height: 360 }}>
        {(() => {
          const px = 50, gy = 320;           // person
          const bx = 300;                    // building base x
          const scale = 8;
          const topB = gy - buildH * scale;
          const topF = gy - flagTotal * scale;
          return (
            <>
              <line x1="10" y1={gy} x2="392" y2={gy} stroke="rgba(255,255,255,0.2)"/>
              {/* building */}
              <rect x={bx-30} y={topB} width="60" height={buildH*scale} fill="#3b2a62" stroke="rgba(255,255,255,0.2)"/>
              {/* flagstaff */}
              <line x1={bx} y1={topB} x2={bx} y2={topF} stroke="#ffd166" strokeWidth="2"/>
              <path d={`M ${bx} ${topF} L ${bx+22} ${topF+6} L ${bx} ${topF+14} Z`} fill="#ff7849"/>
              {/* person */}
              <circle cx={px} cy={gy-14} r="6" fill="#ff7849"/>
              <line x1={px} y1={gy-8} x2={px} y2={gy-30} stroke="#ff7849" strokeWidth="2"/>
              {/* sight lines */}
              <line x1={px} y1={gy} x2={bx} y2={topB} stroke="#ffd166" strokeWidth="1.5" strokeDasharray="4 4"/>
              <line x1={px} y1={gy} x2={bx} y2={topF} stroke="#7cffb6" strokeWidth="1.5" strokeDasharray="4 4"/>
              {/* angles */}
              <text x={px+30} y={gy-6} fontSize="11" fill="#ffd166" fontFamily="JetBrains Mono" fontWeight="700">30°</text>
              <text x={px+58} y={gy-22} fontSize="11" fill="#7cffb6" fontFamily="JetBrains Mono" fontWeight="700">45°</text>
              {/* labels */}
              <text x={bx+36} y={topB+30} fontSize="11" fill="rgba(255,255,255,0.7)" fontFamily="JetBrains Mono">10 m</text>
              <text x={bx+6} y={(topB+topF)/2} fontSize="11" fill="#ff7849" fontFamily="JetBrains Mono" fontWeight="700">flag = ?</text>
            </>
          );
        })()}
      </svg>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="row between" style={{ alignItems: 'baseline' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>FLAG LENGTH (m)</span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 24, fontWeight: 700, color: result === 'yes' ? '#7cffb6' : '#ffd166', minWidth: 80, textAlign: 'right' }}>{ans || '—'}</span>
          </div>
          {result === 'close' && <div className="mono" style={{ fontSize: 11, color: '#a78bfa', marginTop: 6 }}>Close — use d = 10/tan30°, then flag = d·tan45° − 10.</div>}
          {result === 'yes' && <div className="mono" style={{ fontSize: 11, color: '#7cffb6', marginTop: 6 }}>✓ about 7.32 m — 10(√3 − 1)</div>}
          <div style={{ marginTop: 10 }}>
            <NumKeypad value={ans} onChange={setAns} onSubmit={check}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────── CH9 · M4: Sun's Shadow ─────────────
// NCERT Example 5: Tower shadow is 4m longer when sun at 30° vs 60°. Find tower height.
// tan60° = h/x → x = h/√3 ; tan30° = h/(x+4) → (x+4) = h√3 → h√3 − h/√3 = 4 → h = 2√3 ≈ 3.46
function ShadowMission({ onDone }) {
  const [t, setT] = useState(0.5); // 0=morning(low sun, long shadow, 30°) → 1=noon(high sun, short shadow, 60°)
  // target: slide until shadow difference = 4m visually
  const H = 3.46;
  const sunAngle = 30 + t * 30; // 30°..60°
  const shadowLen = H / Math.tan(sunAngle * Math.PI / 180);
  const shadowAt30 = H / Math.tan(30 * Math.PI / 180);
  const shadowAt60 = H / Math.tan(60 * Math.PI / 180);
  const diff = shadowAt30 - shadowAt60; // ≈ 4

  const [stage, setStage] = useState(0); // 0=discover, 1=answer
  const [ans, setAns] = useState('');
  const [result, setResult] = useState(null);

  return (
    <div className="screen sky-dusk">
      <Stars count={18}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip chip-ember">SHADOW</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="mono" style={{ fontSize: 10, color: '#ffb37a', letterSpacing: '0.2em' }}>SHADOW LENGTHENS AS THE SUN FALLS</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
            {stage === 0
              ? 'Move the sun. Notice: shadow at 30° is 4 m longer than at 60°. Find the tower\u2019s height.'
              : 'Enter the tower height (m).'}
          </div>
        </div>
      </div>
      <svg viewBox="0 0 402 360" style={{ position: 'absolute', top: 240, width: '100%', height: 360 }}>
        {(() => {
          const gy = 320, bx = 110, scale = 40;
          const towerH = H * scale;
          const shadowPx = shadowLen * scale;
          const sunA = sunAngle * Math.PI / 180;
          const sunD = 160;
          const sunX = bx - sunD * Math.cos(sunA);
          const sunY = gy - towerH - sunD * Math.sin(sunA);
          return (
            <>
              <line x1="0" y1={gy} x2="402" y2={gy} stroke="rgba(255,255,255,0.2)"/>
              {/* sun */}
              <circle cx={sunX} cy={sunY} r="18" fill="#ffd166" opacity="0.95"/>
              <circle cx={sunX} cy={sunY} r="30" fill="#ffd166" opacity="0.2"/>
              {/* sun ray to tip */}
              <line x1={sunX} y1={sunY} x2={bx} y2={gy - towerH} stroke="rgba(255,214,191,0.6)" strokeWidth="1.5" strokeDasharray="3 3"/>
              <line x1={bx} y1={gy-towerH} x2={bx+shadowPx} y2={gy} stroke="rgba(255,214,191,0.6)" strokeWidth="1.5" strokeDasharray="3 3"/>
              {/* tower */}
              <rect x={bx-16} y={gy-towerH} width="32" height={towerH} fill="#3b2a62" stroke="#ff7849"/>
              {/* shadow */}
              <path d={`M ${bx+16} ${gy} L ${bx + shadowPx} ${gy} L ${bx + shadowPx - 16} ${gy + 4} L ${bx+16} ${gy + 4} Z`} fill="rgba(10,5,20,0.6)"/>
              <text x={bx + shadowPx/2 - 20} y={gy + 22} fontSize="11" fill="rgba(255,214,191,0.9)" fontFamily="JetBrains Mono" fontWeight="700">{shadowLen.toFixed(2)} m</text>
              {/* angle arc at shadow tip */}
              <path d={`M ${bx + shadowPx - 30} ${gy} A 30 30 0 0 0 ${bx + shadowPx - 30 * Math.cos(sunA)} ${gy - 30 * Math.sin(sunA)}`} fill="none" stroke="#ffd166" strokeWidth="2"/>
              <text x={bx + shadowPx - 36} y={gy - 8} fontSize="11" fill="#ffd166" fontFamily="JetBrains Mono" fontWeight="700">{sunAngle.toFixed(0)}°</text>
              <text x={bx - 48} y={gy - towerH/2} fontSize="11" fill="#ff7849" fontFamily="JetBrains Mono" fontWeight="700">h = ?</text>
            </>
          );
        })()}
      </svg>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        {stage === 0 ? (
          <div className="glass-dark p-4">
            <div className="row between">
              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>SUN ANGLE</span>
              <span className="mono" style={{ fontSize: 13, color: '#ffd166' }}>{sunAngle.toFixed(0)}° · shadow diff ≈ {diff.toFixed(2)} m</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" value={t} onChange={e => setT(+e.target.value)} className="dial" style={{ marginTop: 8 }}/>
            <button className="btn btn-primary" onClick={() => setStage(1)} style={{ width: '100%', marginTop: 12 }}>I&rsquo;m ready — enter height</button>
          </div>
        ) : (
          <div className="glass-dark p-4">
            <div className="row between"><span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>TOWER HEIGHT (m)</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 700, color: result === 'yes' ? '#7cffb6' : '#fff' }}>{ans || '—'}</span>
            </div>
            {result === 'close' && <div className="mono" style={{ fontSize: 11, color: '#a78bfa', marginTop: 4 }}>Nudge: h√3 − h/√3 = 4 → h = 2√3 ≈ 3.46 m.</div>}
            {result === 'yes' && <div className="mono" style={{ fontSize: 11, color: '#7cffb6', marginTop: 4 }}>✓ 2√3 ≈ 3.46 m. Elegant.</div>}
            <div style={{ marginTop: 10 }}>
              <NumKeypad value={ans} onChange={setAns} onSubmit={() => {
                const n = parseFloat(ans); if (!isFinite(n)) return;
                if (Math.abs(n - H) < 0.3) { setResult('yes'); setTimeout(() => onDone({ success: true }), 1000); }
                else setResult('close');
              }}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────── CH9 · M5: Twin Towers ─────────────
// NCERT Example 6 adapted: From top of a 60m tall tower, angles of depression to the top & bottom of
// another building are 30° and 60°. Find that building's height.
function TwinMission({ onDone }) {
  const myH = 60;
  // x = myH / tan60° = 20√3  (horizontal distance between towers)
  // top of other building depression 30° → its top is at height myH − x·tan30° = 60 − 20 = 40
  // so building height = 40m
  const answer = 40;
  const [ans, setAns] = useState('');
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(0);

  return (
    <div className="screen sky-dusk">
      <Stars count={22}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip chip-ember">TWIN TOWERS</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="mono" style={{ fontSize: 10, color: '#ffb37a', letterSpacing: '0.2em' }}>FROM A 60M TOWER</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, lineHeight: 1.4 }}>
            You look down. Depression to <b style={{ color: '#ffd166' }}>top</b> of the next building = 30°,
            to its <b style={{ color: '#7cffb6' }}>bottom</b> = 60°. Find its height.
          </div>
        </div>
      </div>
      <svg viewBox="0 0 402 380" style={{ position: 'absolute', top: 240, width: '100%', height: 380 }}>
        {(() => {
          const gy = 340, ax = 80, bx = 330;
          const topA = gy - 200;       // 60m
          const topB = gy - 200 * (40/60); // 40m scaled
          return (
            <>
              <line x1="0" y1={gy} x2="402" y2={gy} stroke="rgba(255,255,255,0.2)"/>
              <rect x={ax-22} y={topA} width="44" height={gy-topA} fill="#3b2a62" stroke="#ff7849"/>
              <rect x={bx-18} y={topB} width="36" height={gy-topB} fill="#1a1f4d" stroke="rgba(255,255,255,0.3)"/>
              {/* horizontal from A */}
              <line x1={ax} y1={topA} x2="392" y2={topA} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3"/>
              {/* sight lines */}
              <line x1={ax} y1={topA} x2={bx} y2={topB} stroke="#ffd166" strokeWidth="1.6" strokeDasharray="4 4"/>
              <line x1={ax} y1={topA} x2={bx} y2={gy} stroke="#7cffb6" strokeWidth="1.6" strokeDasharray="4 4"/>
              <text x={ax+16} y={topA+12} fontSize="11" fill="#ffd166" fontFamily="JetBrains Mono" fontWeight="700">30°</text>
              <text x={ax+16} y={topA+30} fontSize="11" fill="#7cffb6" fontFamily="JetBrains Mono" fontWeight="700">60°</text>
              <text x={ax-60} y={(topA+gy)/2} fontSize="11" fill="rgba(255,255,255,0.8)" fontFamily="JetBrains Mono">60 m</text>
              <text x={bx+18} y={(topB+gy)/2} fontSize="11" fill="#ff7849" fontFamily="JetBrains Mono" fontWeight="700">h = ?</text>
            </>
          );
        })()}
      </svg>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="row between"><span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>HEIGHT (m)</span>
            <Tappable onClick={() => setHint(h => h+1)} className="chip" style={{ fontSize: 11 }}><Icon name="hint" size={12}/> Hint</Tappable>
          </div>
          {hint > 0 && <div className="mono" style={{ fontSize: 11, color: '#a78bfa', marginTop: 8 }}>First find the distance x between towers using tan 60° and 60 m.</div>}
          {hint > 1 && <div className="mono" style={{ fontSize: 11, color: '#a78bfa', marginTop: 4 }}>Then h = 60 − x·tan 30°.</div>}
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 24, fontWeight: 700, color: result === 'yes' ? '#7cffb6' : '#fff', marginTop: 10, textAlign: 'right' }}>{ans || '—'}</div>
          <div style={{ marginTop: 10 }}>
            <NumKeypad value={ans} onChange={setAns} onSubmit={() => {
              const n = parseFloat(ans); if (!isFinite(n)) return;
              if (Math.abs(n - answer) < 1) { setResult('yes'); setTimeout(() => onDone({ success: true }), 900); }
              else setResult('close');
            }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────── CH9 · M6 BOSS: The River ─────────────
// NCERT Example 7: From a point on a bridge (3m above water), depressions to banks are 30° and 45°.
// Find river width.  d1 = 3/tan30° = 3√3 ; d2 = 3/tan45° = 3 ; width = 3 + 3√3 ≈ 8.196
function RiverBossMission({ onDone }) {
  const bridgeH = 3;
  const answer = bridgeH + bridgeH * Math.sqrt(3); // 8.196
  const [a1, setA1] = useState(20);  // player rotates two sight lines
  const [a2, setA2] = useState(20);
  const [locked1, setLocked1] = useState(false);
  const [locked2, setLocked2] = useState(false);
  const [ans, setAns] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => { if (Math.abs(a1 - 30) < 1.5) setLocked1(true); }, [a1]);
  useEffect(() => { if (Math.abs(a2 - 45) < 1.5) setLocked2(true); }, [a2]);
  const bothLocked = locked1 && locked2;

  return (
    <div className="screen sky-dusk">
      <Stars count={30}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', boxShadow: 'inset 0 0 0 1px #fbbf24' }}><Icon name="crown" size={12}/> BOSS · CH 9</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="mono" style={{ fontSize: 10, color: '#fbbf24', letterSpacing: '0.2em' }}>MEASURE THE RIVER</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, lineHeight: 1.4 }}>
            You&rsquo;re on a 3 m bridge. Lock your depression beams to <b style={{ color: '#7cffb6' }}>30°</b> & <b style={{ color: '#ffd166' }}>45°</b>, one on each bank. Then enter the width.
          </div>
        </div>
      </div>
      <svg viewBox="0 0 402 380" style={{ position: 'absolute', top: 240, width: '100%', height: 380 }}>
        {(() => {
          const wy = 260, gy = 340;  // water surface, river bottom (visual)
          const bx = 201, by = 190;  // bridge/observer
          const s = 30;
          const r1 = a1 * Math.PI / 180;
          const r2 = a2 * Math.PI / 180;
          const len1 = 180, len2 = 180;
          const x1 = bx - len1 * Math.cos(r1), y1 = by + len1 * Math.sin(r1);
          const x2 = bx + len2 * Math.cos(r2), y2 = by + len2 * Math.sin(r2);
          return (
            <>
              {/* water */}
              <rect x="0" y={wy} width="402" height={gy-wy} fill="url(#riv)"/>
              <defs>
                <linearGradient id="riv" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#1a1f4d"/><stop offset="1" stopColor="#0a1028"/>
                </linearGradient>
              </defs>
              {/* banks */}
              <rect x="0" y={wy-4} width="40" height="4" fill="#3b2a62"/>
              <rect x="362" y={wy-4} width="40" height="4" fill="#3b2a62"/>
              {/* bridge */}
              <rect x={bx-60} y={by-6} width="120" height="8" fill="#3b2a62" stroke="#ff7849"/>
              <line x1={bx-50} y1={by+2} x2={bx-50} y2={wy} stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4"/>
              <line x1={bx+50} y1={by+2} x2={bx+50} y2={wy} stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4"/>
              {/* observer */}
              <circle cx={bx} cy={by-8} r="5" fill="#ff7849"/>
              {/* horizontal */}
              <line x1={bx-150} y1={by} x2={bx+150} y2={by} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4"/>
              {/* sight lines */}
              <line x1={bx} y1={by} x2={x1} y2={y1} stroke={locked1 ? '#7cffb6' : 'rgba(124,255,182,0.6)'} strokeWidth={locked1 ? 3 : 2}/>
              <line x1={bx} y1={by} x2={x2} y2={y2} stroke={locked2 ? '#ffd166' : 'rgba(255,209,102,0.6)'} strokeWidth={locked2 ? 3 : 2}/>
              <text x={bx-36} y={by-6} fontSize="11" fill="#7cffb6" fontFamily="JetBrains Mono" fontWeight="700">{a1.toFixed(0)}°</text>
              <text x={bx+18} y={by-6} fontSize="11" fill="#ffd166" fontFamily="JetBrains Mono" fontWeight="700">{a2.toFixed(0)}°</text>
              <text x="175" y={wy+24} fontSize="11" fill="#ff7849" fontFamily="JetBrains Mono" fontWeight="700">width = ?</text>
            </>
          );
        })()}
      </svg>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        {!bothLocked ? (
          <div className="glass-dark p-4 col gap-3">
            <div>
              <div className="row between"><span className="mono" style={{ fontSize: 11, color: '#7cffb6' }}>LEFT BEAM · lock at 30°</span><span className="mono" style={{ fontSize: 12, color: locked1 ? '#7cffb6' : '#fff' }}>{a1.toFixed(0)}° {locked1 && '✓'}</span></div>
              <input type="range" min="10" max="60" value={a1} onChange={e => { setLocked1(false); setA1(+e.target.value); }} className="dial" style={{ marginTop: 6 }}/>
            </div>
            <div>
              <div className="row between"><span className="mono" style={{ fontSize: 11, color: '#ffd166' }}>RIGHT BEAM · lock at 45°</span><span className="mono" style={{ fontSize: 12, color: locked2 ? '#ffd166' : '#fff' }}>{a2.toFixed(0)}° {locked2 && '✓'}</span></div>
              <input type="range" min="10" max="60" value={a2} onChange={e => { setLocked2(false); setA2(+e.target.value); }} className="dial" style={{ marginTop: 6 }}/>
            </div>
          </div>
        ) : (
          <div className="glass-dark p-4">
            <div className="row between"><span className="mono" style={{ fontSize: 11, color: '#fbbf24' }}>RIVER WIDTH (m)</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 700, color: result === 'yes' ? '#7cffb6' : '#fff' }}>{ans || '—'}</span>
            </div>
            {result === 'close' && <div className="mono" style={{ fontSize: 11, color: '#a78bfa', marginTop: 4 }}>d₁ = 3/tan30° = 3√3; d₂ = 3/tan45° = 3. Add them.</div>}
            {result === 'yes' && <div className="mono" style={{ fontSize: 11, color: '#7cffb6', marginTop: 4 }}>✓ 3 + 3√3 ≈ 8.20 m. You just measured a river from a bridge.</div>}
            <div style={{ marginTop: 10 }}>
              <NumKeypad value={ans} onChange={setAns} onSubmit={() => {
                const n = parseFloat(ans); if (!isFinite(n)) return;
                if (Math.abs(n - answer) < 0.5) { setResult('yes'); setTimeout(() => onDone({ success: true, boss: true }), 1200); }
                else setResult('close');
              }}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────── CH8 Boss: The Dusk Minar ─────────────
// Synthesis: given partial info, find any ratio. Multi-round.
function TrigBossMission({ onDone }) {
  const rounds = [
    { prompt: 'A 24 m tall minar. You stand 24 m away. What is the angle of elevation?', answer: 45, tol: 2, unit: '°', hint: 'tan θ = opp/adj = 24/24' },
    { prompt: 'sin 30° + cos 60° = ?', answer: 1, tol: 0.05, unit: '', hint: 'Both equal 1/2.' },
    { prompt: 'If sin A = 3/5, cos A = ?', answer: 0.8, tol: 0.05, unit: '', hint: 'Right triangle 3-4-5: cos = 4/5.' },
    { prompt: 'tan² 60° − 1 = ?', answer: 2, tol: 0.1, unit: '', hint: 'tan 60° = √3, so 3 − 1 = 2.' },
  ];
  const [ri, setRi] = useState(0);
  const [ans, setAns] = useState('');
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(false);
  const r = rounds[ri];
  const progress = (ri / rounds.length) * 100;

  return (
    <div className="screen sky-dusk">
      <Stars count={40}/>
      <DuskSkyline height={160} opacity={0.9}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', boxShadow: 'inset 0 0 0 1px #fbbf24' }}><Icon name="crown" size={12}/> BOSS · CH 8</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: 6 }}>ROUND {ri+1} / {rounds.length}</div>
        <div className="meter ember"><div className="fill" style={{ width: progress + '%' }}/></div>
      </div>
      <div style={{ position: 'absolute', top: 160, left: 16, right: 16 }}>
        <div className="glass-dark p-5">
          <div className="mono" style={{ fontSize: 10, color: '#fbbf24', letterSpacing: '0.2em' }}>THE DUSK MINAR ASKS</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>{r.prompt}</div>
          {hint && <div className="mono" style={{ fontSize: 12, color: '#a78bfa', marginTop: 10 }}>{r.hint}</div>}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 310, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 200 200" width="180" height="180">
          <circle cx="100" cy="100" r="70" fill="none" stroke="#fbbf24" strokeOpacity="0.3" strokeDasharray="4 4"/>
          <circle cx="100" cy="100" r="50" fill="url(#bossCore)"/>
          <defs>
            <radialGradient id="bossCore"><stop offset="0" stopColor="#ffd166"/><stop offset="0.7" stopColor="#ff7849"/><stop offset="1" stopColor="#3b2a62"/></radialGradient>
          </defs>
          <path d="M100 100 L100 55" stroke="#1a0a1f" strokeWidth="3" strokeLinecap="round"/>
          <g style={{ transformOrigin: '100px 100px', animation: 'spin 14s linear infinite' }}>
            {[0,60,120,180,240,300].map(a => (
              <line key={a} x1={100 + 50*Math.cos(a*Math.PI/180)} y1={100 + 50*Math.sin(a*Math.PI/180)} x2={100 + 62*Math.cos(a*Math.PI/180)} y2={100 + 62*Math.sin(a*Math.PI/180)} stroke="#ffb37a" strokeWidth="2"/>
            ))}
          </g>
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="row between">
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>YOUR ANSWER {r.unit && `(${r.unit})`}</span>
            <Tappable onClick={() => setHint(true)} className="chip"><Icon name="hint" size={12}/> Hint</Tappable>
          </div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 28, fontWeight: 700, color: result === 'yes' ? '#7cffb6' : '#fff', textAlign: 'right', marginTop: 6 }}>{ans || '—'}</div>
          {result === 'close' && <div className="mono" style={{ fontSize: 11, color: '#ffd166', marginTop: 4 }}>Almost. Try the hint.</div>}
          <div style={{ marginTop: 10 }}>
            <NumKeypad value={ans} onChange={setAns} onSubmit={() => {
              const n = parseFloat(ans); if (!isFinite(n)) return;
              if (Math.abs(n - r.answer) < r.tol) {
                setResult('yes');
                setTimeout(() => {
                  if (ri < rounds.length - 1) { setRi(ri+1); setAns(''); setResult(null); setHint(false); }
                  else onDone({ success: true, boss: true });
                }, 800);
              } else setResult('close');
            }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FlagstaffMission, ShadowMission, TwinMission, RiverBossMission, TrigBossMission, NumKeypad });
