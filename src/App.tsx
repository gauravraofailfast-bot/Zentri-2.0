import { useEffect, useState } from 'react'

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-dusk-900 via-dusk-800 to-dusk-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ember-500 mb-4">
          Zentri — The Dusk Caravan
        </h1>
        <p className="text-dusk-300 mb-6 text-lg">
          Foundation initialized. Loading journey...
        </p>

        <div className="flex gap-4 justify-center mb-8">
          <div className={`px-4 py-2 rounded backdrop-blur ${isOnline ? 'bg-teal-500/20 text-teal-300' : 'bg-ember-500/20 text-ember-300'}`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </div>
          <div className="px-4 py-2 rounded backdrop-blur bg-dusk-700/50 text-dusk-200">
            PWA Ready
          </div>
        </div>

        <div className="space-y-2 text-sm text-dusk-400 max-w-md">
          <p>✓ Vite + React + TypeScript</p>
          <p>✓ Supabase connected</p>
          <p>✓ Service Worker ready</p>
          <p>✓ Offline-first architecture</p>
        </div>
      </div>
    </div>
  )
}
