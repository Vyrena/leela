export type AssistantMessageRole = 'system' | 'user' | 'assistant'

export interface AssistantMessage {
  id: string
  role: AssistantMessageRole
  content: string
  createdAt: string
}

export type VoiceInputMode = 'push-to-talk' | 'continuous'

export interface ChatRequest {
  requestId: string
  input: string
}

export interface ChatStreamStartEvent {
  requestId: string
  message: AssistantMessage
}

export interface ChatStreamChunkEvent {
  requestId: string
  messageId: string
  chunk: string
}

export interface ChatStreamCompleteEvent {
  requestId: string
  message: AssistantMessage
  conversation: AssistantMessage[]
}

export interface ChatStreamErrorEvent {
  requestId: string
  messageId: string
  error: string
  conversation: AssistantMessage[]
}

export type VoiceStatus = 'idle' | 'listening' | 'speaking' | 'error'

export interface VoiceState {
  status: VoiceStatus
  provider: 'deepgram' | 'elevenlabs' | 'none'
  message: string
}

export interface LeelaSettings {
  assistantName: string
  personality: string
  speechEnabled: boolean
  notificationsWithVoice: boolean
  globalHotkey: string
  responseLanguage: string
  voiceInputMode: VoiceInputMode
  proactiveFrequency: number
  openRouterApiKey: string
  openRouterModel: string
  deepgramApiKey: string
  elevenLabsApiKey: string
  elevenLabsVoiceId: string
  selectedMicrophoneId: string
}
