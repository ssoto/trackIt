'use strict'

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('trackIt', {
  // Make an HTTP request via the main process
  request: (method, endpoint, body) =>
    ipcRenderer.invoke('api-request', { method, endpoint, body }),

  // Update the tray icon title (elapsed time or empty)
  setTrayTitle: (title) =>
    ipcRenderer.invoke('set-tray-title', title),

  // Subscribe to popup visibility events from the main process
  onPopupVisible: (cb) => ipcRenderer.on('popup-visible', cb),
  onPopupHidden: (cb) => ipcRenderer.on('popup-hidden', cb),

  // Quit the application
  quit: () => ipcRenderer.send('quit-app'),

  // Open TrackIt web app in browser
  openWeb: () => ipcRenderer.send('open-web'),
})
