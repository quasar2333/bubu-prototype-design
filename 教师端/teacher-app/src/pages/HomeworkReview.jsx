import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight, Search, ZoomIn, ZoomOut, RotateCw, FileText, ChevronLeft,
  Play, Pause, SkipBack, SkipForward, Check, MessageCircle, Save, AlertCircle
} from 'lucide-react'

const students = [
  { id: 10101, name: '李明阳', status: '待批阅', color: 'amber', current: true },
  { id: 10102, name: '王思涵', status: '已批阅', color: 'emerald' },
  { id: 10103, name: '张子涵', status: '待批阅', color: 'amber' },
  { id: 10104, name: '陈宇航', status: '已批阅', color: 'emerald' },
  { id: 10106, name: '赵天宇', status: '已批阅', color: 'emerald' },
  { id: 10108, name: '吴佳琪', status: '待批阅', color: 'amber' },
  { id: 10109, name: '黄梓豪', status: '已批阅', color: 'emerald' }
]

const statusBg = {
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700'
}

const evaluations = [
  ['思路清晰', '步骤规范', '计算准确', '表达完整'],
  ['部分正确', '概念错误', '计算错误', '步骤缺失'],
  ['方法不当', '书写凌乱']
]

export default function HomeworkReview() {
  const [leftTab, setLeftTab] = useState('学生') // 学生 | 题目
  const [rightTab, setRightTab] = useState('批注') // 批注 | 评语 | 分析
  const [statusFilter, setStatusFilter] = useState('全部') // 全部 | 待批 | 已批
  const [keyword, setKeyword] = useState('')
  const [activeStudentId, setActiveStudentId] = useState(10101)
  const [score, setScore] = useState(8)
  const [evalSelected, setEvalSelected] = useState(new Set(['思路清晰']))
  const [rubric, setRubric] = useState({
    '分类讨论完整 (Δ>0, =0, >0)': true,
    '相应的求解过程': true,
    '解集表述完整': true,
    '结论归纳完整': false
  })

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (statusFilter !== '全部') {
        const map = { '待批': '待批阅', '已批': '已批阅' }
        if (s.status !== map[statusFilter]) return false
      }
      if (keyword.trim() && !s.name.includes(keyword.trim()) && !String(s.id).includes(keyword.trim())) return false
      return true
    })
  }, [statusFilter, keyword])

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0]
  const activeIdx = filteredStudents.findIndex(s => s.id === activeStudentId)
  const goPrev = () => { if (activeIdx > 0) setActiveStudentId(filteredStudents[activeIdx - 1].id) }
  const goNext = () => { if (activeIdx >= 0 && activeIdx < filteredStudents.length - 1) setActiveStudentId(filteredStudents[activeIdx + 1].id) }

  const toggleEval = (e) => {
    const ns = new Set(evalSelected)
    ns.has(e) ? ns.delete(e) : ns.add(e)
    setEvalSelected(ns)
  }
  const toggleRubric = (k) => setRubric({ ...rubric, [k]: !rubric[k] })
  const totalRubric = Object.values(rubric).filter(Boolean).length

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="px-6 py-3 text-xs text-slate-500 flex items-center gap-1.5">
        <Link to="/homework" className="hover:text-brand-600">作业批阅</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700">精细化步骤批改</span>
      </div>

      <div className="flex-1 grid grid-cols-[260px_1fr_320px] gap-3 px-6 pb-6 min-h-0">
        {/* 左侧学生列表 */}
        <div className="card p-3 flex flex-col">
          <div className="flex border-b border-slate-100 -mt-1 -mx-1 mb-3">
            {['学生', '题目'].map(t => (
              <button
                key={t}
                onClick={() => setLeftTab(t)}
                className={`flex-1 py-2 text-sm ${leftTab === t ? 'text-brand-600 border-b-2 border-brand-600 font-medium' : 'text-slate-500'}`}
              >按{t}</button>
            ))}
          </div>
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-8 w-full"
              placeholder="搜索学生姓名 / 学号"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex gap-1 mb-2 text-xs">
            {[['全部', 42], ['待批', 18], ['已批', 24]].map(([t, n]) => (
              <FilterPill key={t} on={statusFilter === t} onClick={() => setStatusFilter(t)}>{t} ({n})</FilterPill>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto -mx-1">
            {filteredStudents.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">无匹配的学生</div>
            )}
            {filteredStudents.map(s => {
              const isActive = s.id === activeStudentId
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveStudentId(s.id)}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${isActive ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                >
                  <input type="radio" name="stu" checked={isActive} readOnly className="accent-brand-600 pointer-events-none" />
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 text-white text-xs flex items-center justify-center">{s.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-800">{s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.id}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-slate-100 mt-2 pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>共 42 人</span>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 hover:bg-slate-100 rounded flex items-center justify-center"><ChevronLeft className="w-3 h-3" /></button>
              <span>1/5</span>
              <button className="w-6 h-6 hover:bg-slate-100 rounded flex items-center justify-center"><ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>
        </div>

        {/* 中间作答区 */}
        <div className="card p-4 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-3 text-sm">
            <div className="text-slate-600">
              <span>作业：一元二次不等式（第1课时）</span>
              <div className="text-xs text-slate-400 mt-1">题目：已知 x &gt; 0，解不等式 ax² − 4x + 3 &gt; 0。</div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button className="btn-ghost h-7 px-2"><ChevronLeft className="w-3 h-3" /> 上一题</button>
              <span className="text-slate-600">第 8 题 / 共 12 题</span>
              <button className="btn-ghost h-7 px-2">下一题 <ChevronRight className="w-3 h-3" /></button>
              <button className="btn-ghost h-7 px-2">切换题目</button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 mb-3">
            <span className="text-slate-700">{activeStudent.name} {activeStudent.id} 的作答</span>
            <span className="text-xs text-slate-400">提交时间: 2026-05-16 10:23</span>
          </div>

          {/* 作答内容区 */}
          <div className="flex-1 grid grid-rows-[1fr_auto_auto] gap-2 min-h-0">
            <div className="relative bg-amber-50/30 border border-amber-100 rounded-lg p-5 overflow-auto">
              <pre className="text-sm font-serif leading-relaxed text-slate-700 whitespace-pre-wrap">{`解  ax² − 4x + 3 > 0
  Δ = b² − 4ac = 16 − 12a

① 当 Δ < 0，即 a > 4/3 时，二次函数开口向上，
   不与 x 轴相交，故 ax² − 4x + 3 > 0 恒成立。

② 当 Δ = 0，即 a = 4/3 时，ax² − 4x + 3 = (x − a/2)²,
   故 ax² − 4x + 3 ≥ 0 恒成立。

③ 当 Δ > 0，即 a < 4/3 时，x₁ = (1−√(1−3a))/a, x₂ = (1+√(1−3a))/a,
   由图像可知不等式的解集为 (−∞,x₁) ∪ (x₂,+∞)。

综上：当 a ≥ 4/3 时，解集如上；当 a < 4/3 时，恒成立。`}</pre>
              <div className="absolute right-2 top-2 bg-white rounded-md shadow-soft border border-slate-100 flex flex-col text-slate-500">
                <button className="w-8 h-8 hover:bg-slate-50 flex items-center justify-center"><ZoomIn className="w-4 h-4" /></button>
                <button className="w-8 h-8 hover:bg-slate-50 flex items-center justify-center"><ZoomOut className="w-4 h-4" /></button>
                <button className="w-8 h-8 hover:bg-slate-50 flex items-center justify-center"><RotateCw className="w-4 h-4" /></button>
                <button className="w-8 h-8 hover:bg-slate-50 flex items-center justify-center"><FileText className="w-4 h-4" /></button>
              </div>
              <div className="absolute right-2 bottom-2 text-[10px] text-slate-400">书写区域识别率：92%</div>
            </div>

            {/* 标准答案 */}
            <details className="border border-slate-100 rounded p-3 text-xs">
              <summary className="text-slate-600 cursor-pointer flex items-center justify-between">
                <span>标准答案 (参考)</span>
                <span className="text-brand-600 hover:underline">展开全部 ›</span>
              </summary>
            </details>
          </div>

          {/* 笔迹回放 + 操作 */}
          <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>笔迹回放</span>
              <SkipBack className="w-3.5 h-3.5" />
              <Play className="w-3.5 h-3.5 text-brand-600" />
              <Pause className="w-3.5 h-3.5" />
              <SkipForward className="w-3.5 h-3.5" />
              <div className="flex-1 h-1 bg-slate-100 rounded-full"><div className="h-full bg-brand-500 rounded-full w-1/3" /></div>
              <span>1.0x</span>
              <span>00:00 / 03:21</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={goPrev} disabled={activeIdx <= 0} className="btn-ghost h-8 text-xs disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="w-3 h-3" /> 上一人</button>
              <button className="btn-ghost h-8 text-xs"><Check className="w-3 h-3" /> 设为正确</button>
              <button className="btn-ghost h-8 text-xs"><MessageCircle className="w-3 h-3" /> 添加批注</button>
              <button onClick={goNext} disabled={activeIdx < 0 || activeIdx >= filteredStudents.length - 1} className="btn-primary h-8 text-xs disabled:opacity-40 disabled:cursor-not-allowed">下一人 <ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>
        </div>

        {/* 右侧批注面板 */}
        <div className="card p-4 flex flex-col overflow-y-auto">
          <div className="flex border-b border-slate-100 -mt-1 -mx-1 mb-3">
            {['批注', '评语', '分析'].map(t => (
              <button
                key={t}
                onClick={() => setRightTab(t)}
                className={`flex-1 py-2 text-sm ${rightTab === t ? 'border-b-2 border-brand-600 text-brand-600 font-medium' : 'text-slate-500'}`}
              >{t}</button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-slate-600">得分</span>
            <div className="flex-1 flex items-center border border-slate-200 rounded-md overflow-hidden bg-white">
              <button onClick={() => setScore(s => Math.max(0, s - 1))} className="w-8 h-9 text-slate-500 hover:bg-slate-50">−</button>
              <input value={score} onChange={e => setScore(Math.max(0, Math.min(10, +e.target.value || 0)))} className="flex-1 text-center text-xl font-bold text-brand-600 outline-none w-0 h-9" />
              <button onClick={() => setScore(s => Math.min(10, s + 1))} className="w-8 h-9 text-slate-500 hover:bg-slate-50">+</button>
            </div>
            <span className="text-sm text-slate-500">/10 分</span>
          </div>

          <div className="text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
            常用评语<button className="text-xs text-brand-600 hover:underline">管理</button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {evaluations.flat().map((e, i) => {
              const sel = evalSelected.has(e)
              return (
                <button
                  key={i}
                  onClick={() => toggleEval(e)}
                  className={`px-2 py-1 rounded text-xs transition ${sel ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >{e}</button>
              )
            })}
          </div>

          <div className="text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
            评分量规 <span className="text-xs text-slate-400">(点选添加)</span><button className="text-xs text-brand-600">收起</button>
          </div>
          <div className="space-y-1.5 mb-3 text-xs">
            {[
              ['分类讨论完整 (Δ>0, =0, >0)', 3],
              ['相应的求解过程', 2],
              ['解集表述完整', 2],
              ['结论归纳完整', 2]
            ].map(([label, pt]) => (
              <RubricRow key={label} label={label} pt={pt} on={rubric[label]} onClick={() => toggleRubric(label)} />
            ))}
          </div>
          <div className="text-[10px] text-slate-400 mb-2">已选 {totalRubric} / 4 项量规</div>

          <div className="border border-amber-100 bg-amber-50 rounded-lg p-3 text-xs">
            <div className="flex items-center gap-1.5 text-amber-700 font-medium mb-1">
              <AlertCircle className="w-3.5 h-3.5" /> 可疑步骤提醒 (1处) <span className="ml-auto text-brand-600 hover:underline">查看标注</span>
            </div>
            <div className="text-slate-600 leading-snug">第3步：解集区间端点书写存在可疑标记，建议结合图像或结合下文确认。</div>
          </div>

          <button className="btn-primary mt-4 mb-2">保存批阅</button>
          <div className="text-xs text-emerald-600 text-center">✓ 自动保存已开启</div>
        </div>
      </div>
    </div>
  )
}

function FilterPill({ children, on, onClick }) {
  return (
    <button onClick={onClick} className={`px-2 py-0.5 rounded transition ${on ? 'bg-brand-50 text-brand-600 font-medium' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{children}</button>
  )
}

function RubricRow({ label, pt, on, onClick }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none" onClick={(e) => { if (onClick) { e.preventDefault(); onClick() } }}>
      <input type="checkbox" checked={!!on} readOnly className="accent-brand-600 pointer-events-none" />
      <span className="flex-1 text-slate-700">{label}</span>
      <span className="text-slate-400">{pt}分</span>
    </label>
  )
}

