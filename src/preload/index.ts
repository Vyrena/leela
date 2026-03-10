import { contextBridge, ipcRenderer } from 'electron'
import type { LeelaSettings } from '../shared/types'

const api = {
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<LeelaSettings>,
  setSettings: (partial: Partial<LeelaSettings>) =>
    ipcRenderer.invoke('settings:set', partial) as Promise<LeelaSettings>
}

contextBridge.exposeInMainWorld('leela', api)

declare global {
  interface Window {
    leela: typeof api
  }
}
