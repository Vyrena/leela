import { create } from 'zustand'
import type { VoiceState } from '../../../shared/types'

interface VoiceStore {
  state: VoiceState
  hydrate: (state: VoiceState) => void
  startListening: () => Promise<void>
  stopListening: () => Promise<void>
  previewSpeech: () => Promise<string>
}

const defaultState: VoiceState = {
  status: 'idle',
  provider: 'none',
  message: 'Voice services are standing by.'
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  state: defaultState,
  hydrate: (state) => set({ state }),
  startListening: async () => {
    const nextState = await window.leela.startListening()
    set({ state: nextState })
  },
  stopListening: async () => {
    const nextState = await window.leela.stopListening()
    set({ state: nextState })
  },
  previewSpeech: async () => {
    const result = await window.leela.previewSpeech()
    return result.message
  }
}))
