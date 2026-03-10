import { Menu, app, BrowserWindow, globalShortcut, ipcMain, nativeImage, Tray } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Store from 'electron-store'
import type { LeelaSettings } from '../shared/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const defaults: LeelaSettings = {
  assistantName: 'Leela',
  personality: 'Witty and playful, but warm and helpful.',
  speechEnabled: true,
  notificationsWithVoice: false,
  globalHotkey: 'CommandOrControl+Shift+L',
  responseLanguage: 'English',
  voiceInputMode: 'push-to-talk',
  proactiveFrequency: 45
}

const store = new Store<{ settings: LeelaSettings }>({
  name: 'leela-settings',
  defaults: {
    settings: defaults
  }
})

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

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

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }
}

function createTrayIcon() {
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
    return nextSettings
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()
  registerShortcut(store.get('settings').globalHotkey)
  registerIpc()

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
