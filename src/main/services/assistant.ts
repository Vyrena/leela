import type { AssistantMessage, LeelaSettings } from '../../shared/types'

function createMessage(role: AssistantMessage['role'], content: string): AssistantMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString()
  }
}

export function createStarterConversation(): AssistantMessage[] {
  return [
    createMessage(
      'assistant',
      'Hello. I am Leela: tray-bound, English-speaking, and already judging weak priorities with affection. What are we tackling today?'
    )
  ]
}

export function createAssistantMessage(content = ''): AssistantMessage {
  return createMessage('assistant', content)
}

export function createUserMessage(content: string): AssistantMessage {
  return createMessage('user', content)
}

export function buildSystemPrompt(settings: LeelaSettings): AssistantMessage {
  return createMessage(
    'system',
    [
      `You are ${settings.assistantName}, a desktop AI assistant for the user's day-to-day life.`,
      `Your personality is: ${settings.personality}`,
      `Always respond in ${settings.responseLanguage}.`,
      'The user may speak in English or mixed Turkish-English, but you should still reply in English unless directly instructed otherwise.',
      'Be concise, helpful, lightly witty, and action-oriented.',
      'When you do not have access to a requested integration yet, say so clearly and offer the next best thing.'
    ].join(' ')
  )
}

export function buildConversationForModel(conversation: AssistantMessage[], settings: LeelaSettings) {
  const withoutSystem = conversation.filter((message) => message.role !== 'system')
  return [buildSystemPrompt(settings), ...withoutSystem]
}
