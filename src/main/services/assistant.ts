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

export function buildPrototypeReply(input: string, settings: LeelaSettings): AssistantMessage {
  const normalized = input.toLowerCase()

  let content = `Prototype mode: I caught "${input}" and I am ready to hand this to OpenRouter once the API layer is wired.`

  if (normalized.includes('calendar')) {
    content = 'Calendar brain noted. In the real integration pass, I will pull your next event and wrap it in a concise briefing instead of making vague promises like a charming goblin.'
  } else if (normalized.includes('spotify') || normalized.includes('music')) {
    content = 'Music request detected. Spotify control belongs in the next integration slice, and yes, I fully intend to develop opinions about your playlists.'
  } else if (normalized.includes('remind')) {
    content = `Reminder energy detected. With proactive nudges set to every ${settings.proactiveFrequency} minutes, this will become an actual scheduled reminder pipeline soon.`
  } else if (normalized.includes('turkish') || normalized.includes('turkce')) {
    content = 'I can understand Turkish-English mixing, but I will answer in English by default just like we planned. Civilized and mildly dramatic.'
  }

  return createMessage('assistant', content)
}
