import { useState, useEffect, useRef, useCallback } from 'react'
import { Stars, DuskSkyline, Orb, Icon, Tappable } from '../ui/Shell'
import { getMechanic } from '../mechanics'
import { loadClass10MathManifest } from '../lib/manifestLoader'
import { saveProgress } from '../lib/idb'
import type { CurriculumManifest, Landmark, Biome } from '../types'

// ─── Constants ────────────────────────────────────────
const LANDMARK_SPACING = 640   // px between each landmark in the scroll world
const ACTIVATION_RADIUS = 130  // px from viewport centre to show "tap to enter" beacon
const ANON_USER_ID = 'anon-player'

// ─── Biome visual config ───────────────────────────────
interface BiomeStyle {
  gradient: string
  accent: string
  label: string
}

const BIOME_STYLES: Record<string, BiomeStyle> = {
  'pink-city':        { gradient: 'linear-gradient(180deg,#0a1028 0%,#3b2a62 55%,#8a3a5e 100%)',   accent: 'var(--ember)',  label: 'Pink City · Jaipur'          },
  'coastal-dusk':     { gradient: 'linear-gradient(180deg,#0a1028 0%,#0e2a4a 55%,#1a6a6a 100%)',   accent: 'var(--teal)',   label: 'Coastal Dusk · Goa'          },
  'valley-lanterns':  { gradient: 'linear-gradient(180deg,#05061a 0%,#1a1f4d 55%,#2a1a5e 100%)',   accent: 'var(--violet)', label: 'Valley of Lanterns · Pahalgam'},
  'golden-water':     { gradient: 'linear-gradient(180deg,#0a0f24 0%,#2a1f0a 55%,#6a4a1a 100%)',   accent: 'var(--gold)',   label: 'Golden Water · Amritsar'     },
  'bodhi-grove':      { gradient: 'linear-gradient(180deg,#050f0a 0%,#0a2a1a 55%,#1a4a2e 100%)',   accent: '#5eead4',       label: 'Bodhi Grove · Nalanda'       },
}

// ─── Companion dialogue lines per biome ───────────────
const COMPANION_LINES: Record<string, string[]> = {
  'pink-city':        ['Hawa Mahal catches wind in every lattice. Find the angle it makes.', 'The Jantar Mantar was built to read sky angles. Now you will too.'],
  'coastal-dusk':     ['The sea cliff drops at an angle. Can you measure how far below?', 'Seabirds glide at 30°. Follow their descent.'],
  'valley-lanterns':  ['Lanterns hang from peaks you cannot touch. Estimate their height.', 'The valley mist hides distances — but angles reveal everything.'],
  'golden-water':     ['Gold reflects at the same angle it arrives. Name it.', 'The Harmandir Sahib casts a shadow across still water. Measure it.'],
  'bodhi-grove':      ['All the triangles come together here. What have you learned?', 'The Bodhi tree grew without measuring. You are not so lucky.'],
}

// ─── Flat landmark list helper ─────────────────────────
interface FlatLandmark { landmark: Landmark; biome: Biome; index: number }

function flattenLandmarks(manifest: CurriculumManifest): FlatLandmark[] {
  const result: FlatLandmark[] = []
  let i = 0
  for (const biome of manifest.biomes) {
    for (const lm of biome.landmarks ?? []) {
      result.push({ landmark: lm, biome, index: i++ })
    }
  }
  return result
}

// ─── Props ─────────────────────────────────────────────
interface Props {
  playerName: string
  onCamp: () => void
  onSky: () => void
  onLandmarkComplete?: (conceptId: string) => void
}

// ─── MechanicOverlay ──────────────────────────────────
interface OverlayProps {
  flat: FlatLandmark
  onComplete: (result: { passed: boolean; score?: number }) => void
  onSkip: () => void
}

