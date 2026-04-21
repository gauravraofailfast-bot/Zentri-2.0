// scenes-e — NEW mini-game engines for Ch8 + Ch9 full coverage
// Compact: each is a self-contained mission component.

// ───────────── CH8 · M1: Triangle Anatomy ─────────────
function AnatomyMission({ onDone }) {
  const [angle, setAngle] = useState(35);
  const [stage, setStage] = useState(0); // 0 opp, 1 adj, 2 hyp
  const [picked, setPicked] = useState(null);
  const prompts = ['opposite', 'adjacent', 'hypotenuse'];
  const want = prompts[stage];
  const ox = 80, oy = 380, len = 220;
  const rad = angle * Math.PI / 180;
  const tipX = ox + len * Math.cos(rad), tipY = oy - len * Math.sin(rad);

  // midpoints
  const mids = {
    adjacent: { x: (ox + tipX) / 2, y: oy + 16 },
    opposite: { x: tipX + 14, y: (oy + tipY) / 2 },
    hypotenuse: { x: (ox + tipX) / 2 - 8, y: (oy + tipY) / 2 - 14 },
  };

  const pick = (side) => {
    setPicked(side);
    setTimeout(() => {
      if (side === want) {
        if (stage < 2) { setStage(stage + 1); setPicked(null); }
        else onDone({ success: true });
      } else setPicked(null);
    }, 700);
  };

  return (
    <div className="screen sky-dusk">
      <Stars count={20}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip">{stage + 1}/3</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="mono" style={{ fontSize: 10, color: 'var(--ember-glow)', letterSpacing: '0.2em' }}>TAP THE SIDE</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>Which side is <span style={{ color: '#ff7849' }}>{want}</span> to θ?</div>
          <div className="body" style={{ fontSize: 12, marginTop: 4 }}>Turn the dial — sides change role with the angle.</div>
        </div>
      </div>
      <svg viewBox="0 0 402 500" style={{ position: 'absolute', top: 210, width: '100%', height: 400 }}>
        <line x1={ox} y1={oy} x2={tipX} y2={oy} stroke={picked === 'adjacent' ? (want === 'adjacent' ? '#7cffb6' : '#ffd166') : 'rgba(255,255,255,0.45)'} strokeWidth={want === 'adjacent' || picked === 'adjacent' ? 4 : 2} style={{ cursor: 'pointer' }} onClick={() => pick('adjacent')}/>
        <line x1={tipX} y1={oy} x2={tipX} y2={tipY} stroke={picked === 'opposite' ? (want === 'opposite' ? '#7cffb6' : '#ffd166') : 'rgba(255,255,255,0.45)'} strokeWidth={want === 'opposite' || picked === 'opposite' ? 4 : 2} style={{ cursor: 'pointer' }} onClick={() => pick('opposite')}/>
        <line x1={ox} y1={oy} x2={tipX} y2={tipY} stroke={picked === 'hypotenuse' ? (want === 'hypotenuse' ? '#7cffb6' : '#ffd166') : '#ff7849'} strokeWidth={want === 'hypotenuse' || picked === 'hypotenuse' ? 4 : 3} style={{ cursor: 'pointer' }} onClick={() => pick('hypotenuse')}/>
        <path d={`M ${ox + 40} ${oy} A 40 40 0 0 0 ${ox + 40 * Math.cos(rad)} ${oy - 40 * Math.sin(rad)}`} fill="none" stroke="#ff7849" strokeWidth="2"/>
        <text x={ox + 52} y={oy - 10} fontSize="14" fill="#ff7849" fontFamily="JetBrains Mono" fontWeight="700">θ</text>
        <rect x={tipX - 10} y={oy - 10} width="10" height="10" fill="none" stroke="rgba(255,255,255,0.4)"/>
        <circle cx={ox} cy={oy} r="8" fill="#ff7849"/>
        {/* hit areas with labels for tap */}
        <g>
          <text x={mids.adjacent.x - 22} y={mids.adjacent.y + 12} fontSize="11" fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono">tap</text>
        </g>
      </svg>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em' }}>ROTATE θ</span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#ffb37a' }}>{angle.toFixed(0)}°</span>
          </div>
          <input type="range" min="10" max="80" value={angle} onChange={e => setAngle(+e.target.value)} className="dial"/>
        </div>
      </div>
    </div>
  );
}

