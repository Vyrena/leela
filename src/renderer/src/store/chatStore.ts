import { create } from 'zustand'
import type { AssistantMessage } from '../../../shared/types'

interface ChatState {
  draft: string
  messages: AssistantMessage[]
  isListening: boolean
  isSending: boolean
  setDraft: (draft: string) => void
  toggleListening: () => void
  hydrate: (messages: AssistantMessage[]) => void
  sendMessage: () => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  draft: '',
  messages: [],
  isListening: false,
  isSending: false,
  setDraft: (draft) => set({ draft }),
  toggleListening: () => set((state) => ({ isListening: !state.isListening })),
  hydrate: (messages) => set({ messages }),
  sendMessage: async () => {
    const draft = get().draft.trim()

    if (!draft) {
      return
    }

    set({ draft: '', isSending: true })

    const messages = await window.leela.sendMessage(draft)

    set({ isSending: false, messages })
  }
}))