function MechanicOverlay({ flat, onComplete, onSkip }: OverlayProps) {
  const { landmark, biome } = flat
  const Mechanic = getMechanic(landmark.mechanic)
  const biomeStyle = BIOME_STYLES[biome.id] ?? BIOME_STYLES['pink-city']

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(5,7,15,0.88)',
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: biomeStyle.accent }}>
            {biome.title.toUpperCase()} · {biome.location.toUpperCase()}
          </div>
          <div style={{ fontWeight: 700, fontSize: 17, marginTop: 2 }}>{landmark.name}</div>
        </div>
        <Tappable onClick={onSkip} className="glass" style={{
          width: 36, height: 36, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="close" size={16}/>
        </Tappable>
      </div>

      {/* Companion dialogue */}
      <div style={{ margin: '0 20px 12px' }}>
        <div className="glass" style={{ padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Orb size={28}/>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', flex: 1, lineHeight: 1.4 }}>
            {COMPANION_LINES[biome.id]?.[0] ?? 'This challenge tests your angle knowledge.'}
          </div>
        </div>
      </div>

      {/* Mechanic */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px' }}>
        {Mechanic ? (
          <div className="glass" style={{ borderRadius: 20, padding: 4 }}>
            <Mechanic
              config={landmark.mechanic_config}
              onComplete={onComplete}
            />
          </div>
        ) : (
          <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: 14 }}>Mechanic "{landmark.mechanic}" coming soon.</div>
            <Tappable onClick={() => onComplete({ passed: true })} className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              Continue Journey
            </Tappable>
          </div>
        )}
      </div>

      {/* Skip */}
      <div style={{ padding: '8px 20px 20px', flexShrink: 0, textAlign: 'center' }}>
        <Tappable onClick={onSkip} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--f-mono)' }}>
          skip for now
        </Tappable>
      </div>
    </div>
  )
}

// ─── LandmarkNode ─────────────────────────────────────
interface NodeProps {
  flat: FlatLandmark
  yPos: number
  scrollY: number
  viewportH: number
  done: boolean
  onTap: () => void
}

function LandmarkNode({ flat, yPos, scrollY, viewportH, done, onTap }: NodeProps) {
  const { landmark, biome } = flat
  const biomeStyle = BIOME_STYLES[biome.id] ?? BIOME_STYLES['pink-city']
  const distFromCentre = Math.abs((yPos - scrollY) - viewportH / 2)
  const isNear = distFromCentre < ACTIVATION_RADIUS
  const zig = flat.index % 2 === 0   // alternate left/right

  return (
    <div style={{
      position: 'absolute',
      top: yPos,
      left: zig ? '30%' : '72%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      width: 200,
    }}>
      {/* Connector line from path */}
      <div style={{
        width: 1,
        height: 40,
        background: done
          ? 'linear-gradient(180deg, transparent, var(--teal))'
          : 'linear-gradient(180deg, transparent, rgba(255,255,255,0.15))',
      }}/>

      {/* Beacon orb */}
      <Tappable onClick={onTap} style={{ position: 'relative' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 26,
          background: done
            ? 'linear-gradient(180deg,#5eead4,#2dd4bf)'
            : isNear
            ? `linear-gradient(180deg,${biomeStyle.accent},${biomeStyle.accent}88)`
            : 'rgba(255,255,255,0.08)',
          border: isNear && !done ? `2px solid ${biomeStyle.accent}` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: done
            ? '0 0 24px rgba(94,234,212,0.5), inset 0 2px 4px rgba(255,255,255,0.3)'
            : isNear
            ? `0 0 0 3px ${biomeStyle.accent}33, 0 0 40px ${biomeStyle.accent}44`
            : 'inset 0 0 0 1px rgba(255,255,255,0.12)',
          transition: 'all 0.3s ease',
          flexShrink: 0,
        }}>
          {done
            ? <Icon name="check" size={22} color="#042f2e"/>
            : isNear
            ? <Icon name="play" size={18} color="#fff"/>
            : <div style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.4)'}}/>
          }
        </div>

        {/* Pulse ring when near */}
        {isNear && !done && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 52, height: 52, borderRadius: 26,
            border: `2px solid ${biomeStyle.accent}`,
            animation: 'pulse 2s ease-out infinite',
            pointerEvents: 'none',
          }}/>
        )}
      </Tappable>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--teal)' : isNear ? '#fff' : 'rgba(255,255,255,0.55)' }}>
          {landmark.name}
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 2 }}>
          {landmark.mechanic}
        </div>
      </div>

      {/* Tap to enter prompt */}
      {isNear && !done && (
        <div className="chip" style={{ fontSize: 10, background: `${biomeStyle.accent}22`, borderColor: `${biomeStyle.accent}55`, color: biomeStyle.accent, animation: 'fadeIn 0.4s ease' }}>
          tap to enter
        </div>
      )}
    </div>
  )
}

