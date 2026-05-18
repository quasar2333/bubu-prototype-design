import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  defaultFloatingActions,
  FloatingStrip,
} from './components/FloatingStrip.jsx'
import './index.css'

const desktopStripStorageKey = 'bubu-whiteboard-floating-strip-desktop'

function cloneDefaults() {
  return defaultFloatingActions.map((item) => ({ ...item }))
}

function getInitialLayout() {
  if (typeof window === 'undefined') {
    return { x: 1180, y: 460, scale: 1 }
  }

  return {
    x: Math.max(120, window.innerWidth - 128),
    y: Math.round(window.innerHeight * 0.5),
    scale: 1,
  }
}

function DesktopStrip() {
  const [actions, setActions] = useState(() => cloneDefaults())
  const [activeId, setActiveId] = useState('home')
  const initialLayout = useMemo(() => getInitialLayout(), [])

  return (
    <FloatingStrip
      items={actions}
      onItemsChange={setActions}
      activeId={activeId}
      onActiveChange={setActiveId}
      initialLayout={initialLayout}
      storageKey={desktopStripStorageKey}
    />
  )
}

ReactDOM.createRoot(document.getElementById('desktop-strip-root')).render(
  <React.StrictMode>
    <DesktopStrip />
  </React.StrictMode>,
)
