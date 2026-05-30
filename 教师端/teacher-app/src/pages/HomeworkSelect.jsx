import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronLeft, Pencil, Search, Sparkles, Check, Clock
} from 'lucide-react'
import StepBar from '../components/StepBar.jsx'
import ChapterTree from '../components/ChapterTree.jsx'
import QuestionCart from '../components/QuestionCart.jsx'
import { chapterTree, questions, diffStyle, TEXTBOOK } from '../data/questionBank.js'

const SCENES = ['全部', '作业', '课后练习', '单元测']
const TYPES = ['全部', '选择题', '填空题', '判断题', '计算题', '解答题']
const DIFFS = ['全部', '容易', '适中', '困难']
const SOURCES = ['校本题库', '近三年', '本学期']

// 试题栏分组用：解答题 -> 解决问题
const CART_TYPE = { 解答题: '解决问题' }
function groupForCart(items) {
  const order = []
  const map = {}
  items.forEach(q => {
    const t = CART_TYPE[q.type] || q.type
    if (!map[t]) { map[t] = []; order.push(t) }
    map[t].push(q)
  })
  return order.map(t => ({ type: t, items: map[t] }))
}

export default function HomeworkSelect() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [name, setName] = useState(state?.name || '五年级小数除法巩固练习')
  const [editing, setEditing] = useState(false)

  const [scene, setScene] = useState('作业')
  const [type, setType] = useState('全部')
  const [diff, setDiff] = useState('全部')
  const [source, setSource] = useState('校本题库')
  const [onlyNew, setOnlyNew] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('综合')

  const [selected, setSelected] = useState(() => new Set([1, 2, 3]))
  const [cartOpen, setCartOpen] = useState(false)

  const toggle = (id) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filtered = useMemo(() =>
    questions.filter(q => {
      if (type !== '全部' && q.type !== type) return false
      if (diff !== '全部' && q.diff !== diff) return false
      if (keyword.trim() && !q.stem.includes(keyword.trim()) && !q.kp.includes(keyword.trim())) return false
      return true
    }), [type, diff, keyword])

  const selectedQuestions = questions.filter(q => selected.has(q.id))
  const groups = groupForCart(selectedQuestions)
  const totalMinutes = selectedQuestions.reduce((s, q) => s + q.minutes, 0)

  const removeFromCart = (ids) => setSelected(prev => { const n = new Set(prev); ids.forEach(i => n.delete(i)); return n })
  const clearCart = () => setSelected(new Set())
  const goLayout = () => navigate('/homework/layout', { state: { name } })

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      {/* 页头：作业名称 + 流程 */}
      <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-4 shrink-0">
        <button onClick={() => navigate('/homework')} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          {editing ? (
            <input autoFocus value={name} onChange={e => setName(e.target.value)} onBlur={() => setEditing(false)}
              onKeyDown={e => e.key === 'Enter' && setEditing(false)}
              className="input h-9 w-[280px]" />
          ) : (
            <>
              <span className="text-lg font-semibold text-slate-800 truncate">{name}</span>
              <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
            </>
          )}
        </div>
        <div className="flex-1 flex justify-center"><StepBar current={1} /></div>
        <div className="w-8 shrink-0" />
      </div>

      {/* 主体：章节树 + 题目区 */}
      <div className="flex-1 grid grid-cols-[232px_1fr] gap-4 px-6 py-4 min-h-0">
        {/* 左侧章节树 */}
        <div className="card flex flex-col min-h-0">
          <div className="px-3 py-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="pill bg-brand-50 text-brand-600">{TEXTBOOK.press}</span>
              <span className="text-slate-500">{TEXTBOOK.grade}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <ChapterTree nodes={chapterTree} />
          </div>
        </div>

        {/* 中间题目区 */}
        <div className="flex flex-col min-h-0 gap-3">
          {/* 筛选区 */}
          <div className="card p-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2.5 flex-1 min-w-0">
                <FilterRow label="场景" options={SCENES} value={scene} onChange={setScene} />
                <FilterRow label="题型" options={TYPES} value={type} onChange={setType} />
                <FilterRow label="难度" options={DIFFS} value={diff} onChange={setDiff} />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-9 shrink-0 text-sm">来源</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {SOURCES.map(s => <Chip key={s} active={source === s} onClick={() => setSource(s)}>{s}</Chip>)}
                    <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer ml-1">
                      <input type="checkbox" checked={onlyNew} onChange={e => setOnlyNew(e.target.checked)} className="accent-brand-600" />
                      只看新题
                    </label>
                  </div>
                </div>
              </div>
              <div className="relative w-[200px] shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={keyword} onChange={e => setKeyword(e.target.value)} className="input pl-8 w-full" placeholder="在结果中搜索" />
              </div>
            </div>
          </div>

          {/* 列表 */}
          <div className="card flex flex-col min-h-0 flex-1 overflow-hidden">
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-4 text-sm">
                {['综合', '最新'].map(s => (
                  <button key={s} onClick={() => setSort(s)} className={sort === s ? 'text-brand-600 font-medium' : 'text-slate-500 hover:text-slate-700'}>{s}</button>
                ))}
                <span className="text-slate-400 text-xs">题量 {filtered.length} 道</span>
              </div>
              <button className="text-brand-600 text-sm flex items-center gap-1 hover:underline"><Sparkles className="w-3.5 h-3.5" /> 智能推荐</button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {filtered.length === 0 && (
                <div className="py-16 text-center text-sm text-slate-400">没有匹配的题目，试试调整筛选条件</div>
              )}
              {filtered.map(q => {
                const on = selected.has(q.id)
                return (
                  <div key={q.id} className={`px-4 py-3.5 flex gap-3 transition ${on ? 'bg-brand-50/40' : 'hover:bg-slate-50/60'}`}>
                    <button onClick={() => toggle(q.id)} className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${on ? 'bg-brand-600 border-brand-600' : 'border-slate-300 hover:border-brand-400'}`}>
                      {on && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-800 leading-relaxed">
                        <span className="font-medium text-slate-500 mr-1">{q.no}.</span>{q.stem}
                      </div>
                      {q.lines.map((l, i) => (
                        <div key={i} className="text-[13px] text-slate-500 mt-1 font-mono whitespace-pre-wrap">{l}</div>
                      ))}
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <span className="pill bg-slate-100 text-slate-500">{q.kp}</span>
                        <span className="pill bg-slate-100 text-slate-500">{q.type}</span>
                        <span className={`pill ${diffStyle[q.diff]}`}>{q.diff}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{q.minutes} 分钟</span>
                      </div>
                    </div>
                    <button onClick={() => toggle(q.id)} className={`self-start shrink-0 h-8 px-3 rounded-lg text-xs font-medium border transition ${on ? 'bg-brand-50 border-brand-200 text-brand-600' : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'}`}>
                      {on ? '已加入' : '加入试题栏'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 底部状态条 */}
      <div className="bg-white border-t border-slate-100 px-6 py-2.5 text-sm text-slate-500 shrink-0">
        已选 <span className="text-brand-600 font-semibold">{selected.size}</span> 题，可继续添加或
        <button onClick={goLayout} disabled={selected.size === 0} className="text-brand-600 hover:underline disabled:opacity-40 disabled:no-underline ml-1">进入排版</button>
      </div>

      {/* 悬浮试题栏 */}
      <QuestionCart
        open={cartOpen}
        onOpenChange={setCartOpen}
        groups={groups}
        onRemove={removeFromCart}
        onClear={clearCart}
        summary={
          <div className="flex items-center gap-4 text-xs text-slate-500 pb-1">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 预计 {totalMinutes} 分钟</span>
            <span>共 {groups.length} 种题型</span>
          </div>
        }
        footer={
          <button onClick={goLayout} disabled={selected.size === 0} className="btn-primary w-full h-10 disabled:opacity-40">
            去排版
          </button>
        }
      />
    </div>
  )
}

function FilterRow({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 w-9 shrink-0 text-sm">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => <Chip key={o} active={value === o} onClick={() => onChange(o)}>{o}</Chip>)}
      </div>
    </div>
  )
}

function Chip({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={`px-2.5 py-1 rounded text-xs transition ${active ? 'bg-brand-600 text-white font-medium' : 'text-slate-500 hover:bg-slate-100'}`}>
      {children}
    </button>
  )
}
