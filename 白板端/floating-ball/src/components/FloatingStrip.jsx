import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronsRight,
  Copy,
  Ellipsis,
  Grid2X2,
  GripVertical,
  Maximize2,
  Pencil,
  Plus,
  RotateCcw,
} from 'lucide-react'

export const iconOptions = [
  { value: 'home', label: '主页' },
  { value: 'folder', label: '文件' },
  { value: 'material', label: '素材' },
  { value: 'classroom', label: '课堂' },
  { value: 'property', label: '属性' },
  { value: 'component', label: '组件' },
  { value: 'copy', label: '复制' },
  { value: 'grid', label: '网格' },
  { value: 'pencil', label: '画笔' },
  { value: 'more', label: '更多' },
  { value: 'download', label: '下载' },
]

export const defaultFloatingActions = [
  { id: 'home', label: '主页', icon: 'home', variant: 'labeled' },
  { id: 'files', label: '文件', icon: 'folder', variant: 'labeled' },
  { id: 'assets', label: '素材', icon: 'material', variant: 'labeled' },
  { id: 'lesson', label: '课堂', icon: 'classroom', variant: 'labeled' },
  { id: 'props', label: '属性', icon: 'property', variant: 'labeled' },
  { id: 'components', label: '组件', icon: 'component', variant: 'labeled' },
  { id: 'duplicate', label: '复制', icon: 'copy', variant: 'icon' },
  { id: 'tiles', label: '视图', icon: 'grid', variant: 'icon' },
  { id: 'draw', label: '画笔', icon: 'pencil', variant: 'icon' },
  { id: 'more', label: '更多', icon: 'more', variant: 'icon' },
  { id: 'download', label: '下载', icon: 'download', variant: 'pill' },
]

const outlineIconMap = {
  copy: Copy,
  grid: Grid2X2,
  pencil: Pencil,
  more: Ellipsis,
  plus: Plus,
  reset: RotateCcw,
}

function ColorIcon({ name }) {
  if (name === 'home') {
    return <span className="color-icon home-icon" aria-hidden="true" />
  }

  if (name === 'folder') {
    return <span className="color-icon folder-icon" aria-hidden="true" />
  }

  if (name === 'material') {
    return (
      <span className="color-icon material-icon" aria-hidden="true">
        <span />
      </span>
    )
  }

  if (name === 'classroom') {
    return (
      <span className="color-icon class-icon" aria-hidden="true">
        <span />
      </span>
    )
  }

  if (name === 'property') {
    return (
      <span className="color-icon property-icon" aria-hidden="true">
        <span />
      </span>
    )
  }

  if (name === 'component') {
    return (
      <span className="color-icon component-icon" aria-hidden="true">
        <span />
      </span>
    )
  }

  if (name === 'download') {
    return null
  }

  const Icon = outlineIconMap[name] ?? Grid2X2
  return <Icon className="line-icon" aria-hidden="true" strokeWidth={3.8} />
}

function moveItem(items, fromIndex, toIndex) {
  const next = [...items]
  const [removed] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, removed)
  return next
}

const DEFAULT_LAYOUT = {
  x: 0,
  y: 0,
  scale: 1,
}

const STRIP_SCALE_FLOOR = 0.05

function clamp(value, min, max) {
  if (max < min) return (min + max) / 2
  return Math.min(max, Math.max(min, value))
}

function normalizeScale(value) {
  const next = Number(value)
  if (!Number.isFinite(next)) return 1
  return Math.max(STRIP_SCALE_FLOOR, next)
}

function getDefaultLayout() {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT

  return {
    x: Math.round(window.innerWidth * 0.62),
    y: Math.round(window.innerHeight * 0.5),
    scale: 1,
  }
}

