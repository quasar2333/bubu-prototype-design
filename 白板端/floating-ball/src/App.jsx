import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Download, Plus, RotateCcw, Trash2 } from 'lucide-react'
import {
  defaultFloatingActions,
  FloatingStrip,
  iconOptions,
} from './components/FloatingStrip.jsx'

const variantOptions = [
  { value: 'labeled', label: '图标+文字' },
  { value: 'icon', label: '纯图标' },
  { value: 'pill', label: '胶囊按钮' },
]

const stripLayoutStorageKey = 'bubu-whiteboard-floating-strip-layout'
const stripScaleFloor = 0.05
const stripPanelMaxScale = 4

function cloneDefaults() {
  return defaultFloatingActions.map((item) => ({ ...item }))
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normalizeStripScale(value) {
  const next = Number(value)
  if (!Number.isFinite(next)) return 1
  return Math.max(stripScaleFloor, next)
}

function defaultStripLayout() {
  if (typeof window === 'undefined') {
    return {
      x: 860,
      y: 460,
      scale: 1,
    }
  }

  return {
    x: Math.round(window.innerWidth * 0.62),
    y: Math.round(window.innerHeight * 0.5),
    scale: 1,
  }
}

function normalizeStripLayout(layout) {
  const fallback = defaultStripLayout()
  return {
    x: Number.isFinite(Number(layout?.x)) ? Number(layout.x) : fallback.x,
    y: Number.isFinite(Number(layout?.y)) ? Number(layout.y) : fallback.y,
    scale: normalizeStripScale(
      Number.isFinite(Number(layout?.scale)) ? Number(layout.scale) : fallback.scale,
    ),
  }
}

function readStripLayout() {
  if (typeof window === 'undefined') return defaultStripLayout()

  try {
    const raw = window.localStorage.getItem(stripLayoutStorageKey)
    return normalizeStripLayout(raw ? JSON.parse(raw) : defaultStripLayout())
  } catch (error) {
    window.localStorage.removeItem(stripLayoutStorageKey)
    return defaultStripLayout()
  }
}

function makeActionId() {
  return `action-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function replaceItem(items, id, patch) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

function moveByStep(items, id, step) {
  const index = items.findIndex((item) => item.id === id)
  const nextIndex = Math.max(0, Math.min(items.length - 1, index + step))
  if (index < 0 || index === nextIndex) return items
  const next = [...items]
  const [removed] = next.splice(index, 1)
  next.splice(nextIndex, 0, removed)
  return next
}

export default function App() {
  const [actions, setActions] = useState(() => cloneDefaults())
  const [activeId, setActiveId] = useState('home')
  const [lastAction, setLastAction] = useState(defaultFloatingActions[0])
  const [stripLayout, setStripLayout] = useState(() => readStripLayout())

  const activeAction = useMemo(
    () => actions.find((item) => item.id === activeId) ?? actions[0],
    [actions, activeId],
  )
  const configHref = useMemo(
    () =>
      `data:application/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify({ actions }, null, 2),
      )}`,
    [actions],
  )

  function updateActive(patch) {
    if (!activeAction) return
    const nextPatch = { ...patch }
    if (nextPatch.variant === 'pill') {
      nextPatch.icon = 'download'
      nextPatch.label = activeAction.label || '下载'
    }
    setActions((items) => replaceItem(items, activeAction.id, nextPatch))
  }

  function addAction() {
    const nextItem = {
      id: makeActionId(),
      label: '新功能',
      icon: 'grid',
      variant: 'labeled',
    }
    setActions((items) => [...items, nextItem])
    setActiveId(nextItem.id)
  }

  function removeActive() {
    if (!activeAction || actions.length <= 1) return
    const nextActions = actions.filter((item) => item.id !== activeAction.id)
    setActions(nextActions)
    setActiveId(nextActions[Math.max(0, actions.findIndex((item) => item.id === activeAction.id) - 1)].id)
  }

  function resetActions() {
    const defaults = cloneDefaults()
    setActions(defaults)
    setActiveId(defaults[0].id)
    setLastAction(defaults[0])
  }

  function updateStripLayout(patch) {
    setStripLayout((layout) => normalizeStripLayout({ ...layout, ...patch }))
  }

  function resetStripLayout() {
    const nextLayout = defaultStripLayout()
    window.localStorage.removeItem(stripLayoutStorageKey)
    setStripLayout(nextLayout)
  }

  return (
    <main className="strip-demo-page app-shell">
      <section className="whiteboard-stage" aria-label="白板授课页面">
        <div className="lesson-surface">
          <div className="lesson-topbar">
            <span>初二 3 班</span>
            <span>数学 · 二次函数</span>
            <span>在线 42/45</span>
          </div>
          <div className="lesson-card">
            <div>
              <span className="lesson-kicker">课堂白板</span>
              <h1>函数图像与性质</h1>
            </div>
            <div className="axis-board" aria-hidden="true">
              <span className="axis-line axis-x" />
              <span className="axis-line axis-y" />
              <span className="curve-line" />
              <span className="point-dot dot-a" />
              <span className="point-dot dot-b" />
            </div>
          </div>
          <div className="page-meta">
            <button type="button">上一页</button>
            <span>08 / 24</span>
            <button type="button">下一页</button>
          </div>
        </div>

        <FloatingStrip
          items={actions}
          onItemsChange={setActions}
          activeId={activeId}
          onActiveChange={setActiveId}
          onAction={setLastAction}
          layout={stripLayout}
          onLayoutChange={setStripLayout}
          storageKey={stripLayoutStorageKey}
        />
      </section>

      <aside className="config-panel" aria-label="组件配置">
        <div className="panel-header">
          <div>
            <p>Floating Strip</p>
            <h2>条形悬浮组件</h2>
          </div>
          <button className="icon-button" type="button" title="重置" onClick={resetActions}>
            <RotateCcw aria-hidden="true" />
          </button>
        </div>

        <div className="status-card">
          <span>当前触发</span>
          <strong>{lastAction?.label}</strong>
        </div>

        <div className="layout-card">
          <div className="layout-card__header">
            <div>
              <span>布局</span>
              <strong>位置与大小</strong>
            </div>
            <button className="icon-button" type="button" title="复位位置和大小" onClick={resetStripLayout}>
              <RotateCcw aria-hidden="true" />
            </button>
          </div>

          <label className="range-field" htmlFor="strip-scale">
            <span>大小 {Math.round(stripLayout.scale * 100)}%</span>
            <input
              id="strip-scale"
              type="range"
              min={stripScaleFloor}
              max={Math.max(stripPanelMaxScale, stripLayout.scale)}
              step="0.01"
              value={stripLayout.scale}
              onChange={(event) => updateStripLayout({ scale: Number(event.target.value) })}
            />
          </label>

          <div className="field-group">
            <label htmlFor="strip-scale-value">大小比例</label>
            <input
              id="strip-scale-value"
              type="number"
              min={stripScaleFloor}
              step="0.01"
              value={stripLayout.scale}
              onChange={(event) => updateStripLayout({ scale: Number(event.target.value) })}
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="strip-x">横向位置</label>
              <input
                id="strip-x"
                type="number"
                min="0"
                step="1"
                value={Math.round(stripLayout.x)}
                onChange={(event) => updateStripLayout({ x: Number(event.target.value) })}
              />
            </div>

            <div className="field-group">
              <label htmlFor="strip-y">纵向位置</label>
              <input
                id="strip-y"
                type="number"
                min="0"
                step="1"
                value={Math.round(stripLayout.y)}
                onChange={(event) => updateStripLayout({ y: Number(event.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="action-label">功能名称</label>
          <input
            id="action-label"
            value={activeAction?.label ?? ''}
            onChange={(event) => updateActive({ label: event.target.value })}
          />
        </div>

        <div className="field-row">
          <div className="field-group">
            <label htmlFor="action-icon">图标</label>
            <select
              id="action-icon"
              value={activeAction?.icon ?? 'grid'}
              onChange={(event) => updateActive({ icon: event.target.value })}
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="action-variant">形态</label>
            <select
              id="action-variant"
              value={activeAction?.variant ?? 'labeled'}
              onChange={(event) => updateActive({ variant: event.target.value })}
            >
              {variantOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="button-row">
          <button type="button" onClick={() => setActions((items) => moveByStep(items, activeId, -1))}>
            <ArrowUp aria-hidden="true" />
            上移
          </button>
          <button type="button" onClick={() => setActions((items) => moveByStep(items, activeId, 1))}>
            <ArrowDown aria-hidden="true" />
            下移
          </button>
        </div>

        <div className="button-row">
          <button type="button" onClick={addAction}>
            <Plus aria-hidden="true" />
            添加
          </button>
          <button type="button" onClick={removeActive} disabled={actions.length <= 1}>
            <Trash2 aria-hidden="true" />
            删除
          </button>
        </div>

        <div className="action-list">
          {actions.map((item, index) => (
            <button
              className={item.id === activeId ? 'is-selected' : ''}
              type="button"
              key={item.id}
              onClick={() => setActiveId(item.id)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.label}</strong>
              <em>{variantOptions.find((option) => option.value === item.variant)?.label}</em>
            </button>
          ))}
        </div>

        <a className="export-button" href={configHref} download="floating-strip-config.json">
          <Download aria-hidden="true" />
          导出配置
        </a>
      </aside>
    </main>
  )
}
