import { contextBridge, ipcRenderer } from 'electron'
import type {
  AssistantMessage,
  ChatRequest,
  ChatStreamChunkEvent,
  ChatStreamCompleteEvent,
  ChatStreamErrorEvent,
  ChatStreamStartEvent,
  LeelaSettings,
  VoiceState
} from '../shared/types'

function subscribe<T>(channel: string, callback: (payload: T) => void) {
  const listener = (_event: Electron.IpcRendererEvent, payload: T) => callback(payload)
  ipcRenderer.on(channel, listener)

  return () => {
    ipcRenderer.removeListener(channel, listener)
  }
}

const api = {
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<LeelaSettings>,
  setSettings: (partial: Partial<LeelaSettings>) =>
    ipcRenderer.invoke('settings:set', partial) as Promise<LeelaSettings>,
  getConversation: () => ipcRenderer.invoke('chat:getConversation') as Promise<AssistantMessage[]>,
  sendMessage: (request: ChatRequest) => ipcRenderer.invoke('chat:sendMessage', request) as Promise<AssistantMessage[]>,
  getVoiceState: () => ipcRenderer.invoke('voice:getState') as Promise<VoiceState>,
  startListening: () => ipcRenderer.invoke('voice:startListening') as Promise<VoiceState>,
  stopListening: () => ipcRenderer.invoke('voice:stopListening') as Promise<VoiceState>,
  previewSpeech: () => ipcRenderer.invoke('voice:previewSpeech') as Promise<{ ok: boolean; message: string }>,
  onChatStreamStart: (callback: (payload: ChatStreamStartEvent) => void) => subscribe('chat:stream-start', callback),
  onChatStreamChunk: (callback: (payload: ChatStreamChunkEvent) => void) => subscribe('chat:stream-chunk', callback),
  onChatStreamComplete: (callback: (payload: ChatStreamCompleteEvent) => void) =>
    subscribe('chat:stream-complete', callback),
  onChatStreamError: (callback: (payload: ChatStreamErrorEvent) => void) => subscribe('chat:stream-error', callback),
  onVoiceState: (callback: (payload: VoiceState) => void) => subscribe('voice:state', callback)
}

contextBridge.exposeInMainWorld('leela', api)

declare global {
  interface Window {
    leela: typeof api
  }
}
