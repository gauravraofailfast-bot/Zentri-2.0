import { useState } from 'react'
import { OnboardingScene } from './scenes/Onboarding'
import { JourneyScene } from './scenes/Journey'
import { CampOverlay } from './scenes/CampOverlay'
import { SkyOverlay } from './scenes/SkyOverlay'

type Scene = 'onboarding' | 'journey'
type Overlay = 'none' | 'camp' | 'sky'

const DEFAULT_CONFIDENCE = 62
const DEFAULT_STREAK = 7

export default function App() {
  const [scene, setScene] = useState<Scene>('onboarding')
  const [overlay, setOverlay] = useState<Overlay>('none')
  const [playerName, setPlayerName] = useState('Explorer')
  const [confidence] = useState(DEFAULT_CONFIDENCE)
  const [streak] = useState(DEFAULT_STREAK)
  const [completedConceptIds, setCompletedConceptIds] = useState<string[]>([])
  const [completedLandmarkCount, setCompletedLandmarkCount] = useState(0)

  function handleOnboardingDone({ name }: { name: string; intent: string }) {
    setPlayerName(name)
    setScene('journey')
  }

  // Journey passes completedIds up when a mechanic finishes
  // We track them here for Camp/Sky overlays
  function handleLandmarkComplete(conceptId: string) {
    setCompletedConceptIds(prev =>
      prev.includes(conceptId) ? prev : [...prev, conceptId]
    )
    setCompletedLandmarkCount(n => n + 1)
  }

  return (
    <>
      {scene === 'onboarding' && (
        <OnboardingScene onDone={handleOnboardingDone}/>
      )}

      {scene === 'journey' && (
        <div className="screen" style={{ position: 'relative' }}>
          <JourneyScene
            playerName={playerName}
            onCamp={() => setOverlay('camp')}
            onSky={() => setOverlay('sky')}
            onLandmarkComplete={handleLandmarkComplete}
          />

          {overlay === 'camp' && (
            <CampOverlay
              playerName={playerName}
              confidence={confidence}
              streak={streak}
              completedCount={completedLandmarkCount}
              totalCount={5}
              onResume={() => setOverlay('none')}
            />
          )}

          {overlay === 'sky' && (
            <SkyOverlay
              confidence={confidence}
              streak={streak}
              completedConceptIds={completedConceptIds}
              onClose={() => setOverlay('none')}
            />
          )}
        </div>
      )}
    </>
  )
}
