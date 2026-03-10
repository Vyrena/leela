import { contextBridge, ipcRenderer } from 'electron'
import type { AssistantMessage, LeelaSettings } from '../shared/types'

const api = {
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<LeelaSettings>,
  setSettings: (partial: Partial<LeelaSettings>) =>
    ipcRenderer.invoke('settings:set', partial) as Promise<LeelaSettings>,
  getConversation: () => ipcRenderer.invoke('chat:getConversation') as Promise<AssistantMessage[]>,
  sendMessage: (input: string) => ipcRenderer.invoke('chat:sendMessage', input) as Promise<AssistantMessage[]>
}

contextBridge.exposeInMainWorld('leela', api)

declare global {
  interface Window {
    leela: typeof api
  }
}
