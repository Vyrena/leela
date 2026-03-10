import { create } from 'zustand'
import type { AssistantMessage } from '../../../shared/types'

interface ChatState {
  draft: string
  messages: AssistantMessage[]
  isListening: boolean
  setDraft: (draft: string) => void
  toggleListening: () => void
  sendMessage: () => void
}

function createMessage(role: AssistantMessage['role'], content: string): AssistantMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString()
  }
}

const starterMessages: AssistantMessage[] = [
  createMessage(
    'assistant',
    "Good morning. I am awake, mildly caffeinated in spirit, and ready to help. Want a plan, a nudge, or a soundtrack?"
  ),
  createMessage(
    'user',
    'Give me a quick focus reset and remind me to check my calendar later.'
  ),
  createMessage(
    'assistant',
    'Deal. Two deep breaths, one tiny next step, and I will be extremely smug when you get momentum back.'
  )
]

export const useChatStore = create<ChatState>((set, get) => ({
  draft: '',
  messages: starterMessages,
  isListening: false,
  setDraft: (draft) => set({ draft }),
  toggleListening: () => set((state) => ({ isListening: !state.isListening })),
  sendMessage: () => {
    const draft = get().draft.trim()

    if (!draft) {
      return
    }

    const userMessage = createMessage('user', draft)
    const assistantMessage = createMessage(
      'assistant',
      `I heard you: "${draft}". Once the OpenRouter pipeline is wired in, I will answer for real instead of doing my charming prototype impression.`
    )

    set((state) => ({
      draft: '',
      messages: [...state.messages, userMessage, assistantMessage]
    }))
  }
}))
