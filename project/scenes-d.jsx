// scenes-d — World selection (2 chapters now), expanded World maps, new mission engines

// ———— WORLD PICKER (entered from "World" tab or lobby) ————
function WorldsScene({ onBack, onNav, onPickWorld, progress }) {
  const worlds = [
    { id: 'ch8', num: '08', title: 'World of Triangles', sub: 'Introduction to Trigonometry', missions: 7, done: progress.ch8 || 0, color: '#ff7849', bg: 'linear-gradient(135deg, #3b2a62 0%, #8a3a5e 55%, #ff7849 100%)' },
    { id: 'ch9', num: '09', title: 'Kingdom of Towers', sub: 'Applications · Heights & Distances', missions: 6, done: progress.ch9 || 0, color: '#5eead4', bg: 'linear-gradient(135deg, #0a1028 0%, #1a1f4d 50%, #2dd4bf 100%)' },
  ];
  return (
    <div className="screen sky-night">
      <Stars count={60}/>
      <StatusBar/>
      <div style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Tappable onClick={onBack} className="glass" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chev-left" size={18}/></Tappable>
        <div className="flex-1">
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted-2)' }}>CLASS 10 · MATH</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Your Worlds</div>
        </div>
      </div>
      <div className="scroll scene-enter" style={{ height: '100%', paddingTop: 110, paddingBottom: 110 }}>
        <div className="col gap-4" style={{ padding: '0 16px' }}>
          {worlds.map(w => (
            <Tappable key={w.id} onClick={() => onPickWorld(w.id)} style={{ display: 'block', borderRadius: 28, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
              <div style={{ position: 'relative', height: 220, background: w.bg, overflow: 'hidden' }}>
                <svg viewBox="0 0 360 140" style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                  <path d="M0 100 L40 80 L70 90 L100 60 L130 80 L160 50
                    L 170 50 L 172 18 L 176 15 L 176 6 L 180 3 L 184 6 L 184 15 L 188 18 L 188 50 L 190 50
                    L 220 80 L 260 60 L 300 85 L 340 70 L 360 80 L 360 140 L 0 140Z" fill="#0a0416" opacity="0.85"/>
                </svg>
                <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.75)' }}>CHAPTER {w.num}</span>
                  <span className="chip">{w.done} / {w.missions}</span>
                </div>
                <div style={{ position: 'absolute', bottom: 14, left: 18, right: 18 }}>
                  <div className="h-title" style={{ fontSize: 22 }}>{w.title}</div>
                  <div className="body" style={{ fontSize: 13, marginTop: 2 }}>{w.sub}</div>
                </div>
              </div>
              <div className="p-4 row between" style={{ background: 'rgba(10,12,30,0.9)' }}>
                <div className="meter" style={{ flex: 1, marginRight: 14 }}>
                  <div className="fill" style={{ width: (w.done / w.missions * 100) + '%', background: `linear-gradient(90deg, ${w.color}, ${w.color}aa)` }}/>
                </div>
                <div className="row gap-1" style={{ color: w.color, fontWeight: 600, fontSize: 13 }}>
                  Enter <Icon name="chev-right" size={14}/>
                </div>
              </div>
            </Tappable>
          ))}
        </div>
      </div>
      <TabBar active="world" onNav={onNav}/>
    </div>
  );
}

