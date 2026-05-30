import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, ChevronDown, Sparkles, Star, Check, Clock, Copy, AlertCircle, Eye,
  RotateCw, LayoutGrid, Wand2, Hand, Upload, Bookmark
} from 'lucide-react'
import ChapterTree from '../components/ChapterTree.jsx'
import QuestionCart from '../components/QuestionCart.jsx'
import { chapterTree, questions, diffStyle, TEXTBOOK } from '../data/questionBank.js'

const PURPOSES = ['作业', '测试', '考试']
const SCENES = ['全部', '预习', '作业', '单元测', '阶段检测', '期中', '期末', '真题', '模拟']
const TYPES = ['全部', '选择题', '填空题', '判断题', '计算题', '解答题']
const DIFFS = ['全部', '容易', '适中', '困难']
const MORE = ['年份', '地区', '来源', '能力维度']
const TREE_TABS = ['章节目录', '知识点']
const RECOMMEND = ['按章节均衡', '按难度进阶', '按能力维度']

function groupByType(items) {
  const order = []
  const map = {}
  items.forEach(q => { if (!map[q.type]) { map[q.type] = []; order.push(q.type) } map[q.type].push(q) })
  return order.map(t => ({ type: t, items: map[t] }))
}

export default function QuestionBank() {
  const navigate = useNavigate()
  const [purpose, setPurpose] = useState('作业')
  const [treeTab, setTreeTab] = useState('章节目录')
  const [scene, setScene] = useState('全部')
  const [type, setType] = useState('全部')
  const [diff, setDiff] = useState('全部')
  const [multi, setMulti] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('综合')
  const [recOpen, setRecOpen] = useState(false)
  const [template, setTemplate] = useState('作业排版')

  const [selected, setSelected] = useState(() => new Set(questions.map(q => q.id)))
  const [favorites, setFavorites] = useState(() => new Set([3]))
  const [cartOpen, setCartOpen] = useState(false)

  const filtered = useMemo(() =>
    questions.filter(q => {
      if (type !== '全部' && q.type !== type) return false
      if (diff !== '全部' && q.diff !== diff) return false
      if (keyword.trim() && !q.stem.includes(keyword.trim()) && !q.kp.includes(keyword.trim())) return false
      return true
    }), [type, diff, keyword])

  const toggle = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleFav = (id) => setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const removeFromCart = (ids) => setSelected(prev => { const n = new Set(prev); ids.forEach(i => n.delete(i)); return n })
  const clearCart = () => setSelected(new Set())

  const selectedQuestions = questions.filter(q => selected.has(q.id))
  const groups = groupByType(selectedQuestions)
  const totalMinutes = selectedQuestions.reduce((s, q) => s + q.minutes, 0)
  const totalScore = selectedQuestions.reduce((s, q) => s + q.score, 0)
  const goLayout = () => navigate('/homework/layout', { state: { name: '智能组卷 · ' + TEXTBOOK.grade } })

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      {/* 顶部：用途 + 教材 */}
      <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-4 shrink-0">
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          {PURPOSES.map(p => (
            <button key={p} onClick={() => setPurpose(p)} className={`px-4 h-8 rounded-md text-sm transition ${purpose === p ? 'bg-white shadow-sm text-brand-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}>{p}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <Pill>{TEXTBOOK.subject.replace('数学', '小学数学')}</Pill>
          <Pill>{TEXTBOOK.press}</Pill>
          <Pill>{TEXTBOOK.grade}</Pill>
          <button className="btn-ghost h-9">切换教材</button>
          <button className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50"><RotateCw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* 主体 */}
      <div className="flex-1 grid grid-cols-[232px_1fr] gap-4 px-6 py-4 min-h-0">
        {/* 左侧目录 */}
        <div className="card flex flex-col min-h-0">
          <div className="flex border-b border-slate-100 shrink-0">
            {TREE_TABS.map(t => (
              <button key={t} onClick={() => setTreeTab(t)} className={`flex-1 py-2.5 text-sm relative ${treeTab === t ? 'text-brand-600 font-medium' : 'text-slate-500'}`}>
                {t}
                {treeTab === t && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-600 rounded-full" />}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <ChapterTree nodes={chapterTree} />
          </div>
        </div>

        {/* 中间题目区 */}
        <div className="flex flex-col min-h-0 gap-3">
          {/* 筛选 */}
          <div className="card p-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2.5 flex-1 min-w-0">
                <FilterRow label="场景" options={SCENES} value={scene} onChange={setScene} />
                <FilterRow label="题型" options={TYPES} value={type} onChange={setType} />
                <FilterRow label="难度" options={DIFFS} value={diff} onChange={setDiff} />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-9 shrink-0 text-sm">更多</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {MORE.map(m => (
                      <button key={m} className="px-2.5 py-1 rounded text-xs text-slate-500 border border-slate-200 hover:border-brand-300 flex items-center gap-1">
                        {m} <ChevronDown className="w-3 h-3" />
                      </button>
                    ))}
                    <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer ml-1">
                      <input type="checkbox" checked={multi} onChange={e => setMulti(e.target.checked)} className="accent-brand-600" /> 多选
                    </label>
                  </div>
                </div>
              </div>
              <div className="relative w-[220px] shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={keyword} onChange={e => setKeyword(e.target.value)} className="input pl-8 w-full" placeholder="搜索题干 / 知识点 / 题号" />
              </div>
            </div>
          </div>

          {/* 列表 */}
          <div className="card flex flex-col min-h-0 flex-1 overflow-hidden">
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-4 text-sm">
                {['综合', '最新', '热门'].map(s => (
                  <button key={s} onClick={() => setSort(s)} className={sort === s ? 'text-brand-600 font-medium' : 'text-slate-500 hover:text-slate-700'}>{s}</button>
                ))}
                <span className="text-slate-400 text-xs">共 13,408 道试题</span>
              </div>
              <div className="relative">
                <button onClick={() => setRecOpen(o => !o)} className="text-brand-600 text-sm flex items-center gap-1 hover:underline"><Sparkles className="w-3.5 h-3.5" /> 智能推荐 <ChevronDown className="w-3 h-3" /></button>
                {recOpen && (
                  <div className="absolute right-0 top-8 z-20 w-40 card p-1 shadow-xl animate-[fadeUp_.15s_ease-out]">
                    {RECOMMEND.map(r => (
                      <button key={r} onClick={() => setRecOpen(false)} className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-brand-50 hover:text-brand-600">{r}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {filtered.length === 0 && <div className="py-16 text-center text-sm text-slate-400">没有匹配的题目</div>}
              {filtered.map(q => {
                const on = selected.has(q.id)
                const fav = favorites.has(q.id)
                return (
                  <div key={q.id} className={`px-4 py-3.5 flex gap-3 transition ${on ? 'bg-brand-50/40' : 'hover:bg-slate-50/60'}`}>
                    <button onClick={() => toggle(q.id)} className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${on ? 'bg-brand-600 border-brand-600' : 'border-slate-300 hover:border-brand-400'}`}>
                      {on && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className="mt-0.5 w-5 h-5 rounded bg-slate-100 text-slate-500 text-xs flex items-center justify-center shrink-0">{q.no}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-800 leading-relaxed">{q.stem}</div>
                      {q.lines.map((l, i) => <div key={i} className="text-[13px] text-slate-500 mt-1 font-mono whitespace-pre-wrap">{l}</div>)}
                      <div className="flex items-center flex-wrap gap-2 mt-2 text-xs">
                        <span className="text-slate-400">来源：{q.source}</span>
                        <span className={`pill ${diffStyle[q.diff]}`}>{q.diff}</span>
                        <span className="pill bg-slate-100 text-slate-500">{q.kp}</span>
                        <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{q.minutes} 分钟</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button onClick={() => toggleFav(q.id)} className={fav ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}>
                        <Star className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
                      </button>
                      <div className="flex items-center gap-2.5 text-xs text-slate-400">
                        <button className="hover:text-brand-600 flex items-center gap-0.5"><Copy className="w-3 h-3" /> 相似题</button>
                        <button className="hover:text-brand-600 flex items-center gap-0.5"><AlertCircle className="w-3 h-3" /> 纠错</button>
                        <button className="hover:text-brand-600 flex items-center gap-0.5"><Eye className="w-3 h-3" /> 详情</button>
                      </div>
                      <button onClick={() => toggle(q.id)} className={`h-7 px-3 rounded-lg text-xs font-medium border transition ${on ? 'bg-brand-50 border-brand-200 text-brand-600' : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'}`}>
                        {on ? '已加入' : '加入试题栏'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 悬浮试题栏 + 组卷工作台抽屉 */}
      <QuestionCart
        open={cartOpen}
        onOpenChange={setCartOpen}
        groups={groups}
        onRemove={removeFromCart}
        onClear={clearCart}
        summary={
          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-500 mb-1.5">排版模板</div>
              <div className="flex gap-1.5">
                {['作业排版', '考试排版'].map(t => (
                  <button key={t} onClick={() => setTemplate(t)} className={`px-3 py-1.5 rounded-md text-xs transition ${template === t ? 'bg-brand-600 text-white font-medium' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="预计时长" value={`${totalMinutes} 分`} />
              <Stat label="总分" value={totalScore} />
              <Stat label="难度" value="中等" />
            </div>
          </div>
        }
        footer={
          <div className="space-y-2">
            <button onClick={goLayout} disabled={selectedQuestions.length === 0} className="btn-primary w-full h-10 disabled:opacity-40">
              <LayoutGrid className="w-4 h-4" /> 去排版
            </button>
            <div className="grid grid-cols-3 gap-2">
              <button className="btn-ghost h-9 text-xs"><Wand2 className="w-3.5 h-3.5" /> 智能组卷</button>
              <button className="btn-ghost h-9 text-xs"><Hand className="w-3.5 h-3.5" /> 手动组卷</button>
              <button className="btn-ghost h-9 text-xs"><Upload className="w-3.5 h-3.5" /> 导入题目</button>
            </div>
            <button className="w-full text-xs text-slate-500 hover:text-brand-600 flex items-center justify-center gap-1 pt-1"><Bookmark className="w-3.5 h-3.5" /> 保存为题篮</button>
          </div>
        }
      />
    </div>
  )
}

function Pill({ children }) {
  return <span className="px-2.5 h-8 inline-flex items-center rounded-lg bg-slate-50 text-slate-600 text-sm">{children}</span>
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2 text-center">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-800 mt-0.5">{value}</div>
    </div>
  )
}

function FilterRow({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 w-9 shrink-0 text-sm">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} className={`px-2.5 py-1 rounded text-xs transition ${value === o ? 'bg-brand-600 text-white font-medium' : 'text-slate-500 hover:bg-slate-100'}`}>{o}</button>
        ))}
      </div>
    </div>
  )
}
