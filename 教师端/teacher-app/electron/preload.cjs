const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('bubuDesktop', {
  getWorkspaceValue: (key) => ipcRenderer.invoke('workspace:get', key),
  setWorkspaceValue: (key, value) => ipcRenderer.invoke('workspace:set', key, value),
  openCoursewareFile: () => ipcRenderer.invoke('dialog:open-courseware'),
  readFileBytes: (filePath) => ipcRenderer.invoke('file:read-bytes', filePath),
  officeToPdf: (filePath) => ipcRenderer.invoke('office:to-pdf', filePath),
  saveClassSnapshot: (defaultName) => ipcRenderer.invoke('dialog:save-snapshot', defaultName),
  exportCoursewareFile: (defaultName) => ipcRenderer.invoke('dialog:export-courseware', defaultName),
  printCurrentWindow: () => ipcRenderer.invoke('window:print'),
  getOfficeIntegrationStatus: () => ipcRenderer.invoke('office:integration-status'),
  platform: process.platform
})
