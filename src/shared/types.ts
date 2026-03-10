export type AssistantMessageRole = 'system' | 'user' | 'assistant'

export interface AssistantMessage {
  id: string
  role: AssistantMessageRole
  content: string
  createdAt: string
}

export interface LeelaSettings {
  assistantName: string
  personality: string
  speechEnabled: boolean
  notificationsWithVoice: boolean
  globalHotkey: string
}