function normalizeLayout(layout) {
  const fallback = getDefaultLayout()
  return {
    x: Number.isFinite(Number(layout?.x)) ? Number(layout.x) : fallback.x,
    y: Number.isFinite(Number(layout?.y)) ? Number(layout.y) : fallback.y,
    scale: normalizeScale(
      Number.isFinite(Number(layout?.scale)) ? Number(layout.scale) : fallback.scale,
    ),
  }
}

function readStoredLayout(storageKey, initialLayout) {
  if (typeof window === 'undefined' || !storageKey) {
    return normalizeLayout(initialLayout)
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    return normalizeLayout(raw ? { ...initialLayout, ...JSON.parse(raw) } : initialLayout)
  } catch (error) {
    window.localStorage.removeItem(storageKey)
    return normalizeLayout(initialLayout)
  }
}

function clampLayoutToViewport(layout, node) {
  if (typeof window === 'undefined') return normalizeLayout(layout)

  const next = normalizeLayout(layout)
  const rect = node?.getBoundingClientRect()
  const halfWidth = Math.min(window.innerWidth / 2 - 16, Math.max(46, (rect?.width ?? 132) / 2))
  const halfHeight = Math.min(window.innerHeight / 2 - 16, Math.max(46, (rect?.height ?? 520) / 2))

  return {
    ...next,
    x: Math.round(clamp(next.x, halfWidth + 12, window.innerWidth - halfWidth - 12)),
    y: Math.round(clamp(next.y, halfHeight + 12, window.innerHeight - halfHeight - 12)),
  }
}

