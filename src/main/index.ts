import { app, BrowserWindow, globalShortcut, ipcMain, nativeImage, Tray } from 'electron'
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
  globalHotkey: 'CommandOrControl+Shift+L'
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
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  tray.setToolTip('Leela')
  tray.on('click', toggleWindow)
}

function registerShortcuts() {
  const { globalHotkey } = store.get('settings')
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
    return nextSettings
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()
  registerShortcuts()
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
