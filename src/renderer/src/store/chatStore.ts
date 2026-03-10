import { create } from 'zustand'
import type {
  AssistantMessage,
  ChatStreamChunkEvent,
  ChatStreamCompleteEvent,
  ChatStreamErrorEvent,
  ChatStreamStartEvent
} from '../../../shared/types'

interface ChatState {
  draft: string
  messages: AssistantMessage[]
  isListening: boolean
  isSending: boolean
  activeRequestId: string | null
  error: string | null
  setDraft: (draft: string) => void
  toggleListening: () => void
  hydrate: (messages: AssistantMessage[]) => void
  sendMessage: () => Promise<void>
  startStream: (payload: ChatStreamStartEvent) => void
  appendChunk: (payload: ChatStreamChunkEvent) => void
  completeStream: (payload: ChatStreamCompleteEvent) => void
  failStream: (payload: ChatStreamErrorEvent) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  draft: '',
  messages: [],
  isListening: false,
  isSending: false,
  activeRequestId: null,
  error: null,
  setDraft: (draft) => set({ draft }),
  toggleListening: () => set((state) => ({ isListening: !state.isListening })),
  hydrate: (messages) => set({ messages }),
  sendMessage: async () => {
    const draft = get().draft.trim()

    if (!draft) {
      return
    }

    const requestId = crypto.randomUUID()
    const userMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: draft,
      createdAt: new Date().toISOString()
    }

    set((state) => ({
      draft: '',
      isSending: true,
      activeRequestId: requestId,
      error: null,
      messages: [...state.messages, userMessage]
    }))

    try {
      await window.leela.sendMessage({ requestId, input: draft })
    } catch (error) {
      set({
        isSending: false,
        activeRequestId: null,
        error: error instanceof Error ? error.message : 'Unable to send message.'
      })
    }
  },
  startStream: ({ requestId, message }) =>
    set((state) => ({
      messages: [...state.messages, message],
      activeRequestId: requestId
    })),
  appendChunk: ({ requestId, messageId, chunk }) =>
    set((state) => {
      if (state.activeRequestId !== requestId) {
        return state
      }

      return {
        messages: state.messages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: `${message.content}${chunk}`
              }
            : message
        )
      }
    }),
  completeStream: ({ requestId, conversation }) =>
    set((state) => {
      if (state.activeRequestId !== requestId) {
        return { messages: conversation }
      }

      return {
        messages: conversation,
        isSending: false,
        activeRequestId: null,
        error: null
      }
    }),
  failStream: ({ requestId, error, conversation }) =>
    set((state) => ({
      messages: conversation,
      isSending: false,
      activeRequestId: state.activeRequestId === requestId ? null : state.activeRequestId,
      error
    }))
}))
