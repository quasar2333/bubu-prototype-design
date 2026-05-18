const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktopOverlay', {
  setMousePassthrough(ignored) {
    ipcRenderer.send('overlay:set-ignore-mouse-events', Boolean(ignored))
  },
})
