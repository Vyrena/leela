import { Menu, app, BrowserWindow, globalShortcut, ipcMain, nativeImage, Tray } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Store from 'electron-store'
import { DeepgramService } from './services/deepgram'
import { ElevenLabsService } from './services/elevenlabs'
import {
  buildConversationForModel,
  createAssistantMessage,
  createStarterConversation,
  createUserMessage
} from './services/assistant'
import { streamOpenRouterReply } from './services/openrouter'
import type {
  AssistantMessage,
  ChatRequest,
  ChatStreamChunkEvent,
  ChatStreamCompleteEvent,
  ChatStreamErrorEvent,
  ChatStreamStartEvent,
  LeelaSettings
} from '../shared/types'
import type { VoiceState } from '../shared/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const defaults: LeelaSettings = {
  assistantName: 'Leela',
  personality: 'Witty and playful, but warm and helpful.',
  speechEnabled: true,
  notificationsWithVoice: false,
  globalHotkey: 'CommandOrControl+Shift+L',
  responseLanguage: 'English',
  voiceInputMode: 'push-to-talk',
  proactiveFrequency: 45,
  openRouterApiKey: '',
  openRouterModel: 'anthropic/claude-3.5-sonnet',
  deepgramApiKey: '',
  elevenLabsApiKey: '',
  elevenLabsVoiceId: '',
  selectedMicrophoneId: ''
}

type AppStore = {
  settings: LeelaSettings
  conversation: AssistantMessage[]
}

type AppStoreAdapter = {
  get<K extends keyof AppStore>(key: K): AppStore[K]
  set<K extends keyof AppStore>(key: K, value: AppStore[K]): void
}

const store = new Store({
  name: 'leela-settings',
  defaults: {
    settings: defaults,
    conversation: createStarterConversation()
  }
}) as unknown as AppStoreAdapter

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let voiceState: VoiceState = {
  status: 'idle',
  provider: 'none',
  message: 'Voice services are standing by.'
}

const deepgramService = new DeepgramService()
const elevenLabsService = new ElevenLabsService()

function sendToRenderer(channel: string, payload: unknown) {
  mainWindow?.webContents.send(channel, payload)
}

function resolveAssetPath(...segments: string[]) {
  return app.isPackaged
    ? path.join(process.resourcesPath, ...segments)
    : path.join(__dirname, '../../', ...segments)
}

function setVoiceState(nextVoiceState: VoiceState) {
  voiceState = nextVoiceState
  sendToRenderer('voice:state', voiceState)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    minWidth: 360,
    minHeight: 560,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: false,
    skipTaskbar: true,
    title: 'Leela',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide()
    }
  })

  mainWindow.setVisibleOnAllWorkspaces(false)

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }
}

