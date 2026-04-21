// Shared UI primitives + shell
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function StatusBar({ light = true }) {
  const color = light ? '#fff' : '#000';
  return (
    <div className="statusbar" style={{ color }}>
      <span style={{ fontWeight: 700 }}>9:41</span>
      <div className="icons">
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12">
          <rect x="0" y="7" width="3" height="5" rx="0.6" fill={color}/>
          <rect x="5" y="4.5" width="3" height="7.5" rx="0.6" fill={color}/>
          <rect x="10" y="2" width="3" height="10" rx="0.6" fill={color}/>
          <rect x="15" y="0" width="3" height="12" rx="0.6" fill={color}/>
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 3C10.2 3 12.3 3.8 13.8 5.2L15 4C13.2 2.3 10.7 1.2 8 1.2C5.3 1.2 2.8 2.3 1 4L2.2 5.2C3.7 3.8 5.8 3 8 3Z" fill={color}/>
          <path d="M8 6.5C9.3 6.5 10.5 7 11.4 7.8L12.4 6.8C11.2 5.7 9.7 5 8 5C6.3 5 4.8 5.7 3.6 6.8L4.6 7.8C5.5 7 6.7 6.5 8 6.5Z" fill={color}/>
          <circle cx="8" cy="10" r="1.3" fill={color}/>
        </svg>
        {/* battery */}
        <svg width="26" height="12" viewBox="0 0 26 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke={color} strokeOpacity="0.4" fill="none"/>
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill={color}/>
          <rect x="23" y="4" width="2" height="4" rx="0.5" fill={color} opacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

// Skyline SVG — dusk with minar silhouette (Qutub reference, but abstract)
function DuskSkyline({ height = 180, opacity = 1 }) {
  return (
    <svg className="skyline" viewBox="0 0 402 200" preserveAspectRatio="none"
      style={{ height, opacity, filter: 'drop-shadow(0 -10px 30px rgba(138,58,94,0.3))' }}>
      <defs>
        <linearGradient id="sk" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0a0f24" stopOpacity="0.95"/>
          <stop offset="1" stopColor="#05070f" stopOpacity="1"/>
        </linearGradient>
      </defs>
      {/* far layer */}
      <path d="M0 140 L20 130 L30 132 L40 120 L55 125 L70 118 L90 124 L110 110 L130 116 L150 105 L175 112 L195 100 L215 108 L240 95 L265 105 L290 92 L310 100 L335 88 L360 98 L385 90 L402 95 L402 200 L0 200Z" fill="#1a1432" opacity="0.6"/>
      {/* mid layer */}
      <path d="M0 160 L25 150 L40 155 L60 145 L85 152 L105 140 L125 148 L150 135 L170 142 L195 130 L220 138 L245 125 L270 135 L295 122 L320 130 L345 118 L370 128 L402 120 L402 200 L0 200Z" fill="#0a0f24" opacity="0.85"/>
      {/* foreground — with a minar */}
      <path d="M0 180 L30 175 L50 178 L75 170
        L 90 170 L 93 140 L 97 138 L 97 125 L 101 122 L 101 115 L 105 115 L 105 122 L 109 125 L 109 138 L 113 140 L 113 170
        L 130 170 L 150 175 L 175 168 L 200 173 L 225 165 L 250 172 L 275 162 L 300 170 L 325 160 L 350 168 L 375 158 L 402 163 L 402 200 L 0 200Z" fill="url(#sk)"/>
      {/* minar top glow */}
      <circle cx="103" cy="112" r="3" fill="#ffd166" opacity="0.8"/>
    </svg>
  );
}

function Stars({ count = 30, topBias = 0.6 }) {
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100 * topBias,
      s: Math.random() * 1.5 + 0.5,
      d: Math.random() * 3,
    })), [count, topBias]);
  return (
    <>
      {stars.map((s, i) => (
        <div key={i} className="star" style={{
          left: s.x + '%', top: s.y + '%',
          width: s.s + 'px', height: s.s + 'px',
          animationDelay: s.d + 's',
        }}/>
      ))}
    </>
  );
}

