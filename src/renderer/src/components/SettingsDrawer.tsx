import { useEffect, useState } from 'react'
import type { LeelaSettings } from '../../../shared/types'

interface SettingsDrawerProps {
  open: boolean
  settings: LeelaSettings
  voicePreviewMessage: string | null
  onClose: () => void
  onSave: (settings: LeelaSettings) => Promise<void>
  onPreviewVoice: () => Promise<void>
}

export function SettingsDrawer({ open, settings, voicePreviewMessage, onClose, onSave, onPreviewVoice }: SettingsDrawerProps) {
  const [draft, setDraft] = useState(settings)
  const [microphones, setMicrophones] = useState<Array<{ deviceId: string; label: string }>>([])

  useEffect(() => {
    async function loadMicrophones() {
      if (!navigator.mediaDevices?.enumerateDevices) {
        return
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const nextMicrophones = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${index + 1}`
        }))

      setMicrophones(nextMicrophones)
    }

    void loadMicrophones()
  }, [])

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  if (!open) {
    return null
  }

  return (
    <aside className="settings-drawer">
      <div className="settings-backdrop" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-header">
          <div>
            <div className="eyebrow">Configuration</div>
            <h2>Leela Settings</h2>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <label>
          <span>Name</span>
          <input value={draft.assistantName} onChange={(event) => setDraft({ ...draft, assistantName: event.target.value })} />
        </label>

        <label>
          <span>Personality</span>
          <textarea
            rows={4}
            value={draft.personality}
            onChange={(event) => setDraft({ ...draft, personality: event.target.value })}
          />
        </label>

        <label>
          <span>Hotkey</span>
          <input value={draft.globalHotkey} onChange={(event) => setDraft({ ...draft, globalHotkey: event.target.value })} />
        </label>

        <label>
          <span>Response Language</span>
          <input value={draft.responseLanguage} onChange={(event) => setDraft({ ...draft, responseLanguage: event.target.value })} />
        </label>

        <label>
          <span>OpenRouter API Key</span>
          <input
            type="password"
            value={draft.openRouterApiKey}
            placeholder="sk-or-v1-..."
            onChange={(event) => setDraft({ ...draft, openRouterApiKey: event.target.value })}
          />
        </label>

        <label>
          <span>OpenRouter Model</span>
          <input
            value={draft.openRouterModel}
            onChange={(event) => setDraft({ ...draft, openRouterModel: event.target.value })}
          />
        </label>

        <label>
          <span>Deepgram API Key</span>
          <input
            type="password"
            value={draft.deepgramApiKey}
            placeholder="deepgram key"
            onChange={(event) => setDraft({ ...draft, deepgramApiKey: event.target.value })}
          />
        </label>

        <label>
          <span>ElevenLabs API Key</span>
          <input
            type="password"
            value={draft.elevenLabsApiKey}
            placeholder="elevenlabs key"
            onChange={(event) => setDraft({ ...draft, elevenLabsApiKey: event.target.value })}
          />
        </label>

        <label>
          <span>ElevenLabs Voice ID</span>
          <input
            value={draft.elevenLabsVoiceId}
            placeholder="voice id"
            onChange={(event) => setDraft({ ...draft, elevenLabsVoiceId: event.target.value })}
          />
        </label>

        <label>
          <span>Microphone</span>
          <select
            value={draft.selectedMicrophoneId}
            onChange={(event) => setDraft({ ...draft, selectedMicrophoneId: event.target.value })}
          >
            <option value="">System default</option>
            {microphones.map((microphone) => (
              <option key={microphone.deviceId} value={microphone.deviceId}>
                {microphone.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Voice Input Mode</span>
          <select
            value={draft.voiceInputMode}
            onChange={(event) =>
              setDraft({ ...draft, voiceInputMode: event.target.value as LeelaSettings['voiceInputMode'] })
            }
          >
            <option value="push-to-talk">Push to talk</option>
            <option value="continuous">Continuous</option>
          </select>
        </label>

        <label>
          <span>Proactive Frequency ({draft.proactiveFrequency} min)</span>
          <input
            type="range"
            min="15"
            max="180"
            step="15"
            value={draft.proactiveFrequency}
            onChange={(event) => setDraft({ ...draft, proactiveFrequency: Number(event.target.value) })}
          />
        </label>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={draft.speechEnabled}
            onChange={(event) => setDraft({ ...draft, speechEnabled: event.target.checked })}
          />
          <span>Speak responses aloud</span>
        </label>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={draft.notificationsWithVoice}
            onChange={(event) => setDraft({ ...draft, notificationsWithVoice: event.target.checked })}
          />
          <span>Use voice for important notifications</span>
        </label>

        <button className="ghost-button settings-preview-button" type="button" onClick={() => void onPreviewVoice()}>
          Preview voice wiring
        </button>

        {voicePreviewMessage ? <div className="settings-note">{voicePreviewMessage}</div> : null}

        <button
          className="save-button"
          type="button"
          onClick={() => {
            void onSave(draft).then(onClose)
          }}
        >
          Save changes
        </button>
      </div>
    </aside>
  )
}
