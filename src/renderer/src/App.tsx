import { useEffect, useState } from 'react'
import type { LeelaSettings } from '../../shared/types'

export function App() {
  const [settings, setSettings] = useState<LeelaSettings | null>(null)

  useEffect(() => {
    void window.leela.getSettings().then(setSettings)
  }, [])

  return (
    <main className="shell">
      <section className="panel">
        <div className="eyebrow">Desktop AI Assistant</div>
        <h1>{settings?.assistantName ?? 'Leela'}</h1>
        <p className="lede">
          Witty, voice-ready, and quietly waiting in your tray.
        </p>

        <div className="card-grid">
          <article className="card">
            <span>Personality</span>
            <strong>{settings?.personality ?? 'Loading...'}</strong>
          </article>
          <article className="card">
            <span>Speech</span>
            <strong>{settings?.speechEnabled ? 'Enabled' : 'Disabled'}</strong>
          </article>
          <article className="card">
            <span>Hotkey</span>
            <strong>{settings?.globalHotkey ?? 'Loading...'}</strong>
          </article>
        </div>
      </section>
    </main>
  )
}
