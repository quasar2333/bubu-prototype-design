import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import Store from 'electron-store'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const store = new Store({ name: 'bubu-teacher-workspace' })

const isDev = process.env.VITE_DEV_SERVER_URL
const isSmokeTest = process.argv.includes('--smoke-test')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    title: '步步教师工作台',
    backgroundColor: '#f5f8ff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    if (!isSmokeTest) mainWindow.show()
  })

  if (isDev) {
    mainWindow.loadURL(isDev)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  if (isSmokeTest) {
    mainWindow.webContents.once('did-finish-load', async () => {
      const smokeResult = await mainWindow.webContents.executeJavaScript(`
        JSON.stringify({
          title: document.title,
          rootExists: !!document.getElementById('root'),
          bridgeReady: !!window.bubuDesktop
        })
      `)
      console.log(`[electron-smoke] ${smokeResult}`)
      app.quit()
    })
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('workspace:get', (_event, key) => store.get(key))
ipcMain.handle('workspace:set', (_event, key, value) => {
  store.set(key, value)
  return true
})

ipcMain.handle('dialog:open-courseware', async () => {
  const result = await dialog.showOpenDialog({
    title: '选择课件文件',
    properties: ['openFile'],
    filters: [
      { name: '课件与文档', extensions: ['ppt', 'pptx', 'pdf'] },
      { name: '全部文件', extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  const recent = store.get('recentCourseware', [])
  store.set('recentCourseware', [filePath, ...recent.filter((item) => item !== filePath)].slice(0, 12))
  return { filePath, fileName: path.basename(filePath) }
})

ipcMain.handle('dialog:save-snapshot', async (_event, defaultName = 'bubu-snapshot.png') => {
  const result = await dialog.showSaveDialog({
    title: '保存课堂截图',
    defaultPath: defaultName,
    filters: [{ name: 'PNG 图片', extensions: ['png'] }]
  })

  if (result.canceled) return null
  return { filePath: result.filePath }
})

ipcMain.handle('dialog:export-courseware', async (_event, defaultName = 'bubu-homework.pdf') => {
  const result = await dialog.showSaveDialog({
    title: '导出课件/试卷',
    defaultPath: defaultName,
    filters: [
      { name: 'PDF 文档', extensions: ['pdf'] },
      { name: 'PowerPoint 文档', extensions: ['pptx'] }
    ]
  })

  if (result.canceled) return null
  return { filePath: result.filePath }
})

ipcMain.handle('window:print', (event) => {
  const sourceWindow = BrowserWindow.fromWebContents(event.sender)
  if (!sourceWindow) return false
  sourceWindow.webContents.print({ printBackground: true })
  return true
})

ipcMain.handle('office:integration-status', () => ({
  status: 'pending_vendor_decision',
  boundary: 'Office 在线编辑/预览需要甲方确认采用嵌入式 SDK、外部查看器或自研预览方案',
  supportedNow: ['本地 PPT/PPTX/PDF 文件选择', '导出保存路径选择', '系统打印窗口']
}))
