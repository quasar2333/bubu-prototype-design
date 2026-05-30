import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronLeft, Pencil, Save, ChevronDown, X, GripVertical,
  RefreshCw, AlertCircle, Eye, SquarePen, ArrowUp, ArrowDown, Trash2, Printer
} from 'lucide-react'
import StepBar from '../components/StepBar.jsx'
import { layoutGroups } from '../data/questionBank.js'

const GROUP_ORDER = ['计算题', '解决问题']
const CN_NUM = ['一', '二', '三', '四', '五']
const CLASSES = ['五 (1) 班', '五 (2) 班', '五 (3) 班']
const TEMPLATES = ['作业', '测试', '考试']
const DISPLAY_OPTS = ['主标题', '副标题', '学校姓名栏', '答题栏', '装订线', '注意事项']
const GROUP_MODES = ['按题型', '按知识点', '按加入顺序']

const initialItems = layoutGroups.flatMap(g => g.items.map(q => ({ ...q, group: g.type })))

export default function HomeworkLayout() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [name, setName] = useState(state?.name || '五年级小数除法巩固练习')
  const [editing, setEditing] = useState(false)

  const [items, setItems] = useState(initialItems)
  const [activeId, setActiveId] = useState(initialItems[0]?.id ?? null)
  const [template, setTemplate] = useState('作业')
  const [groupMode, setGroupMode] = useState('按题型')
  const [show, setShow] = useState({ 主标题: true, 副标题: false, 学校姓名栏: true, 答题栏: false, 装订线: false, 注意事项: false })
  const [publishOpen, setPublishOpen] = useState(false)
  const [classes, setClasses] = useState(() => new Set(['五 (1) 班']))
  const [deadline, setDeadline] = useState('2026-06-02T23:59')
  const [toast, setToast] = useState('')

  const dragId = useRef(null)

  const toggleShow = (k) => setShow(s => ({ ...s, [k]: !s[k] }))
  const toggleClass = (c) => setClasses(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n })

  const setScore = (id, score) => setItems(it => it.map(q => q.id === id ? { ...q, score } : q))
  const removeItem = (id) => setItems(it => it.filter(q => q.id !== id))
  const moveItem = (id, dir) => {
    setItems(it => {
      const idx = it.findIndex(q => q.id === id)
      const swap = idx + dir
      if (idx < 0 || swap < 0 || swap >= it.length || it[swap].group !== it[idx].group) return it
      const next = [...it];[next[idx], next[swap]] = [next[swap], next[idx]]; return next
    })
  }
  const onDrop = (targetId) => {
    const from = items.findIndex(q => q.id === dragId.current)
    const to = items.findIndex(q => q.id === targetId)
    if (from < 0 || to < 0 || from === to) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    moved.group = items[to].group
    next.splice(to, 0, moved)
    setItems(next)
    dragId.current = null
  }

  const groups = GROUP_ORDER.map(g => ({ type: g, items: items.filter(i => i.group === g) })).filter(g => g.items.length)
  const totalScore = items.reduce((s, q) => s + (q.score || 0), 0)

  const finish = (msg) => { setToast(msg); setTimeout(() => navigate('/homework'), 900) }
  const saveDraft = () => finish('已保存草稿，可在「未发布」中继续编辑')
  const publish = () => { setPublishOpen(false); finish(`已发布给 ${[...classes].join('、') || '所选班级'}`) }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      {/* 页头 */}
      <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-4 shrink-0">
        <button onClick={() => navigate('/homework/select', { state: { name } })} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          {editing ? (
            <input autoFocus value={name} onChange={e => setName(e.target.value)} onBlur={() => setEditing(false)}
              onKeyDown={e => e.key === 'Enter' && setEditing(false)} className="input h-9 w-[280px]" />
          ) : (
            <>
              <span className="text-lg font-semibold text-slate-800 truncate">{name}</span>
              <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
            </>
          )}
        </div>
        <div className="flex-1 flex justify-center"><StepBar current={2} /></div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={saveDraft} className="btn-ghost h-9"><Save className="w-4 h-4" /> 保存草稿</button>
          <div className="relative">
            <button onClick={() => setPublishOpen(o => !o)} className="btn-primary h-9">发布作业 <ChevronDown className="w-4 h-4" /></button>
            {publishOpen && (
              <div className="absolute right-0 top-11 z-30 w-[260px] card p-4 shadow-xl animate-[fadeUp_.15s_ease-out]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-800">选择班级</span>
                  <button onClick={() => setPublishOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1.5 mb-3">
                  {CLASSES.map(c => (
                    <label key={c} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer py-1">
                      <input type="checkbox" checked={classes.has(c)} onChange={() => toggleClass(c)} className="accent-brand-600 w-4 h-4" />
                      {c}
                    </label>
                  ))}
                </div>
                <div className="text-xs text-slate-500 mb-1">截止时间</div>
                <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="input w-full mb-4" />
                <div className="flex gap-2">
                  <button onClick={() => setPublishOpen(false)} className="btn-ghost h-9 flex-1">取消</button>
                  <button onClick={publish} disabled={classes.size === 0} className="btn-primary h-9 flex-1 disabled:opacity-40">确认发布</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主体 */}
      <div className="flex-1 grid grid-cols-[1fr_300px] gap-4 px-6 py-4 min-h-0">
        {/* 预览纸张 */}
        <div className="overflow-y-auto">
          <div className="mx-auto max-w-[760px] bg-white rounded-lg shadow-card border border-slate-100 px-12 py-10 relative">
            {show.装订线 && (
              <div className="absolute left-5 top-6 bottom-6 border-l-2 border-dashed border-slate-300 flex items-center">
                <span className="text-[10px] text-slate-400 -rotate-90 whitespace-nowrap origin-center">装 订 线</span>
              </div>
            )}
            {show.主标题 && <h1 className="text-xl font-bold text-center text-slate-900">{name}</h1>}
            {show.副标题 && <div className="text-center text-sm text-slate-500 mt-1">人教版五年级上册 · 第三单元 小数除法</div>}
            {show.学校姓名栏 && (
              <div className="flex items-center justify-center gap-8 text-sm text-slate-600 mt-4 mb-2">
                <span>学校：<span className="inline-block w-24 border-b border-slate-300" /></span>
                <span>姓名：<span className="inline-block w-20 border-b border-slate-300" /></span>
                <span>班级：<span className="inline-block w-20 border-b border-slate-300" /></span>
              </div>
            )}
            {show.注意事项 && (
              <div className="text-xs text-slate-500 border border-slate-200 rounded-md p-2.5 mt-3 bg-slate-50/60">
                注意事项：1. 请认真审题，规范书写；2. 计算题需写出过程；3. 完成后仔细检查。
              </div>
            )}

            <div className="mt-5 space-y-5">
              {groups.map((g, gi) => (
                <div key={g.type}>
                  <div className="text-[15px] font-semibold text-slate-800 mb-2">{CN_NUM[gi]}、{g.type}</div>
                  <div className="space-y-3">
                    {g.items.map((q, qi) => {
                      const active = activeId === q.id
                      return (
                        <div
                          key={q.id}
                          draggable
                          onDragStart={() => { dragId.current = q.id }}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => onDrop(q.id)}
                          onClick={() => setActiveId(q.id)}
                          className={`relative rounded-lg transition cursor-pointer ${active ? 'ring-2 ring-brand-400 bg-brand-50/30' : 'hover:bg-slate-50'}`}
                        >
                          {active && (
                            <div className="absolute -top-3 left-3 right-3 z-10 flex items-center gap-0.5 bg-white border border-brand-200 rounded-md shadow-sm px-1 py-1 text-xs text-slate-600 flex-wrap">
                              <ToolBtn icon={<RefreshCw className="w-3 h-3" />} label="换题" />
                              <ToolBtn icon={<AlertCircle className="w-3 h-3" />} label="纠错" />
                              <ToolBtn icon={<Eye className="w-3 h-3" />} label="详情" />
                              <ToolBtn icon={<SquarePen className="w-3 h-3" />} label="插入作答区" onClick={() => toggleShow('答题栏')} />
                              <span className="flex items-center gap-1 px-1.5">分值
                                <input type="number" value={q.score} onChange={e => setScore(q.id, +e.target.value)} onClick={e => e.stopPropagation()} className="w-10 h-6 border border-slate-200 rounded text-center" />
                              </span>
                              <ToolBtn icon={<ArrowUp className="w-3 h-3" />} label="上移" onClick={() => moveItem(q.id, -1)} />
                              <ToolBtn icon={<ArrowDown className="w-3 h-3" />} label="下移" onClick={() => moveItem(q.id, 1)} />
                              <ToolBtn icon={<Trash2 className="w-3 h-3" />} label="删除" danger onClick={() => removeItem(q.id)} />
                            </div>
                          )}
                          <div className="flex gap-2 p-3">
                            <GripVertical className="w-4 h-4 text-slate-300 mt-0.5 shrink-0 cursor-grab" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-slate-800 leading-relaxed">
                                <span className="font-medium mr-1">{qi + 1}.</span>{q.stem}
                                <span className="text-xs text-slate-400 ml-2">（{q.score} 分）</span>
                              </div>
                              {q.lines.map((l, i) => (
                                <div key={i} className="text-[13px] text-slate-600 mt-1.5 font-mono whitespace-pre-wrap">{l}</div>
                              ))}
                              {show.答题栏 && (
                                <div className="mt-2 border border-dashed border-slate-200 rounded h-16 bg-slate-50/50 flex items-center justify-center text-[11px] text-slate-300">作答区</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 排版设置 */}
        <div className="overflow-y-auto space-y-4">
          <div className="card p-4">
            <div className="text-sm font-semibold text-slate-800 mb-3">排版设置</div>

            <div className="text-xs text-slate-500 mb-2">模板选择</div>
            <div className="flex gap-4 mb-4">
              {TEMPLATES.map(t => (
                <label key={t} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input type="radio" name="tpl" checked={template === t} onChange={() => setTemplate(t)} className="accent-brand-600" />{t}
                </label>
              ))}
            </div>

            <div className="text-xs text-slate-500 mb-2">显示项设置</div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-2 mb-4">
              {DISPLAY_OPTS.map(k => (
                <label key={k} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={show[k]} onChange={() => toggleShow(k)} className="accent-brand-600 w-4 h-4" />{k}
                </label>
              ))}
            </div>

            <div className="text-xs text-slate-500 mb-2">分组与排序</div>
            <div className="flex gap-1.5">
              {GROUP_MODES.map(m => (
                <button key={m} onClick={() => setGroupMode(m)} className={`px-2.5 py-1.5 rounded text-xs transition ${groupMode === m ? 'bg-brand-600 text-white font-medium' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{m}</button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-800">题目导航</span>
              <span className="text-xs text-slate-400">共 {items.length} 题 · {totalScore} 分</span>
            </div>
            <div className="space-y-3">
              {groups.map((g, gi) => (
                <div key={g.type}>
                  <div className="text-xs text-slate-500 mb-1.5">{CN_NUM[gi]}、{g.type}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((q, qi) => (
                      <button key={q.id} onClick={() => setActiveId(q.id)} className={`w-8 h-8 rounded-md text-sm transition ${activeId === q.id ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-600'}`}>{qi + 1}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs text-slate-400 flex items-center gap-1"><GripVertical className="w-3.5 h-3.5" /> 拖拽题目可调整顺序</div>
              <button className="text-brand-600 text-xs flex items-center gap-1 hover:underline"><Printer className="w-3.5 h-3.5" /> 预览打印效果 ›</button>
            </div>
          </div>
        </div>
      </div>

      {publishOpen && <div className="fixed inset-0 z-20" onClick={() => setPublishOpen(false)} />}

      {toast && (
        <div className="fixed left-1/2 top-16 z-[60] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">✓ {toast}</div>
      )}
    </div>
  )
}

function ToolBtn({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick?.() }}
      className={`flex items-center gap-1 px-1.5 py-1 rounded hover:bg-slate-100 ${danger ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-600'}`}
    >
      {icon} {label}
    </button>
  )
}