function createTrayIcon() {
  const iconPath = resolveAssetPath('assets', 'icons', 'leela-tray.svg')

  if (fs.existsSync(iconPath)) {
    const svgFile = fs.readFileSync(iconPath, 'utf8')
    return nativeImage.createFromDataURL(`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgFile)}`)
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffcf9d" />
          <stop offset="100%" stop-color="#ea8f68" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="18" fill="url(#g)" />
      <path d="M24 22h8c7.732 0 14 6.268 14 14v6h-8v-6c0-3.314-2.686-6-6-6h-8v-8z" fill="#311d16" />
      <circle cx="41" cy="23" r="5" fill="#311d16" />
    </svg>
  `.trim()

  return nativeImage.createFromDataURL(`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`)
}

function toggleWindow() {
  if (!mainWindow) return

  if (mainWindow.isVisible()) {
    mainWindow.hide()
    return
  }

  mainWindow.show()
  mainWindow.focus()
}

function createTray() {
  const icon = createTrayIcon()
  tray = new Tray(icon)
  tray.setToolTip('Leela')
  tray.on('click', toggleWindow)
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Open Leela',
        click: toggleWindow
      },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ])
  )
}

function registerShortcut(globalHotkey: string) {
  globalShortcut.unregisterAll()
  globalShortcut.register(globalHotkey, toggleWindow)
}

function registerIpc() {
  ipcMain.handle('settings:get', () => store.get('settings'))
  ipcMain.handle('settings:set', (_event, partial: Partial<LeelaSettings>) => {
    const nextSettings = {
      ...store.get('settings'),
      ...partial
    }

    store.set('settings', nextSettings)
    registerShortcut(nextSettings.globalHotkey)

    if (voiceState.status === 'listening') {
      setVoiceState(deepgramService.buildState(nextSettings, 'listening'))
    } else if (voiceState.status === 'speaking') {
      setVoiceState(elevenLabsService.buildState(nextSettings, 'speaking'))
    }

    return nextSettings
  })
  ipcMain.handle('voice:getState', () => voiceState)
  ipcMain.handle('voice:startListening', () => {
    const nextState = deepgramService.buildState(store.get('settings'), 'listening')
    setVoiceState(nextState)
    return nextState
  })
  ipcMain.handle('voice:stopListening', () => {
    const nextState = deepgramService.buildState(store.get('settings'), 'idle')
    setVoiceState(nextState)
    return nextState
  })
  ipcMain.handle('voice:previewSpeech', async () => {
    const settings = store.get('settings')
    setVoiceState(elevenLabsService.buildState(settings, 'speaking'))

    try {
      const result = await elevenLabsService.previewVoice(settings, settings.assistantName)
      setVoiceState(elevenLabsService.buildState(settings, 'idle'))
      return result
    } catch (error) {
      const nextState: VoiceState = {
        status: 'error',
        provider: 'elevenlabs',
        message: error instanceof Error ? error.message : 'Unable to preview voice.'
      }
      setVoiceState(nextState)
      throw error
    }
  })
  ipcMain.handle('chat:getConversation', () => store.get('conversation'))
  ipcMain.handle('chat:sendMessage', async (_event, request: ChatRequest) => {
    const settings = store.get('settings')
    const userMessage = createUserMessage(request.input)
    const assistantMessage = createAssistantMessage('')
    const baseConversation = [...store.get('conversation'), userMessage]
    const startEvent: ChatStreamStartEvent = {
      requestId: request.requestId,
      message: assistantMessage
    }

    sendToRenderer('chat:stream-start', startEvent)

    let content = ''

    try {
      for await (const chunk of streamOpenRouterReply({
        messages: buildConversationForModel(baseConversation, settings),
        settings
      })) {
        content += chunk

        const chunkEvent: ChatStreamChunkEvent = {
          requestId: request.requestId,
          messageId: assistantMessage.id,
          chunk
        }

        sendToRenderer('chat:stream-chunk', chunkEvent)
      }

      const finalizedAssistantMessage: AssistantMessage = {
        ...assistantMessage,
        content: content.trim() || 'I received an empty response from the model, which is rude even by machine standards.'
      }
      const nextConversation = [...baseConversation, finalizedAssistantMessage]
      const completeEvent: ChatStreamCompleteEvent = {
        requestId: request.requestId,
        message: finalizedAssistantMessage,
        conversation: nextConversation
      }

      store.set('conversation', nextConversation)
      if (settings.speechEnabled) {
        setVoiceState(elevenLabsService.buildState(settings, 'speaking'))
        setTimeout(() => {
          setVoiceState(elevenLabsService.buildState(store.get('settings'), 'idle'))
        }, 300)
      }
      sendToRenderer('chat:stream-complete', completeEvent)

      return nextConversation
    } catch (error) {
      const fallbackAssistantMessage: AssistantMessage = {
        ...assistantMessage,
        content:
          error instanceof Error
            ? error.message
            : 'Something went wrong while talking to OpenRouter.'
      }
      const nextConversation = [...baseConversation, fallbackAssistantMessage]
      const errorEvent: ChatStreamErrorEvent = {
        requestId: request.requestId,
        messageId: assistantMessage.id,
        error: fallbackAssistantMessage.content,
        conversation: nextConversation
      }

      store.set('conversation', nextConversation)
      sendToRenderer('chat:stream-error', errorEvent)

      return nextConversation
    }
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()
  registerShortcut(store.get('settings').globalHotkey)
  registerIpc()
  setVoiceState({
    status: 'idle',
    provider: 'none',
    message: 'Voice services are standing by.'
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