export function FloatingStrip({
  items,
  onItemsChange,
  activeId,
  onActiveChange,
  onAction,
  layout,
  onLayoutChange,
  initialLayout,
  storageKey = '',
  className = '',
  editable = true,
  movable = true,
  resizable = true,
  layoutControls = true,
}) {
  const [internalActiveId, setInternalActiveId] = useState(items[0]?.id)
  const [collapsed, setCollapsed] = useState(false)
  const [draggingId, setDraggingId] = useState(null)
  const [resizeMode, setResizeMode] = useState(false)
  const [internalLayout, setInternalLayout] = useState(() =>
    readStoredLayout(storageKey, initialLayout),
  )
  const shellRef = useRef(null)
  const itemRefs = useRef(new Map())
  const dragRef = useRef(null)
  const layoutRef = useRef(internalLayout)
  const moveRef = useRef(null)
  const resizeRef = useRef(null)
  const suppressClickRef = useRef(false)

  const selectedId = activeId ?? internalActiveId
  const shownItems = useMemo(() => items.filter((item) => !item.hidden), [items])
  const currentLayout = normalizeLayout(layout ?? internalLayout)

  useEffect(() => {
    layoutRef.current = currentLayout
  }, [currentLayout])

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return
    window.localStorage.setItem(storageKey, JSON.stringify(currentLayout))
  }, [currentLayout, storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleResize = () => {
      updateLayout((value) => clampLayoutToViewport(value, shellRef.current))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  })

  function setItemRef(id, node) {
    if (node) itemRefs.current.set(id, node)
    else itemRefs.current.delete(id)
  }

  function commitLayout(nextLayout) {
    const clampedLayout = clampLayoutToViewport(nextLayout, shellRef.current)
    layoutRef.current = clampedLayout

    if (layout) {
      onLayoutChange?.(clampedLayout)
    } else {
      setInternalLayout(clampedLayout)
      onLayoutChange?.(clampedLayout)
    }
  }

  function updateLayout(nextLayout) {
    const value =
      typeof nextLayout === 'function' ? nextLayout(layoutRef.current) : nextLayout
    commitLayout(value)
  }

  function startMove(event) {
    if (!movable || event.button > 0) return
    if (moveRef.current) return
    event.preventDefault()
    event.stopPropagation()
    moveRef.current = {
      x: event.clientX,
      y: event.clientY,
      layout: layoutRef.current,
    }
    if ('pointerId' in event) event.currentTarget.setPointerCapture?.(event.pointerId)

    const handleMove = (moveEvent) => updateMove(moveEvent)
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('mouseup', handleUp)
      finishLayoutGesture()
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('pointerup', handleUp, { once: true })
    window.addEventListener('mouseup', handleUp, { once: true })
  }

  function updateMove(event) {
    const move = moveRef.current
    if (!move) return
    event.preventDefault()
    updateLayout({
      ...move.layout,
      x: move.layout.x + event.clientX - move.x,
      y: move.layout.y + event.clientY - move.y,
    })
  }

  function startResize(event) {
    if (!resizable || !resizeMode || event.button > 0) return
    if (resizeRef.current) return
    event.preventDefault()
    event.stopPropagation()
    const rect = shellRef.current?.getBoundingClientRect()
    const center = {
      x: (rect?.left ?? currentLayout.x) + (rect?.width ?? 0) / 2,
      y: (rect?.top ?? currentLayout.y) + (rect?.height ?? 0) / 2,
    }
    resizeRef.current = {
      x: event.clientX,
      y: event.clientY,
      center,
      distance: Math.hypot(event.clientX - center.x, event.clientY - center.y),
      layout: layoutRef.current,
    }
    if ('pointerId' in event) event.currentTarget.setPointerCapture?.(event.pointerId)

    const handleResize = (resizeEvent) => updateResize(resizeEvent)
    const handleUp = () => {
      window.removeEventListener('pointermove', handleResize)
      window.removeEventListener('mousemove', handleResize)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('mouseup', handleUp)
      finishLayoutGesture()
    }

    window.addEventListener('pointermove', handleResize)
    window.addEventListener('mousemove', handleResize)
    window.addEventListener('pointerup', handleUp, { once: true })
    window.addEventListener('mouseup', handleUp, { once: true })
  }

  function updateResize(event) {
    const resize = resizeRef.current
    if (!resize) return
    event.preventDefault()

    const distance = Math.hypot(event.clientX - resize.center.x, event.clientY - resize.center.y)
    const delta = (distance - resize.distance) / 520
    updateLayout({
      ...resize.layout,
      scale: normalizeScale(resize.layout.scale + delta),
    })
  }

  function finishLayoutGesture() {
    moveRef.current = null
    resizeRef.current = null
  }

  function commitActive(item) {
    if (activeId === undefined) setInternalActiveId(item.id)
    onActiveChange?.(item.id, item)
    onAction?.(item)
  }

  function startPointerDrag(event, item) {
    if (!editable || collapsed || resizeMode || event.button > 0) return

    const rect = event.currentTarget.getBoundingClientRect()
    dragRef.current = {
      id: item.id,
      startY: event.clientY,
      lastY: event.clientY,
      started: false,
      offsetY: event.clientY - rect.top,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function updatePointerDrag(event) {
    const drag = dragRef.current
    if (!drag) return

    const distance = event.clientY - drag.startY
    drag.lastY = event.clientY

    if (!drag.started && Math.abs(distance) > 8) {
      drag.started = true
      suppressClickRef.current = true
      setDraggingId(drag.id)
    }

    if (!drag.started) return

    const currentIndex = shownItems.findIndex((item) => item.id === drag.id)
    const entries = shownItems
      .map((item, index) => {
        const node = itemRefs.current.get(item.id)
        if (!node) return null
        const rect = node.getBoundingClientRect()
        return {
          id: item.id,
          index,
          top: rect.top,
          middle: rect.top + rect.height / 2,
          bottom: rect.bottom,
        }
      })
      .filter(Boolean)

    const target = entries.find((entry) => event.clientY < entry.middle)
    let nextIndex = target ? target.index : entries.length - 1
    if (currentIndex === -1 || nextIndex === currentIndex) return

    if (event.clientY > entries[currentIndex]?.bottom && nextIndex < currentIndex) {
      nextIndex = currentIndex
    }

    onItemsChange?.(moveItem(items, currentIndex, nextIndex))
  }

  function finishPointerDrag() {
    dragRef.current = null
    setDraggingId(null)
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 0)
  }

  function handleClick(item) {
    if (suppressClickRef.current) return
    commitActive(item)
  }

  const stripStyle = {
    '--strip-x': `${currentLayout.x}px`,
    '--strip-y': `${currentLayout.y}px`,
    '--strip-scale': currentLayout.scale,
    ...(collapsed ? { width: 64, height: 64, maxHeight: 64 } : {}),
  }

  return (
    <div
      ref={shellRef}
      className={[
        'floating-strip-host',
        collapsed ? 'is-collapsed' : '',
        draggingId ? 'has-dragging' : '',
        resizeMode ? 'is-resize-mode' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={stripStyle}
      aria-label="白板端条形悬浮组件"
    >
      {layoutControls && (
        <div className="floating-strip__layout-tools" aria-label="条形组件位置和大小">
          {movable && (
            <button
              className="strip-move-handle"
              type="button"
              title="拖动位置"
              aria-label="拖动条形组件位置"
              onPointerDown={startMove}
              onPointerCancel={finishLayoutGesture}
              onMouseDown={startMove}
            >
              <GripVertical aria-hidden="true" strokeWidth={3.2} />
            </button>
          )}
          {resizable && (
            <button
              className="strip-resize-toggle"
              type="button"
              title={resizeMode ? '退出大小调节' : '调整大小'}
              aria-label={resizeMode ? '退出条形组件大小调节' : '进入条形组件大小调节'}
              aria-pressed={resizeMode}
              onClick={() => setResizeMode((value) => !value)}
            >
              <Maximize2 aria-hidden="true" strokeWidth={3.2} />
            </button>
          )}
        </div>
      )}

      <div className="floating-strip">
        <div className="floating-strip__shine" />

        <div className="floating-strip__content">
        {!collapsed && (
          <div className="floating-strip__items">
            {shownItems.map((item, index) => {
              const isUtilityStart =
                item.variant !== 'labeled' && shownItems[index - 1]?.variant === 'labeled'

              return (
                <div
                  className={['strip-slot', isUtilityStart ? 'with-divider' : '']
                    .filter(Boolean)
                    .join(' ')}
                  key={item.id}
                  ref={(node) => setItemRef(item.id, node)}
                >
                  <button
                    className={[
                      'strip-action',
                      `strip-action--${item.variant}`,
                      selectedId === item.id ? 'is-active' : '',
                      draggingId === item.id ? 'is-dragging' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    type="button"
                    title={item.label}
                    aria-pressed={selectedId === item.id}
                    onClick={() => handleClick(item)}
                    onPointerDown={(event) => startPointerDrag(event, item)}
                    onPointerMove={updatePointerDrag}
                    onPointerUp={finishPointerDrag}
                    onPointerCancel={finishPointerDrag}
                  >
                    {item.variant === 'pill' ? (
                      <span className="download-pill">{item.label}</span>
                    ) : (
                      <>
                        <span className="icon-shell">
                          <ColorIcon name={item.icon} />
                        </span>
                        {item.variant === 'labeled' && (
                          <span className="strip-label">{item.label}</span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <button
          className="collapse-toggle"
          type="button"
          aria-label={collapsed ? '展开悬浮条' : '收起悬浮条'}
          onClick={() => setCollapsed((value) => !value)}
        >
          <ChevronsRight aria-hidden="true" strokeWidth={4.2} />
        </button>
        </div>
      </div>

      {layoutControls && resizable && resizeMode && (
        <div
          className="strip-resize-frame"
          role="presentation"
          onPointerDown={startResize}
          onPointerCancel={finishLayoutGesture}
          onMouseDown={startResize}
        >
          <span className="strip-resize-grip is-top-left" />
          <span className="strip-resize-grip is-top-right" />
          <span className="strip-resize-grip is-bottom-left" />
          <span className="strip-resize-grip is-bottom-right" />
        </div>
      )}
    </div>
  )
}
