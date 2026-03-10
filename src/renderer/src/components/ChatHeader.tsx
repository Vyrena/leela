import type { LeelaSettings } from '../../../shared/types'

interface ChatHeaderProps {
  settings: LeelaSettings
  onOpenSettings: () => void
}

export function ChatHeader({ settings, onOpenSettings }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div>
        <div className="eyebrow">Tray Companion</div>
        <h1>{settings.assistantName}</h1>
        <p className="lede">Always in English, always a little too pleased with herself.</p>
      </div>
      <button className="ghost-button" type="button" onClick={onOpenSettings}>
        Settings
      </button>
    </header>
  )
}
