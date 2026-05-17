import { useState, useMemo } from 'react'
import { Search, RotateCcw, Eye, FilePlus, Star, RefreshCw, ChevronRight, X } from 'lucide-react'

const TABS = ['校本题库', '区级题库', '公开库', '我的收藏', '错题沉淀']

const questions = [
  { idx: 1, text: '不等式 2x > 7 的解集是（    ）  A. x > 5    B. x ≥ 5    C. x < 5    D. x ≤ 5', src: '校本', diff: '中等', used: 128, rate: 62, tags: ['教材：人教版 P72', '例题2', '一元一次不等式'], diffColor: 'amber' },
  { idx: 2, text: '解不等式：3(x − 1) ≥ 2x + 4，并把解集在数轴上表示出来。', src: '区级', diff: '中等', used: 256, rate: 58, tags: ['教材：人教版 P73', '习题', '一元一次不等式'], diffColor: 'amber' },
  { idx: 3, text: '若 x > 2，写出 x 的取值范围在数轴上的表示：  A. x > 3    B. x ≥ 3    C. x < 3    D. x ≤ 3', src: '公开', diff: '简单', used: 512, rate: 72, tags: ['教材：人教版 P74', '习题1-3', '一元一次不等式'], diffColor: 'emerald' },
  { idx: 4, text: '解不等式组：{2x ≥ 0; 2x + 1 ≥ 7}，并写出它的整数解。', src: '校本', diff: '困难', used: 86, rate: 41, tags: ['教材：人教版 P75', '练习2-4', '一元一次不等式'], diffColor: 'rose' },
  { idx: 5, text: '已知不等式 ax − 1 > 2 的解集是 x > 1，则 a 的取值范围是（    ）  A. a > 2    B. a < 2    C. a > 0    D. a < 0', src: '区级', diff: '困难', used: 64, rate: 39, tags: ['教材：人教版 P76', '一元一次不等式的应用'], diffColor: 'rose' }
]