// ───────────── CH8 · M4: Angles Arena (30/45/60) ─────────────
// Drop the correct angle into the slot. Values like sin 30° = 1/2 animate onto a ramp.
function AnglesMission({ onDone }) {
  const rounds = [
    { q: 'sin ? = 1/2', ans: 30, opts: [30, 45, 60, 90] },
    { q: 'cos ? = 1/2', ans: 60, opts: [0, 30, 45, 60] },
    { q: 'tan ? = 1', ans: 45, opts: [30, 45, 60, 90] },
    { q: 'sin ? = √3/2', ans: 60, opts: [30, 45, 60, 0] },
    { q: 'cos ? = 1', ans: 0, opts: [0, 30, 45, 90] },
    { q: 'tan ? = √3', ans: 60, opts: [30, 45, 60, 90] },
  ];
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const r = rounds[i];

  const commit = (v) => {
    setPick(v);
    setTimeout(() => {
      if (v === r.ans) {
        if (i < rounds.length - 1) { setI(i + 1); setPick(null); }
        else onDone({ success: true });
      } else setPick(null);
    }, 800);
  };

  return (
    <div className="screen sky-dusk">
      <Stars count={18}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip">{i + 1}/{rounds.length}</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="glass-dark p-5" style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ember-glow)', letterSpacing: '0.2em' }}>SPECIAL ANGLES ARENA</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, fontFamily: 'var(--f-mono)' }}>{r.q}</div>
        </div>
      </div>
      {/* Ramp visual — if angle picked and correct, show ramp at that slope */}
      <svg viewBox="0 0 402 360" style={{ position: 'absolute', top: 250, width: '100%', height: 360 }}>
        <line x1="40" y1="300" x2="380" y2="300" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4"/>
        {pick && (() => {
          const a = pick * Math.PI / 180, len = 220;
          const x2 = 60 + len * Math.cos(a), y2 = 300 - len * Math.sin(a);
          const good = pick === r.ans;
          return (
            <>
              <path d={`M 60 300 L ${x2} ${y2} L ${x2} 300 Z`} fill={good ? 'rgba(124,255,182,0.25)' : 'rgba(251,191,36,0.2)'} stroke={good ? '#7cffb6' : '#ffd166'} strokeWidth="2"/>
              <text x={x2 + 6} y={y2 - 6} fontSize="13" fill={good ? '#7cffb6' : '#ffd166'} fontFamily="JetBrains Mono" fontWeight="700">{pick}°</text>
              <circle cx="60" cy="300" r="8" fill="#ff7849"/>
            </>
          );
        })()}
      </svg>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {r.opts.map(o => (
            <Tappable key={o} onClick={() => commit(o)} className="glass" style={{ flex: '1 0 45%', padding: '18px 0', textAlign: 'center', fontSize: 22, fontFamily: 'var(--f-mono)', fontWeight: 700, boxShadow: pick === o ? `inset 0 0 0 2px ${o === r.ans ? '#7cffb6' : '#ffd166'}` : 'inset 0 0 0 1px rgba(255,255,255,0.1)', background: pick === o ? (o === r.ans ? 'rgba(124,255,182,0.15)' : 'rgba(251,191,36,0.12)') : 'rgba(255,255,255,0.06)' }}>{o}°</Tappable>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────── CH8 · M5: Ratio Decoder ─────────────
// Given tan A = 4/3 → find sin A and cos A by sliding the right-triangle sides.
function DecoderMission({ onDone }) {
  const rounds = [
    { given: 'tan A = 4/3', opp: 4, adj: 3, targets: { sin: 4/5, cos: 3/5 } },
    { given: 'sin A = 5/13', opp: 5, adj: 12, targets: { cos: 12/13, tan: 5/12 } },
  ];
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState({});
  const r = rounds[i];
  const hyp = Math.sqrt(r.opp ** 2 + r.adj ** 2);

  const pick = (key, val) => {
    const good = Math.abs(val - r.targets[key]) < 0.01;
    setAnswered(a => ({ ...a, [key]: good ? 'yes' : 'no' }));
    if (good) {
      const doneCount = Object.values({...answered, [key]:'yes'}).filter(x => x === 'yes').length;
      if (doneCount >= Object.keys(r.targets).length) {
        setTimeout(() => {
          if (i < rounds.length - 1) { setI(i + 1); setAnswered({}); }
          else onDone({ success: true });
        }, 700);
      }
    }
  };

  const ratios = Object.keys(r.targets);

  return (
    <div className="screen sky-dusk">
      <Stars count={18}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip">Decoder</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="mono" style={{ fontSize: 10, color: 'var(--ember-glow)', letterSpacing: '0.2em' }}>GIVEN</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--f-mono)', marginTop: 4 }}>{r.given}</div>
          <div className="body" style={{ fontSize: 12, marginTop: 4 }}>Use Pythagoras to find the missing side. Tap the right ratio.</div>
        </div>
      </div>
      <svg viewBox="0 0 402 300" style={{ position: 'absolute', top: 240, width: '100%', height: 280 }}>
        {(() => {
          const scale = 30; const ox = 120, oy = 240;
          const tipX = ox + r.adj * scale, tipY = oy - r.opp * scale;
          return (
            <>
              <line x1={ox} y1={oy} x2={tipX} y2={oy} stroke="#5eead4" strokeWidth="3"/>
              <line x1={tipX} y1={oy} x2={tipX} y2={tipY} stroke="#a78bfa" strokeWidth="3"/>
              <line x1={ox} y1={oy} x2={tipX} y2={tipY} stroke="#ff7849" strokeWidth="3"/>
              <text x={(ox + tipX)/2 - 10} y={oy + 18} fontSize="13" fill="#5eead4" fontFamily="JetBrains Mono" fontWeight="700">adj {r.adj}</text>
              <text x={tipX + 8} y={(oy + tipY)/2} fontSize="13" fill="#a78bfa" fontFamily="JetBrains Mono" fontWeight="700">opp {r.opp}</text>
              <text x={(ox + tipX)/2 - 32} y={(oy + tipY)/2 - 10} fontSize="13" fill="#ff7849" fontFamily="JetBrains Mono" fontWeight="700">hyp {hyp.toFixed(0)}</text>
              <rect x={tipX - 10} y={oy - 10} width="10" height="10" fill="none" stroke="rgba(255,255,255,0.4)"/>
            </>
          );
        })()}
      </svg>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        <div className="col gap-3">
          {ratios.map(k => {
            const options = k === 'sin' ? [r.opp + '/' + hyp, r.adj + '/' + hyp, r.opp + '/' + r.adj]
              : k === 'cos' ? [r.adj + '/' + hyp, r.opp + '/' + hyp, r.adj + '/' + r.opp]
              : [r.opp + '/' + r.adj, r.adj + '/' + r.opp, r.opp + '/' + hyp];
            const values = options.map(s => { const [a,b] = s.split('/').map(Number); return a/b; });
            return (
              <div key={k} className="glass-dark p-3">
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: 8 }}>{k.toUpperCase()} A = ?</div>
                <div className="row gap-2">
                  {options.map((o, idx) => {
                    const good = answered[k] === 'yes' && Math.abs(values[idx] - r.targets[k]) < 0.01;
                    return (
                      <Tappable key={idx} onClick={() => answered[k] !== 'yes' && pick(k, values[idx])} className="flex-1" style={{ padding: 10, borderRadius: 10, textAlign: 'center', fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 15, background: good ? 'rgba(124,255,182,0.15)' : 'rgba(255,255,255,0.06)', boxShadow: good ? 'inset 0 0 0 1px #7cffb6' : 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>{o}</Tappable>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ───────────── CH8 · M6: Identity Forge (unit circle) ─────────────
function IdentityMission({ onDone }) {
  const [angle, setAngle] = useState(40);
  const [stage, setStage] = useState(0);
  const rad = angle * Math.PI / 180;
  const sin = Math.sin(rad), cos = Math.cos(rad);
  const R = 120, cx = 180, cy = 250;
  const px = cx + R * cos, py = cy - R * sin;

  const identities = [
    { lhs: 'sin²θ + cos²θ', rhs: '1', color: '#7cffb6', verify: () => Math.abs(sin*sin + cos*cos - 1) < 0.01 },
    { lhs: '1 + tan²θ', rhs: 'sec²θ', color: '#ffb37a', verify: () => Math.abs((1 + Math.tan(rad)**2) - (1/(cos*cos))) < 0.02 },
    { lhs: '1 + cot²θ', rhs: 'cosec²θ', color: '#a78bfa', verify: () => Math.abs((1 + (1/Math.tan(rad))**2) - (1/(sin*sin))) < 0.05 },
  ];
  const cur = identities[stage];
  const verified = cur.verify();

  return (
    <div className="screen sky-night">
      <Stars count={30}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip chip-ember">IDENTITY {stage+1}/3</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="glass-dark p-4" style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 10, color: cur.color, letterSpacing: '0.2em' }}>FORGE THE IDENTITY</div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, fontFamily: 'var(--f-mono)' }}>
            <span style={{ color: cur.color }}>{cur.lhs}</span> = {cur.rhs}
          </div>
          <div className="body" style={{ fontSize: 12, marginTop: 4 }}>Rotate θ. Watch the identity hold — for every angle.</div>
        </div>
      </div>
      <svg viewBox="0 0 360 360" style={{ position: 'absolute', top: 230, width: '100%', height: 360 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="2 4"/>
        <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="rgba(255,255,255,0.15)"/>
        <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke="rgba(255,255,255,0.15)"/>
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#ff7849" strokeWidth="3"/>
        <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#5eead4" strokeWidth="3"/>
        <line x1={px} y1={cy} x2={px} y2={py} stroke="#a78bfa" strokeWidth="3"/>
        <circle cx={px} cy={py} r="6" fill="#fff"/>
        <text x={(cx+px)/2 - 14} y={cy + 14} fontSize="12" fill="#5eead4" fontFamily="JetBrains Mono" fontWeight="700">cos θ</text>
        <text x={px + 6} y={(cy+py)/2} fontSize="12" fill="#a78bfa" fontFamily="JetBrains Mono" fontWeight="700">sin θ</text>
        <text x={(cx+px)/2 - 12} y={(cy+py)/2 - 10} fontSize="12" fill="#ff7849" fontFamily="JetBrains Mono" fontWeight="700">1</text>
      </svg>
      <div style={{ position: 'absolute', bottom: 130, left: 16, right: 16 }}>
        <div className="glass-dark p-4" style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 11, color: cur.color, fontWeight: 700 }}>
            {stage === 0 && `sin²θ + cos²θ = ${(sin*sin).toFixed(2)} + ${(cos*cos).toFixed(2)} = ${(sin*sin + cos*cos).toFixed(2)}`}
            {stage === 1 && `1 + tan²θ = ${(1 + Math.tan(rad)**2).toFixed(2)}  ·  sec²θ = ${(1/(cos*cos)).toFixed(2)}`}
            {stage === 2 && `1 + cot²θ = ${(1 + (1/Math.tan(rad))**2).toFixed(2)}  ·  cosec²θ = ${(1/(sin*sin)).toFixed(2)}`}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: verified ? '#7cffb6' : '#ffd166' }}>
            {verified ? '✓ Holds at this angle' : '≈ getting there'}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>ROTATE θ</span>
            <span className="mono" style={{ fontSize: 13, color: '#ffb37a' }}>{angle.toFixed(0)}°</span>
          </div>
          <input type="range" min="10" max="80" value={angle} onChange={e => setAngle(+e.target.value)} className="dial"/>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={() => {
            if (stage < 2) setStage(stage + 1);
            else onDone({ success: true });
          }}>
            {stage < 2 ? 'Next identity' : 'Forge complete'} <Icon name="chev-right" size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────── CH8 · M7: Proof Duel (tile rearrange) ─────────────
function ProofMission({ onDone }) {
  // Prove: (1 - sin θ)(1 + sin θ) = cos²θ   — drag tiles in order
  const solutions = [
    { claim: '(1 − sinθ)(1 + sinθ) = cos²θ', steps: ['= 1² − sin²θ', '= 1 − sin²θ', '= cos²θ  ✓'], distract: ['= 2 sinθ', '= tan²θ'] },
    { claim: 'sec²θ − tan²θ = 1', steps: ['sec²θ = 1 + tan²θ', '∴ sec²θ − tan²θ = 1', '✓'], distract: ['= cos²θ', '= sinθ'] },
  ];
  const [si, setSi] = useState(0);
  const s = solutions[si];
  const [pool, setPool] = useState(() => shuffle([...s.steps, ...s.distract]));
  const [chosen, setChosen] = useState([]);
  useEffect(() => { setPool(shuffle([...s.steps, ...s.distract])); setChosen([]); }, [si]);
  function shuffle(a){ return a.map(v=>[Math.random(),v]).sort().map(x=>x[1]); }

  const tap = (tile) => {
    const next = [...chosen, tile];
    setChosen(next);
    setPool(pool.filter(t => t !== tile));
    if (next.length === s.steps.length) {
      const good = next.every((t, i) => t === s.steps[i]);
      setTimeout(() => {
        if (good) {
          if (si < solutions.length - 1) setSi(si + 1);
          else onDone({ success: true });
        } else {
          setChosen([]);
          setPool(shuffle([...s.steps, ...s.distract]));
        }
      }, 900);
    }
  };

  return (
    <div className="screen sky-night">
      <Stars count={30}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip chip-ember">PROOF {si+1}/2</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="glass-dark p-4" style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 10, color: '#ffb37a', letterSpacing: '0.2em' }}>PROVE</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, fontFamily: 'var(--f-mono)' }}>{s.claim}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 240, left: 16, right: 16 }}>
        <div className="glass p-4">
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.15em', marginBottom: 10 }}>YOUR PROOF</div>
          <div className="col gap-2">
            {s.steps.map((_, i) => (
              <div key={i} style={{ minHeight: 40, padding: '10px 14px', borderRadius: 10, background: chosen[i] ? 'rgba(255,120,73,0.15)' : 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1px ${chosen[i] === s.steps[i] ? '#7cffb6' : chosen[i] ? '#ffd166' : 'rgba(255,255,255,0.08)'}`, fontFamily: 'var(--f-mono)', fontSize: 14 }}>
                {chosen[i] || <span style={{ color: 'rgba(255,255,255,0.3)' }}>step {i+1}…</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, letterSpacing: '0.15em' }}>PICK IN ORDER</div>
        <div className="col gap-2">
          {pool.map((t, i) => (
            <Tappable key={i} onClick={() => tap(t)} className="glass" style={{ padding: '12px 14px', fontFamily: 'var(--f-mono)', fontSize: 14, textAlign: 'left' }}>{t}</Tappable>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────── CH9 · M1: Line of Sight (interactive concept) ─────────────
function SightMission({ onDone }) {
  const [head, setHead] = useState(0); // -30 (down/depression) .. +30 (up/elevation)
  const [round, setRound] = useState(0);
  const rounds = [
    { ask: 'Look UP at the kite. What angle forms with horizontal?', want: 'elevation', sign: +1 },
    { ask: 'Look DOWN at the boat. What angle forms?', want: 'depression', sign: -1 },
  ];
  const r = rounds[round];
  const pick = (kind) => {
    setTimeout(() => {
      if (kind === r.want) {
        if (round < rounds.length - 1) setRound(round + 1);
        else onDone({ success: true });
      }
    }, 500);
  };

  return (
    <div className="screen sky-dusk">
      <Stars count={25}/>
      <StatusBar/>
      <div className="hud-top">
        <Tappable onClick={() => onDone({})} className="glass" style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={16}/></Tappable>
        <span className="chip">{round+1}/2</span>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="mono" style={{ fontSize: 10, color: '#ffb37a', letterSpacing: '0.2em' }}>LINE OF SIGHT</div>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{r.ask}</div>
        </div>
      </div>
      <svg viewBox="0 0 402 360" style={{ position: 'absolute', top: 230, width: '100%', height: 360 }}>
        {/* Observer */}
        <circle cx="80" cy="220" r="14" fill="#ff7849"/>
        {/* horizontal */}
        <line x1="80" y1="220" x2="380" y2="220" stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4"/>
        <text x="320" y="214" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono">horizontal</text>
        {/* line of sight */}
        {(() => {
          const a = head * Math.PI / 180;
          const x2 = 80 + 260 * Math.cos(a), y2 = 220 - 260 * Math.sin(a);
          return <line x1="80" y1="220" x2={x2} y2={y2} stroke="#ffd166" strokeWidth="3"/>;
        })()}
        {/* kite */}
        <g style={{ opacity: r.sign > 0 ? 1 : 0.4 }}>
          <path d="M 320 60 L 335 80 L 320 100 L 305 80 Z" fill="#a78bfa"/>
          <line x1="320" y1="100" x2="300" y2="180" stroke="rgba(255,255,255,0.3)"/>
        </g>
        {/* boat */}
        <g style={{ opacity: r.sign < 0 ? 1 : 0.4 }}>
          <path d="M 290 330 L 360 330 L 350 344 L 300 344 Z" fill="#5eead4"/>
          <rect x="323" y="312" width="2" height="18" fill="#5eead4"/>
        </g>
        {/* arc */}
        {head !== 0 && (() => {
          const a = head * Math.PI / 180;
          const x2 = 80 + 40 * Math.cos(a), y2 = 220 - 40 * Math.sin(a);
          return <path d={`M 120 220 A 40 40 0 ${head > 0 ? '0 0' : '0 1'} ${x2} ${y2}`} fill="none" stroke="#ff7849" strokeWidth="2"/>;
        })()}
        <text x="130" y={head > 0 ? 205 : 240} fontSize="13" fill="#ff7849" fontFamily="JetBrains Mono" fontWeight="700">{Math.abs(head)}°</text>
      </svg>
      <div style={{ position: 'absolute', bottom: 130, left: 16, right: 16 }}>
        <div className="glass-dark p-4">
          <div className="row between"><span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>TILT YOUR GAZE</span><span className="mono" style={{ fontSize: 13, color: '#ffb37a' }}>{head > 0 ? 'UP' : head < 0 ? 'DOWN' : '—'} {Math.abs(head)}°</span></div>
          <input type="range" min="-30" max="30" value={head} onChange={e => setHead(+e.target.value)} className="dial" style={{ marginTop: 8 }}/>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
        <div className="row gap-2">
          {['elevation', 'depression'].map(k => (
            <Tappable key={k} onClick={() => pick(k)} className="glass flex-1" style={{ padding: 14, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>
              Angle of {k}
            </Tappable>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AnatomyMission, AnglesMission, DecoderMission, IdentityMission, ProofMission, SightMission });