// ─── BiomeTransitionBanner ────────────────────────────
function BiomeBanner({ biome, scrollY, bannerY, viewportH }: { biome: Biome; scrollY: number; bannerY: number; viewportH: number }) {
  const dist = Math.abs((bannerY - scrollY) - viewportH / 2)
  if (dist > 260) return null
  const opacity = Math.max(0, 1 - dist / 260)
  const style = BIOME_STYLES[biome.id] ?? BIOME_STYLES['pink-city']

  return (
    <div style={{
      position: 'absolute', top: bannerY, left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      opacity, transition: 'opacity 0.1s',
    }}>
      <div style={{ width: 40, height: 1, background: `linear-gradient(90deg,transparent,${style.accent},transparent)` }}/>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: style.accent }}>{style.label.toUpperCase()}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', maxWidth: 220, textAlign: 'center' }}>{biome.description}</div>
    </div>
  )
}

// ─── JourneyScene ─────────────────────────────────────
export function JourneyScene({ playerName, onCamp, onSky, onLandmarkComplete }: Props) {
  const [manifest, setManifest] = useState<CurriculumManifest | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [viewportH, setViewportH] = useState(700)
  const [activeLandmark, setActiveLandmark] = useState<FlatLandmark | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [showSuccess, setShowSuccess] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadClass10MathManifest().then(setManifest)
  }, [])

  useEffect(() => {
    const el = screenRef.current
    if (!el) return
    setViewportH(el.clientHeight)
    const obs = new ResizeObserver(() => setViewportH(el.clientHeight))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const allFlat = manifest ? flattenLandmarks(manifest) : []
  const totalHeight = Math.max(allFlat.length * LANDMARK_SPACING + 600, 2400)

  // Biome boundaries (evenly divide totalHeight)
  const biomes = manifest?.biomes ?? []
  const biomeBannerYs = biomes.map((_, i) => Math.round((i / biomes.length) * totalHeight) + 120)

  // Current biome index
  const biomeIndex = biomes.length
    ? Math.min(Math.floor((scrollY / totalHeight) * biomes.length), biomes.length - 1)
    : 0
  const currentBiome = biomes[biomeIndex] ?? biomes[0]
  const biomeStyle = currentBiome ? (BIOME_STYLES[currentBiome.id] ?? BIOME_STYLES['pink-city']) : BIOME_STYLES['pink-city']

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop)
  }, [])

  function handleMechanicComplete(result: { passed: boolean; score?: number }) {
    if (!activeLandmark) return
    const { landmark } = activeLandmark

    saveProgress(ANON_USER_ID, landmark.concept_id, 'class10-math', result.passed ? 1 : 0, result.passed ? 1 : 0, 1)
    setCompletedIds(prev => new Set([...prev, landmark.id]))
    onLandmarkComplete?.(landmark.concept_id)

    const successMsg = result.passed
      ? result.score !== undefined && result.score >= 90 ? 'Perfect! Confidence +6' : 'You got it! Confidence +4'
      : 'Close! Confidence +1'
    setShowSuccess(successMsg)
    setActiveLandmark(null)

    // Auto-advance to next landmark
    const nextFlat = allFlat[activeLandmark.index + 1]
    if (nextFlat && scrollRef.current) {
      const targetScroll = nextFlat.index * LANDMARK_SPACING + 80
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: targetScroll, behavior: 'smooth' })
      }, 600)
    }

    setTimeout(() => setShowSuccess(null), 2400)
  }

  const loadingScreen = !manifest

  return (
    <div ref={screenRef} className="screen" style={{
      background: biomeStyle.gradient,
      transition: 'background 1.8s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Layer 0: Stars parallax ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        transform: `translateY(${-scrollY * 0.08}px)`,
        zIndex: 1,
      }}>
        <Stars count={55} topBias={0.65}/>
      </div>

      {/* ── Layer 1: Dusk skyline parallax ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none',
        transform: `translateY(${scrollY * 0.04}px)`,
        zIndex: 2,
      }}>
        <DuskSkyline height={150} opacity={0.45}/>
      </div>

      {/* ── Layer 2: Kavya orb (drifts slightly with scroll) ── */}
      {!activeLandmark && (
        <div style={{
          position: 'absolute',
          left: '50%', top: '46%',
          transform: `translate(-50%, calc(-50% + ${scrollY * 0.01}px))`,
          zIndex: 15, pointerEvents: 'none',
          opacity: loadingScreen ? 0 : 1,
          transition: 'opacity 0.6s',
        }}>
          <Orb size={50}/>
          <div className="mono" style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted-2)', marginTop: 5 }}>
            {playerName}
          </div>
        </div>
      )}

      {/* ── HUD ── */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Tappable onClick={onCamp} className="glass" style={{
          padding: '7px 14px', borderRadius: 20,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="home" size={15}/>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Camp</span>
        </Tappable>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentBiome && (
            <div className="chip" style={{ fontSize: 10, color: biomeStyle.accent, borderColor: `${biomeStyle.accent}44` }}>
              {biomeStyle.label}
            </div>
          )}
          <Tappable onClick={onSky} style={{ background: 'none', border: 'none', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="stars" size={20} color="rgba(255,255,255,0.65)"/>
          </Tappable>
        </div>
      </div>

      {/* ── Scrollable world ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          position: 'absolute', inset: 0, zIndex: 10,
          overflowY: activeLandmark ? 'hidden' : 'scroll',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`
          [data-scroll-hide]::-webkit-scrollbar { display: none; }
          @keyframes pulse {
            0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.7; }
            100% { transform: translate(-50%,-50%) scale(2);   opacity: 0;   }
          }
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to   { opacity: 1; transform: translateY(0);   }
          }
        `}</style>
        <div data-scroll-hide="" style={{ height: totalHeight, position: 'relative' }}>

          {/* Journey path SVG */}
          <svg
            viewBox={`0 0 402 ${totalHeight}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: totalHeight, pointerEvents: 'none', zIndex: 0 }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pathFade" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0"   stopColor="#ff7849" stopOpacity="0.6"/>
                <stop offset="0.4" stopColor="#a78bfa" stopOpacity="0.4"/>
                <stop offset="0.8" stopColor="#5eead4" stopOpacity="0.3"/>
                <stop offset="1"   stopColor="#5eead4" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            {/* Winding path through landmark positions */}
            {allFlat.length > 1 && (
              <polyline
                points={allFlat.map(f => {
                  const x = f.index % 2 === 0 ? 72 : 170
                  const y = f.index * LANDMARK_SPACING + 320
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="url(#pathFade)"
                strokeWidth="2"
                strokeDasharray="5 7"
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Biome transition banners */}
          {biomes.map((b, i) => (
            <BiomeBanner
              key={b.id}
              biome={b}
              scrollY={scrollY}
              bannerY={biomeBannerYs[i]}
              viewportH={viewportH}
            />
          ))}

          {/* Landmark nodes */}
          {allFlat.map(flat => (
            <LandmarkNode
              key={flat.landmark.id}
              flat={flat}
              yPos={flat.index * LANDMARK_SPACING + 280}
              scrollY={scrollY}
              viewportH={viewportH}
              done={completedIds.has(flat.landmark.id)}
              onTap={() => {
                if (!completedIds.has(flat.landmark.id)) {
                  setActiveLandmark(flat)
                }
              }}
            />
          ))}

          {/* Journey end */}
          {allFlat.length > 0 && (
            <div style={{
              position: 'absolute',
              top: (allFlat.length) * LANDMARK_SPACING + 380,
              left: 0, right: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              opacity: 0.5,
            }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--muted-2)' }}>MORE WORLDS COMING</div>
              <Icon name="globe" size={20} color="rgba(255,255,255,0.3)"/>
            </div>
          )}

          {/* Loading placeholder */}
          {loadingScreen && (
            <div style={{
              position: 'absolute', top: '40%', left: 0, right: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <Orb size={60}/>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.2em' }}>LOADING WORLD…</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mechanic overlay ── */}
      {activeLandmark && (
        <MechanicOverlay
          flat={activeLandmark}
          onComplete={handleMechanicComplete}
          onSkip={() => setActiveLandmark(null)}
        />
      )}

      {/* ── Success toast ── */}
      {showSuccess && (
        <div style={{
          position: 'absolute', bottom: 100, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          animation: 'slideUp 0.3s ease',
        }}>
          <div className="chip chip-teal" style={{ fontSize: 13, padding: '8px 18px', whiteSpace: 'nowrap' }}>
            <Icon name="spark" size={14}/> {showSuccess}
          </div>
        </div>
      )}
    </div>
  )
}