export default function QuestionBank() {
  const [active, setActive] = useState('校本题库')
  const [picked, setPicked] = useState({ 1: true, 2: true, 3: true })
  const [favorites, setFavorites] = useState({})
  const [keyword, setKeyword] = useState('')
  const [typeRatio, setTypeRatio] = useState({ '选择题': true, '填空题': true, '解答题': true })
  const [diffRatio, setDiffRatio] = useState({ '简单': true, '中等': true, '困难': true })
  const [count, setCount] = useState(18)
  const [duration, setDuration] = useState(35)

  const filtered = useMemo(() => {
    if (!keyword.trim()) return questions
    return questions.filter(q => q.text.includes(keyword.trim()) || q.tags.some(t => t.includes(keyword.trim())))
  }, [keyword])

  const pickedCount = Object.values(picked).filter(Boolean).length
  const togglePick = (i) => setPicked(p => ({ ...p, [i]: !p[i] }))
  const toggleFav = (i) => setFavorites(f => ({ ...f, [i]: !f[i] }))
  const allPagePicked = filtered.length > 0 && filtered.every(q => picked[q.idx])
  const togglePageAll = () => {
    const np = { ...picked }
    if (allPagePicked) filtered.forEach(q => { np[q.idx] = false })
    else filtered.forEach(q => { np[q.idx] = true })
    setPicked(np)
  }
  const clearPicked = () => setPicked({})

  return (
    <div className="p-6 grid grid-cols-[1fr_320px] gap-5">
      <div className="space-y-4 min-w-0">
        {/* 标签栏 */}
        <div className="flex items-center gap-6 border-b border-slate-200">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`pb-3 text-sm relative ${active === t ? 'text-brand-600 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t}
              {active === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
            </button>
          ))}
        </div>

        {/* 搜索 */}
        <div className="card p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input w-full pl-9"
              placeholder="搜索知识点、题干、教材页"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
            {keyword && (
              <button onClick={() => setKeyword('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 hover:bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-5 gap-3">
            <FilterSelect label="学科" value="数学" />
            <FilterSelect label="年级" value="八年级" />
            <FilterSelect label="章节" value="8.2 一元一次不等式" />
            <FilterSelect label="题型" value="全部" />
            <FilterSelect label="难度" value="全部" />
            <FilterSelect label="来源" value="全部" />
            <FilterSelect label="使用次数" value="全部" />
            <FilterSelect label="正确率" value="全部" />
            <FilterSelect label="更多筛选" value="" expand />
            <div className="flex gap-2">
              <button className="btn-ghost h-9 flex-1"><RotateCcw className="w-3.5 h-3.5" /> 重置</button>
              <button className="btn-primary h-9 flex-1">搜索</button>
            </div>
          </div>
        </div>

        {/* 题目列表 */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-slate-700 font-medium">共 {filtered.length} 题 / 1,256</span>
              <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
                <input type="checkbox" checked={allPagePicked} onChange={togglePageAll} className="accent-brand-600" /> 全选本页
              </label>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span>排序:</span>
              <button className="h-8 px-3 rounded-md border border-slate-200 bg-white text-slate-700 flex items-center gap-2">
                默认排序 <ChevronRight className="w-3 h-3 rotate-90" />
              </button>
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">没有找到匹配的题目</div>
          )}
          <div className="divide-y divide-slate-50">
            {filtered.map(q => (
              <div key={q.idx} className="px-4 py-3 flex gap-3 hover:bg-slate-50/60">
                <input
                  type="checkbox"
                  className="mt-1 accent-brand-600"
                  checked={!!picked[q.idx]}
                  onChange={() => togglePick(q.idx)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-800">
                    <span className="font-semibold text-slate-500 mr-1">{q.idx}.</span>
                    {q.text}
                  </div>
                  <div className="flex items-center flex-wrap gap-2 mt-2 text-xs text-slate-400">
                    {q.tags.map((t, i) => (
                      <span key={i} className={i === q.tags.length - 1 ? 'pill bg-brand-50 text-brand-600' : ''}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className={`pill ${q.src === '校本' ? 'bg-emerald-100 text-emerald-700' : q.src === '区级' ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>{q.src}</span>
                  <span className={`text-${q.diffColor}-500 w-12 text-center`}>{q.diff}</span>
                  <span className="text-slate-500 w-16 text-center">{q.used} 次</span>
                  <span className={`w-14 text-center ${q.rate >= 60 ? 'text-emerald-500' : 'text-rose-500'}`}>{q.rate}%</span>
                  <div className="flex gap-3 text-slate-500">
                    <button className="hover:text-brand-600 flex items-center gap-1"><Eye className="w-3 h-3" /> 预览</button>
                    <button onClick={() => togglePick(q.idx)} className={`flex items-center gap-1 ${picked[q.idx] ? 'text-brand-600' : 'hover:text-brand-600'}`}>
                      <FilePlus className="w-3 h-3" /> {picked[q.idx] ? '已加入' : '加入组卷'}
                    </button>
                    <button onClick={() => toggleFav(q.idx)} className={`flex items-center gap-1 ${favorites[q.idx] ? 'text-amber-500' : 'hover:text-amber-500'}`}>
                      <Star className={`w-3 h-3 ${favorites[q.idx] ? 'fill-amber-400' : ''}`} /> {favorites[q.idx] ? '已收藏' : '收藏'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 flex items-center justify-between bg-slate-50/60 text-sm border-t border-slate-100">
            <div className="text-slate-600">
              已选 <span className="text-brand-600 font-semibold">{pickedCount}</span> 题 ·
              预计用时 <span className="text-brand-600 font-semibold">18 分钟</span> ℹ
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearPicked} disabled={pickedCount === 0} className="btn-ghost h-8 disabled:opacity-40 disabled:cursor-not-allowed">清空已选</button>
              <button disabled={pickedCount === 0} className="btn-ghost h-8 disabled:opacity-40 disabled:cursor-not-allowed">加入组卷篮</button>
              <button disabled={pickedCount === 0} className="btn-primary h-8 disabled:opacity-40 disabled:cursor-not-allowed">导出所选题目</button>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧智能组卷 */}
      <div className="space-y-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-800">智能选题组卷</div>
            <button className="text-xs text-brand-600 hover:underline">ⓘ 使用指南</button>
          </div>

          <FormRow label="教学章节" value="8.2 一元一次不等式（第1课时）" />
          <FormRow label="知识点" value={<span className="pill bg-brand-50 text-brand-600">一元一次不等式的解法 ×</span>} />

          <div className="border-t border-slate-100 my-3" />

          <div className="space-y-2.5">
            <div className="text-sm text-slate-700">题型比例
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 text-xs">
                {Object.keys(typeRatio).map((k, i) => (
                  <PctChk
                    key={k}
                    label={k}
                    pct={['40%', '30%', '30%'][i]}
                    on={typeRatio[k]}
                    onClick={() => setTypeRatio({ ...typeRatio, [k]: !typeRatio[k] })}
                  />
                ))}
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5">共 100%</div>
            </div>

            <div className="text-sm text-slate-700 pt-2">难度比例
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 text-xs">
                {Object.keys(diffRatio).map((k, i) => (
                  <PctChk
                    key={k}
                    label={k}
                    pct={['30%', '50%', '20%'][i]}
                    on={diffRatio[k]}
                    onClick={() => setDiffRatio({ ...diffRatio, [k]: !diffRatio[k] })}
                  />
                ))}
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5">共 100%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <NumberInput label="题量" value={count} unit="题" onMinus={() => setCount(c => Math.max(1, c - 1))} onPlus={() => setCount(c => c + 1)} />
            <NumberInput label="目标时长" value={duration} unit="分钟" onMinus={() => setDuration(d => Math.max(1, d - 1))} onPlus={() => setDuration(d => d + 1)} />
          </div>

          <button className="btn-primary w-full mt-4">+ 生成推荐试卷</button>
        </div>

        {/* 推荐试卷 */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-800">推荐试卷 A</div>
            <button className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
              <RefreshCw className="w-3 h-3" /> 换一卷
            </button>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-3 mb-3">
            <div className="relative w-[100px] h-[100px]">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4"
                  strokeDasharray="80,100" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] text-slate-500">知识点覆盖</div>
                <div className="text-lg font-bold text-emerald-600">92%</div>
              </div>
            </div>
            <div className="text-xs space-y-1.5">
              <Bar label="不等式的解法" pct={60} />
              <Bar label="解集的表示" pct={20} />
              <Bar label="实际应用" pct={12} />
              <Bar label="综合应用" pct={8} />
            </div>
          </div>

          <div className="border border-slate-100 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-500">✓</span>
              <span className="text-slate-700">重复率检测</span>
              <span className="ml-auto text-emerald-600 font-semibold">重复率 3%</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">低重复风险</div>
            <div className="text-xs text-slate-600 mt-2 flex items-center justify-between">
              <span>相似题预警</span>
              <span className="text-brand-600">1 题  查看详情 ›</span>
            </div>
          </div>

          <div className="text-sm text-slate-700 mb-1">试卷结构预览</div>
          <div className="text-xs text-slate-500 mb-2">选择题 7 题 (38.9%)　填空题 5 题 (27.8%)　解答题 6 题 (33.3%)</div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-700">预计用时: <span className="text-brand-600 font-semibold">34 分钟</span></span>
            <button className="btn-ghost h-8">预览试卷</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ label, value, expand }) {
  return (
    <div className="flex flex-col">
      <span className="label mb-1">{label}</span>
      <button className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 flex items-center justify-between hover:border-brand-300">
        <span className={value ? '' : 'text-slate-400'}>{value || '请选择'}</span>
        <svg className="w-3 h-3 text-slate-400" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" /></svg>
      </button>
    </div>
  )
}

function FormRow({ label, value }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm py-2">
      <span className="text-slate-500">{label}</span>
      <div className="text-slate-800">{value}</div>
    </div>
  )
}

function PctChk({ label, pct, on, onClick }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none" onClick={(e) => { if (onClick) { e.preventDefault(); onClick() } }}>
      <input type="checkbox" className="accent-brand-600 pointer-events-none" checked={!!on} readOnly />
      <span className="text-slate-700">{label}</span>
      <span className="text-slate-400">{pct}</span>
    </label>
  )
}

function NumberInput({ label, value, unit, onMinus, onPlus }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
        <button onClick={onMinus} className="w-7 h-9 text-slate-500 hover:bg-slate-50">−</button>
        <input value={value} readOnly className="flex-1 h-9 text-center text-sm outline-none w-0" />
        <button onClick={onPlus} className="w-7 h-9 text-slate-500 hover:bg-slate-50">+</button>
        <span className="px-2 text-xs text-slate-400">{unit}</span>
      </div>
    </div>
  )
}

function Bar({ label, pct }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-600 w-20 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-500 text-[11px] w-7 text-right">{pct}%</span>
    </div>
  )
}
