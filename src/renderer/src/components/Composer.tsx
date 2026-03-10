interface ComposerProps {
  draft: string
  isListening: boolean
  isSending: boolean
  voiceMessage: string
  speechEnabled: boolean
  onDraftChange: (draft: string) => void
  onSend: () => Promise<void>
  onToggleListening: () => Promise<void>
}

export function Composer({
  draft,
  isListening,
  isSending,
  voiceMessage,
  speechEnabled,
  onDraftChange,
  onSend,
  onToggleListening
}: ComposerProps) {
  return (
    <section className="composer-shell">
      <div className="quick-actions">
        <button className="quick-chip" type="button" onClick={() => onDraftChange('Give me a morning briefing.')}>Morning brief</button>
        <button className="quick-chip" type="button" onClick={() => onDraftChange('What should I focus on for the next 30 minutes?')}>Focus sprint</button>
        <button className="quick-chip" type="button" onClick={() => onDraftChange('Remind me to check Telegram later.')}>Telegram reminder</button>
      </div>

      <div className="voice-status-banner">{voiceMessage}</div>

      <div className="composer">
        <textarea
          value={draft}
          rows={3}
          disabled={isSending}
          placeholder="Talk to Leela..."
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void onSend()
            }
          }}
        />
        <div className="composer-actions">
          <button
            className={`voice-button ${isListening ? 'active' : ''}`}
            type="button"
            disabled={!speechEnabled || isSending}
            onClick={() => void onToggleListening()}
          >
            {isListening ? 'Listening...' : 'Mic'}
          </button>
          <button className="send-button" type="button" disabled={isSending} onClick={() => void onSend()}>
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </section>
  )
}
