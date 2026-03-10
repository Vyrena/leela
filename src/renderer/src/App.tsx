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
  const {
    appendChunk,
    completeStream,
    draft,
    error,
    failStream,
    hydrate,
    isListening,
    isSending,
    messages,
    sendMessage,
    setDraft,
    startStream,
    toggleListening
  } = useChatStore()

  useEffect(() => {
    void window.leela.getSettings().then(setSettings)
    void window.leela.getConversation().then(hydrate)
    const unsubscribers = [
      window.leela.onChatStreamStart(startStream),
      window.leela.onChatStreamChunk(appendChunk),
      window.leela.onChatStreamComplete(completeStream),
      window.leela.onChatStreamError(failStream)
    ]

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe()
      }
    }
  }, [appendChunk, completeStream, failStream, hydrate, startStream])

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
            <span>Model</span>
            <strong>{settings.openRouterModel.split('/').pop()}</strong>
          </article>
          <article className="status-pill">
            <span>Nudges</span>
            <strong>Every {settings.proactiveFrequency} min</strong>
          </article>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <MessageList messages={messages} />

        <Composer
          draft={draft}
          isListening={isListening}
          isSending={isSending}
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
