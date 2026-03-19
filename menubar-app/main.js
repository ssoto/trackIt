'use strict'

const { app, BrowserWindow, Tray, nativeImage, ipcMain, screen, shell } = require('electron')
const path = require('path')

let tray = null
let popupWindow = null

// Hide from Dock — pure menu bar app
app.dock.hide()

// --- Icon helpers ---

function createTrayIcon(isActive = false) {
  const size = 22
  const data = Buffer.alloc(size * size * 4)
  const cx = size / 2
  const cy = size / 2
  const outerR = 9
  const innerR = 7.5
  const dotR = 1.0

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5
      const dy = y - cy + 0.5
      const dist = Math.sqrt(dx * dx + dy * dy)
      const idx = (y * size + x) * 4

      // Draw clock ring (outer circle minus inner)
      const inRing = dist <= outerR && dist >= innerR - 0.5
      // Draw clock hands (simple cross)
      const inHandV = Math.abs(dx) <= 0.5 && dy <= 0 && dy >= -(outerR - 2)
      const inHandH = Math.abs(dy) <= 0.5 && dx >= 0 && dx <= outerR - 4
      // Center dot
      const inDot = dist <= dotR

      const visible = inRing || inHandV || inHandH || inDot

      data[idx] = 0       // R
      data[idx + 1] = 0   // G
      data[idx + 2] = 0   // B
      data[idx + 3] = visible ? 220 : 0 // A — slight transparency for template look
    }
  }

  const icon = nativeImage.createFromBuffer(data, { width: size, height: size })
  const resized = icon.resize({ width: size, height: size })
  resized.setTemplateImage(true)
  return resized
}

// --- Popup window ---

function createPopupWindow() {
  popupWindow = new BrowserWindow({
    width: 320,
    height: 440,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  popupWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))

  // Hide when focus is lost
  popupWindow.on('blur', () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.hide()
    }
  })

  popupWindow.on('show', () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.webContents.send('popup-visible')
    }
  })

  popupWindow.on('hide', () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      popupWindow.webContents.send('popup-hidden')
    }
  })
}

// --- Tray toggle ---

function getPopupPosition(trayBounds) {
  const { x, y, width, height } = trayBounds
  const winBounds = popupWindow.getBounds()

  // Center popup horizontally under tray icon
  let posX = Math.round(x + width / 2 - winBounds.width / 2)
  const posY = Math.round(y + height + 4)

  // Keep within display bounds
  const display = screen.getDisplayNearestPoint({ x, y })
  const workArea = display.workArea
  posX = Math.max(workArea.x + 8, Math.min(posX, workArea.x + workArea.width - winBounds.width - 8))

  return { x: posX, y: posY }
}

function togglePopup(trayBounds) {
  if (!popupWindow || popupWindow.isDestroyed()) return

  if (popupWindow.isVisible()) {
    popupWindow.hide()
  } else {
    const { x, y } = getPopupPosition(trayBounds)
    popupWindow.setPosition(x, y)
    popupWindow.show()
    popupWindow.focus()
  }
}

// --- IPC handlers ---

ipcMain.handle('api-request', async (_event, { method, endpoint, body }) => {
  const baseUrl = 'http://localhost:3000'
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    const data = await response.json().catch(() => ({}))
    return { ok: response.ok, status: response.status, data }
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err.message }
  }
})

ipcMain.handle('set-tray-title', (_event, title) => {
  if (tray && !tray.isDestroyed()) {
    tray.setTitle(title ? ` ${title}` : '')
  }
})

ipcMain.on('quit-app', () => {
  app.quit()
})

ipcMain.on('open-web', () => {
  shell.openExternal('http://localhost:3000')
})

// --- App lifecycle ---

app.whenReady().then(() => {
  tray = new Tray(createTrayIcon())
  tray.setToolTip('TrackIt')

  createPopupWindow()

  tray.on('click', (_event, bounds) => {
    togglePopup(bounds)
  })

  // macOS: right-click shows the same popup
  tray.on('right-click', (_event, bounds) => {
    togglePopup(bounds)
  })
})

app.on('window-all-closed', () => {
  // Keep app running in menu bar even when all windows are closed
})

app.on('before-quit', () => {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.removeAllListeners('blur')
  }
})
