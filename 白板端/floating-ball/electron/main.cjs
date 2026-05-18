const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
  nativeImage,
  screen,
  shell,
} = require('electron')
const path = require('node:path')

const appUserData = path.join(app.getPath('appData'), 'BubuWhiteboardFloatingOverlay')
app.setPath('userData', appUserData)
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')

let overlayWindow = null
let tray = null
let isQuitting = false

const singleInstanceLock = app.requestSingleInstanceLock()
if (!singleInstanceLock) {
  app.quit()
}

function createTrayIcon() {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="6" y1="5" x2="27" y2="28">
          <stop stop-color="#208bff"/>
          <stop offset="0.55" stop-color="#784df2"/>
          <stop offset="1" stop-color="#ed58a6"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#g)"/>
      <circle cx="16" cy="16" r="11" fill="#fff" fill-opacity="0.92"/>
      <text x="16" y="21" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#4147d9">Ai</text>
    </svg>
  `

  return nativeImage.createFromDataURL(
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  )
}

function showOverlay() {
  if (!overlayWindow) createOverlayWindow()
  overlayWindow.showInactive()
  overlayWindow.setAlwaysOnTop(true, 'screen-saver')
}

function hideOverlay() {
  overlayWindow?.hide()
}

function toggleOverlay() {
  if (!overlayWindow || !overlayWindow.isVisible()) {
    showOverlay()
  } else {
    hideOverlay()
  }
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    {
      label: overlayWindow?.isVisible() ? '隐藏悬浮组件' : '显示悬浮组件',
      click: toggleOverlay,
    },
    {
      label: '重新加载',
      click() {
        overlayWindow?.reload()
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click() {
        isQuitting = true
        app.quit()
      },
    },
  ])
}

function createTray() {
  tray = new Tray(createTrayIcon())
  tray.setToolTip('白板端桌面悬浮组件')
  tray.setContextMenu(buildTrayMenu())
  tray.on('click', toggleOverlay)
}

function createOverlayWindow() {
  const { bounds } = screen.getPrimaryDisplay()

  overlayWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    title: '白板端桌面悬浮组件',
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    fullscreenable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  overlayWindow.setAlwaysOnTop(true, 'screen-saver')
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  overlayWindow.once('ready-to-show', () => {
    showOverlay()
  })

  overlayWindow.on('show', () => {
    tray?.setContextMenu(buildTrayMenu())
  })

  overlayWindow.on('hide', () => {
    tray?.setContextMenu(buildTrayMenu())
  })

  overlayWindow.on('close', (event) => {
    if (isQuitting) return
    event.preventDefault()
    hideOverlay()
  })

  overlayWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const devUrl = process.env.WHITEBOARD_FLOATING_DEV_URL
  if (devUrl) {
    overlayWindow.loadURL(devUrl)
    return
  }

  overlayWindow.loadFile(path.join(__dirname, '..', 'dist', 'desktop.html'))
}

ipcMain.on('overlay:set-ignore-mouse-events', (event, ignored) => {
  if (!overlayWindow || event.sender !== overlayWindow.webContents) return
  overlayWindow.setIgnoreMouseEvents(Boolean(ignored), { forward: true })
})

app.whenReady().then(() => {
  createTray()
  createOverlayWindow()
})

app.on('second-instance', () => {
  showOverlay()
})

app.on('activate', () => {
  showOverlay()
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {})
