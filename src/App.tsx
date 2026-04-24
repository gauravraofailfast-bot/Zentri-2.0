import { useState } from 'react'
import { OnboardingScene } from './scenes/Onboarding'
import { LobbyScene, type Player, type Progress } from './scenes/Lobby'
import { WorldScene } from './scenes/World'
import { ProgressScene } from './scenes/Progress'

type Scene = 'onboarding' | 'lobby' | 'world' | 'progress' | 'raid'

const DEFAULT_PROGRESS: Progress = {
  confidence: 62,
  streak: 7,
  mission: 3,
  totalMissions: 7,
}

export default function App() {
  const [scene, setScene] = useState<Scene>('onboarding')
  const [player, setPlayer] = useState<Player>({ name: 'Gaurav', intent: 'concept' })
  const [progress] = useState<Progress>(DEFAULT_PROGRESS)

  function handleNav(id: 'home' | 'world' | 'raid' | 'progress') {
    const map: Record<string, Scene> = { home: 'lobby', world: 'world', raid: 'raid', progress: 'progress' }
    setScene(map[id] as Scene)
  }

  return (
    <>
      {scene === 'onboarding' && (
        <OnboardingScene
          onDone={({ name, intent }) => {
            setPlayer({ name, intent })
            setScene('lobby')
          }}
        />
      )}

      {scene === 'lobby' && (
        <LobbyScene
          player={player}
          progress={progress}
          onNav={handleNav}
          onEnterWorld={() => setScene('world')}
          onMultiplayer={() => setScene('raid')}
        />
      )}

      {scene === 'world' && (
        <WorldScene
          onBack={() => setScene('lobby')}
          onNav={handleNav}
        />
      )}

      {scene === 'progress' && (
        <ProgressScene
          onBack={() => setScene('lobby')}
          onNav={handleNav}
          confidence={progress.confidence}
          streak={progress.streak}
        />
      )}

      {scene === 'raid' && (
        <LobbyScene
          player={player}
          progress={progress}
          onNav={handleNav}
          onEnterWorld={() => setScene('world')}
          onMultiplayer={() => setScene('lobby')}
        />
      )}
    </>
  )
}
