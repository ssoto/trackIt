'use strict'

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('trackIt', {
  // Make an HTTP request via the main process
  request: (method, endpoint, body) =>
    ipcRenderer.invoke('api-request', { method, endpoint, body }),

  // Update the tray icon title (elapsed time or empty)
  setTrayTitle: (title) =>
    ipcRenderer.invoke('set-tray-title', title),
})
