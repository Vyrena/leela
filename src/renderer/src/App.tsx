import { useEffect, useState } from 'react'
import { ChatHeader } from './components/ChatHeader'
import { Composer } from './components/Composer'
import { MessageList } from './components/MessageList'
import { SettingsDrawer } from './components/SettingsDrawer'
import { useChatStore } from './store/chatStore'
import { useVoiceStore } from './store/voiceStore'
import type { LeelaSettings } from '../../shared/types'

export function App() {
  const [settings, setSettings] = useState<LeelaSettings | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [voicePreviewMessage, setVoicePreviewMessage] = useState<string | null>(null)
  const {
    appendChunk,
    completeStream,
    draft,
    error,
    failStream,
    hydrate,
    isSending,
    messages,
    sendMessage,
    setDraft,
    startStream
  } = useChatStore()
  const { hydrate: hydrateVoice, previewSpeech, startListening, state: voiceState, stopListening } = useVoiceStore()

  useEffect(() => {
    void window.leela.getSettings().then(setSettings)
    void window.leela.getConversation().then(hydrate)
    void window.leela.getVoiceState().then(hydrateVoice)
    const unsubscribers = [
      window.leela.onChatStreamStart(startStream),
      window.leela.onChatStreamChunk(appendChunk),
      window.leela.onChatStreamComplete(completeStream),
      window.leela.onChatStreamError(failStream),
      window.leela.onVoiceState(hydrateVoice)
    ]

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe()
      }
    }
  }, [appendChunk, completeStream, failStream, hydrate, hydrateVoice, startStream])

  async function handleSave(nextSettings: LeelaSettings) {
    const updated = await window.leela.setSettings(nextSettings)
    setSettings(updated)
  }

  async function handleToggleListening() {
    if (voiceState.status === 'listening') {
      await stopListening()
      return
    }

    await startListening()
  }

  async function handlePreviewVoice() {
    try {
      const message = await previewSpeech()
      setVoicePreviewMessage(message)
    } catch (error) {
      setVoicePreviewMessage(error instanceof Error ? error.message : 'Unable to preview voice wiring.')
    }
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
            <strong>{settings.speechEnabled ? voiceState.status : 'Muted'}</strong>
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
          isListening={voiceState.status === 'listening'}
          isSending={isSending}
          voiceMessage={voiceState.message}
          speechEnabled={settings.speechEnabled}
          onDraftChange={setDraft}
          onSend={sendMessage}
          onToggleListening={handleToggleListening}
        />
      </section>

      <SettingsDrawer
        open={settingsOpen}
        settings={settings}
        voicePreviewMessage={voicePreviewMessage}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSave}
        onPreviewVoice={handlePreviewVoice}
      />
    </main>
  )
}