// ———— EXPANDED WORLD MAP — takes chapter id ————
function WorldMap({ chapter, onBack, onEnterMission, onNav }) {
  const ch8 = [
    { id: 'c8-1', x: 70, y: 780, title: 'Triangle Anatomy', sub: 'Name the sides', done: true, kind: 'anatomy' },
    { id: 'c8-2', x: 200, y: 690, title: 'Ratio Workshop', sub: 'sin, cos, tan — first hits', done: true, kind: 'archer-intro' },
    { id: 'c8-3', x: 120, y: 595, title: 'Archer\u2019s Angle', sub: 'Aim to learn the ratios', active: true, kind: 'archer' },
    { id: 'c8-4', x: 270, y: 500, title: 'Angles Arena', sub: '30° · 45° · 60° · 0° · 90°', kind: 'angles' },
    { id: 'c8-5', x: 140, y: 400, title: 'Ratio Decoder', sub: 'Know one, find all six', kind: 'decoder' },
    { id: 'c8-6', x: 260, y: 305, title: 'Identity Forge', sub: 'sin²θ + cos²θ = 1', kind: 'identity' },
    { id: 'c8-7', x: 130, y: 205, title: 'Proof Duel', sub: 'Rearrange to equal', kind: 'proof' },
    { id: 'c8-8', x: 200, y: 95, title: 'The Dusk Minar', sub: 'Boss · Any ratio, any angle', boss: true, kind: 'boss-trig' },
  ];
  const ch9 = [
    { id: 'c9-1', x: 80, y: 720, title: 'Line of Sight', sub: 'Elevation vs depression', kind: 'sight', active: true },
    { id: 'c9-2', x: 210, y: 620, title: 'Lighthouse', sub: 'One angle, one distance', kind: 'light' },
    { id: 'c9-3', x: 130, y: 510, title: 'Flagstaff', sub: 'Two elevations, one building', kind: 'flag' },
    { id: 'c9-4', x: 260, y: 400, title: 'Sun\u2019s Shadow', sub: 'Shadow lengthens as sun drops', kind: 'shadow' },
    { id: 'c9-5', x: 140, y: 280, title: 'Twin Towers', sub: 'Depression to top & bottom', kind: 'twin' },
    { id: 'c9-6', x: 210, y: 130, title: 'The River', sub: 'Boss · Bridge between banks', boss: true, kind: 'river' },
  ];
  const missions = chapter === 'ch9' ? ch9 : ch8;
  const mapH = chapter === 'ch9' ? 820 : 880;
  const title = chapter === 'ch9' ? 'Kingdom of Towers' : 'World of Triangles';
  const ch = chapter === 'ch9' ? 'CH 9 · APPLICATIONS' : 'CH 8 · TRIGONOMETRY';
  const done = missions.filter(m => m.done).length;

  // auto-unlock in order
  const unlocked = (i) => i === 0 || missions[i - 1].done || missions[i - 1].active || i <= (chapter === 'ch9' ? 1 : 3);

  const pathD = missions.reduce((acc, m, i) =>
    acc + (i === 0 ? `M ${m.x} ${m.y}` : ` L ${m.x} ${m.y}`), '');

  return (
    <div className="screen sky-night">
      <Stars count={70}/>
      <StatusBar/>

      <div style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Tappable onClick={onBack} className="glass" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chev-left" size={18}/></Tappable>
        <div className="flex-1">
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted-2)' }}>{ch}</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
        </div>
        <div className="chip chip-ember">{done} / {missions.length}</div>
      </div>

      <div className="scroll scene-enter" style={{ height: '100%', paddingTop: 110, paddingBottom: 110 }}>
        <div style={{ position: 'relative', width: '100%', height: mapH }}>
          <svg viewBox={`0 0 360 ${mapH}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="pg" x1="0" x2="0" y1="1" y2="0">
                <stop offset="0" stopColor={chapter === 'ch9' ? '#5eead4' : '#ff7849'}/>
                <stop offset="1" stopColor="#5eead4" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
            <path d={pathD} fill="none" stroke="url(#pg)" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round"/>
            {missions.filter(m => m.active).map(m => (
              <circle key={m.id+'g'} cx={m.x} cy={m.y} r="40" fill="none" stroke={chapter === 'ch9' ? '#5eead4' : '#ff7849'} strokeOpacity="0.3" strokeWidth="1">
                <animate attributeName="r" from="30" to="50" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="stroke-opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite"/>
              </circle>
            ))}
          </svg>
          {missions.map((m, i) => {
            const mm = { ...m, locked: !unlocked(i) && !m.done && !m.active };
            return <MissionNode key={m.id} m={mm} onTap={() => !mm.locked && onEnterMission(mm)}/>;
          })}
          {/* Top silhouette */}
          <svg viewBox="0 0 360 120" style={{ position: 'absolute', top: 0, width: '100%', height: 120, opacity: 0.4, pointerEvents: 'none' }}>
            {chapter === 'ch9' ? (
              <g fill="#1a1432">
                <rect x="140" y="50" width="20" height="70"/>
                <rect x="155" y="30" width="30" height="90"/>
                <rect x="200" y="60" width="24" height="60"/>
              </g>
            ) : (
              <path d="M170 120 L170 60 L174 55 L174 30 L178 26 L178 12 L180 8 L182 12 L182 26 L186 30 L186 55 L190 60 L190 120 Z" fill="#1a1432"/>
            )}
          </svg>
        </div>
      </div>

      <TabBar active="world" onNav={onNav}/>
    </div>
  );
}

Object.assign(window, { WorldsScene, WorldMap });
