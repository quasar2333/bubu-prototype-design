import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import Store from 'electron-store'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

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
      { name: '课件 / 文档 / 视频', extensions: ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'mp4', 'mov', 'avi', 'mkv', 'png', 'jpg', 'jpeg'] },
      { name: 'PowerPoint', extensions: ['ppt', 'pptx'] },
      { name: 'Word', extensions: ['doc', 'docx'] },
      { name: 'Excel', extensions: ['xls', 'xlsx'] },
      { name: 'PDF', extensions: ['pdf'] },
      { name: '视频', extensions: ['mp4', 'mov', 'avi', 'mkv'] },
      { name: '全部文件', extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const filePath = result.filePaths[0]
  const recent = store.get('recentCourseware', [])
  store.set('recentCourseware', [filePath, ...recent.filter((item) => item !== filePath)].slice(0, 12))
  let size = 0
  try { size = fs.statSync(filePath).size } catch {}
  return { filePath, fileName: path.basename(filePath), ext: path.extname(filePath).slice(1).toLowerCase(), size }
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

const SOFFICE_PATH = process.env.SOFFICE_PATH || 'C:\\Program Files\\LibreOffice\\program\\soffice.exe'
const READABLE_EXTENSIONS = new Set(['.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx', '.pdf', '.mp4', '.mov', '.avi', '.mkv', '.png', '.jpg', '.jpeg'])
const OFFICE_EXTENSIONS = new Set(['.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx'])

function assertReadableCourseware(filePath, allowed = READABLE_EXTENSIONS) {
  const ext = path.extname(String(filePath || '')).toLowerCase()
  if (!allowed.has(ext)) throw new Error(`不支持的课件文件类型：${ext || '未知'}`)
  const stat = fs.statSync(filePath)
  if (!stat.isFile()) throw new Error('只能读取本地文件')
  if (stat.size > 1024 * 1024 * 600) throw new Error('文件超过 600MB，当前演示版暂不支持')
  return { ext, stat }
}

function convertOfficeToPdf(inputPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(SOFFICE_PATH)) {
      reject(new Error(`未找到 LibreOffice：${SOFFICE_PATH}`))
      return
    }
    assertReadableCourseware(inputPath, OFFICE_EXTENSIONS)
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bubu-import-'))
    const profileDir = path.join(outDir, 'profile')
    const args = [
      '--headless', '--norestore', '--nologo', '--nofirststartwizard',
      `-env:UserInstallation=${pathToFileURL(profileDir).href}`,
      '--convert-to', 'pdf', '--outdir', outDir, inputPath
    ]
    const proc = spawn(SOFFICE_PATH, args, { windowsHide: true })
    let stderr = ''
    proc.stderr.on('data', (d) => { stderr += d.toString() })
    proc.on('error', reject)
    proc.on('close', (code) => {
      const outPdf = path.join(outDir, path.basename(inputPath, path.extname(inputPath)) + '.pdf')
      if (fs.existsSync(outPdf)) resolve(outPdf)
      else reject(new Error(`LibreOffice 转换失败 (code=${code}) ${stderr.slice(0, 500)}`))
    })
  })
}

ipcMain.handle('file:read-bytes', async (_event, filePath) => {
  assertReadableCourseware(filePath)
  return fs.readFileSync(filePath)
})

ipcMain.handle('office:to-pdf', async (_event, filePath) => {
  const pdfPath = await convertOfficeToPdf(filePath)
  return { pdfPath, bytes: fs.readFileSync(pdfPath) }
})

ipcMain.handle('office:integration-status', () => ({
  status: 'local_libreoffice',
  boundary: 'Office 预览采用本地 LibreOffice 转 PDF + pdf.js 渲染，无需外部服务',
  supportedNow: ['PPT/PPTX/DOC/DOCX/XLS/XLSX 转 PDF 预览', 'PDF 直接渲染', '视频原生播放', '导出/打印']
}))