function Orb({ size = 80, style = {} }) {
  return (
    <div className="orb" style={{ width: size, height: size, ...style }}>
      <div style={{
        position: 'absolute', top: '15%', left: '20%',
        width: '22%', height: '18%',
        background: 'rgba(255,255,255,0.7)',
        borderRadius: '50%',
        filter: 'blur(3px)',
      }}/>
    </div>
  );
}

function Icon({ name, size = 20, color = 'currentColor' }) {
  const s = size;
  const c = color;
  const sw = 1.8;
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home': return <svg {...common}><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z"/></svg>;
    case 'map': return <svg {...common}><path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z"/><path d="M9 3v16M15 5v16"/></svg>;
    case 'users': return <svg {...common}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="7" r="2.5"/><path d="M15 14c3 0 6 2 6 5"/></svg>;
    case 'stars': return <svg {...common}><path d="M12 3l2.3 5.6L20 9.6l-4 4 1 5.6-5-2.8-5 2.8 1-5.6-4-4 5.7-1L12 3z"/></svg>;
    case 'flame': return <svg {...common}><path d="M12 3s4 4 4 8a4 4 0 11-8 0c0-2 1-3 1-3s-2 1-2 4a5 5 0 0010 0c0-5-5-9-5-9z"/></svg>;
    case 'chev-right': return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chev-left': return <svg {...common}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chev-down': return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>;
    case 'play': return <svg {...common} fill={c}><path d="M7 4l13 8-13 8V4z"/></svg>;
    case 'pause': return <svg {...common}><rect x="6" y="4" width="4" height="16" rx="1" fill={c}/><rect x="14" y="4" width="4" height="16" rx="1" fill={c}/></svg>;
    case 'target': return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill={c}/></svg>;
    case 'spark': return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>;
    case 'check': return <svg {...common}><path d="M5 12l5 5 9-11"/></svg>;
    case 'lock': return <svg {...common}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 118 0v3"/></svg>;
    case 'bolt': return <svg {...common}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill={c}/></svg>;
    case 'hint': return <svg {...common}><path d="M12 3a6 6 0 00-4 10c1 1 1.5 2 1.5 3h5c0-1 .5-2 1.5-3a6 6 0 00-4-10z"/><path d="M10 19h4"/></svg>;
    case 'crown': return <svg {...common}><path d="M3 8l3 10h12l3-10-5 3-4-6-4 6-5-3z"/></svg>;
    case 'book': return <svg {...common}><path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4V4zM20 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8V4z"/></svg>;
    case 'angle': return <svg {...common}><path d="M4 20L20 20M4 20L16 6"/><path d="M9 20a4 4 0 003.5-2" /></svg>;
    case 'tower': return <svg {...common}><path d="M10 3v2l-2 1v2h8V6l-2-1V3M10 8v13M14 8v13M8 21h8"/></svg>;
    case 'heart': return <svg {...common}><path d="M12 21s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 11c0 5.5-7 10-7 10z"/></svg>;
    case 'close': return <svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'send': return <svg {...common}><path d="M3 11l18-8-8 18-2-8-8-2z"/></svg>;
    case 'globe': return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>;
    default: return null;
  }
}

// Tap feedback
function Tappable({ children, onClick, style = {}, className = '' }) {
  return (
    <button onClick={onClick} className={className} style={{
      background: 'none', border: 'none', padding: 0, color: 'inherit',
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      transition: 'transform .1s ease, opacity .2s',
      ...style,
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
    onMouseUp={e => e.currentTarget.style.transform = ''}
    onMouseLeave={e => e.currentTarget.style.transform = ''}
    onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
    onTouchEnd={e => e.currentTarget.style.transform = ''}
    >
      {children}
    </button>
  );
}

Object.assign(window, { StatusBar, DuskSkyline, Stars, Orb, Icon, Tappable });
