import { useEffect, useState } from 'react'
import { ChatHeader } from './components/ChatHeader'
import { Composer } from './components/Composer'
import { MessageList } from './components/MessageList'
import { SettingsDrawer } from './components/SettingsDrawer'
import { useChatStore } from './store/chatStore'
import type { LeelaSettings } from '../../shared/types'

export function App() {
  const [settings, setSettings] = useState<LeelaSettings | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { draft, isListening, messages, sendMessage, setDraft, toggleListening } = useChatStore()

  useEffect(() => {
    void window.leela.getSettings().then(setSettings)
  }, [])

  async function handleSave(nextSettings: LeelaSettings) {
    const updated = await window.leela.setSettings(nextSettings)
    setSettings(updated)
  }

  if (!settings) {
    return (
      <main className="shell">
        <section className="panel loading-panel">Waking Leela up...</section>
      </main>
    )
  }

  return (
    <main className="shell">
      <section className="panel">
        <ChatHeader settings={settings} onOpenSettings={() => setSettingsOpen(true)} />

        <div className="status-row">
          <article className="status-pill">
            <span>Voice</span>
            <strong>{settings.speechEnabled ? 'Ready' : 'Muted'}</strong>
          </article>
          <article className="status-pill">
            <span>Mode</span>
            <strong>{settings.voiceInputMode}</strong>
          </article>
          <article className="status-pill">
            <span>Nudges</span>
            <strong>Every {settings.proactiveFrequency} min</strong>
          </article>
        </div>

        <MessageList messages={messages} />

        <Composer
          draft={draft}
          isListening={isListening}
          speechEnabled={settings.speechEnabled}
          onDraftChange={setDraft}
          onSend={sendMessage}
          onToggleListening={toggleListening}
        />
      </section>

      <SettingsDrawer
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSave}
      />
    </main>
  )
}
