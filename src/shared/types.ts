export type AssistantMessageRole = 'system' | 'user' | 'assistant'

export interface AssistantMessage {
  id: string
  role: AssistantMessageRole
  content: string
  createdAt: string
}

export type VoiceInputMode = 'push-to-talk' | 'continuous'

export interface LeelaSettings {
  assistantName: string
  personality: string
  speechEnabled: boolean
  notificationsWithVoice: boolean
  globalHotkey: string
  responseLanguage: string
  voiceInputMode: VoiceInputMode
  proactiveFrequency: number
}
