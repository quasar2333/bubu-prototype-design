import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight, FileText, Search, Plus, ChevronDown, Clock,
  CheckCircle2, BookOpen, Layers, AlertCircle, Trash2, Send
} from 'lucide-react'

const QUESTION_SOURCES = ['智能题库', '课件选题', '手动录入']

const sampleQuestions = [
  { id: 1, text: '解不等式 4x − 5 ≤ 11，并在数轴上表示解集。', diff: '基础', kp: '一元一次不等式', type: '解答题', selected: true },
  { id: 2, text: '若 −2x > 8，则 x 的取值范围是什么？', diff: '基础', kp: '不等式性质', type: '选择题', selected: true },
  { id: 3, text: '某商品原价 x 元，满减后不超过 50 元，请列出不等式。', diff: '中档', kp: '实际应用', type: '解答题', selected: true },
  { id: 4, text: '解不等式 3(2x − 1) > 4x + 5，写出每一步依据。', diff: '中档', kp: '一元一次不等式', type: '解答题', selected: true },
  { id: 5, text: '比较 x > 2 与 x ≥ 2 在数轴表示上的差异。', diff: '中档', kp: '数轴表示', type: '简答题', selected: false },
  { id: 6, text: '已知 a > b，比较 −3a 与 −3b 的大小，说明理由。', diff: '提高', kp: '不等式性质', type: '简答题', selected: false },
  { id: 7, text: '解不等式组 { 2x + 1 > 3, x − 2 ≤ 4 }，求整数解。', diff: '提高', kp: '不等式组', type: '解答题', selected: false },
  { id: 8, text: '若不等式 ax > b 的解集为 x < 2，求 a 的符号。', diff: '提高', kp: '不等式性质', type: '选择题', selected: false },
  { id: 9, text: '用不等式表示：x 与 5 的差不小于 3。', diff: '基础', kp: '不等式表达', type: '填空题', selected: false },
  { id: 10, text: '某校组织春游，每辆大巴限乘 45 人，共 328 人，需几辆车？列不等式求解。', diff: '中档', kp: '实际应用', type: '解答题', selected: false },
  { id: 11, text: '在数轴上表示 −1 < x ≤ 4 的解集。', diff: '基础', kp: '数轴表示', type: '作图题', selected: false },
  { id: 12, text: '若 x 满足 |x − 3| < 2，求 x 的整数解个数。', diff: '提高', kp: '不等式综合', type: '解答题', selected: false }
]

const diffBg = {
  '基础': 'bg-blue-50 text-blue-600',
  '中档': 'bg-amber-50 text-amber-600',
  '提高': 'bg-rose-50 text-rose-600'
}

export default function HomeworkLayered() {
  const [source, setSource] = useState('智能题库')
  const [questions, setQuestions] = useState(sampleQuestions)
  const [keyword, setKeyword] = useState('')
  const [dueDate, setDueDate] = useState('2026-05-18')
  const [dueTime, setDueTime] = useState('23:59')
  const [homeworkName, setHomeworkName] = useState('一元一次不等式课后练习')
  const [className, setClassName] = useState('初二(3)班')
  const [remindBefore, setRemindBefore] = useState('24h')
  const [allowLate, setAllowLate] = useState(true)
  const [showAnswer, setShowAnswer] = useState(true)
  const [showToast, setShowToast] = useState(false)

  const selectedQuestions = questions.filter(q => q.selected)
  const totalTime = selectedQuestions.reduce((sum, q) => {
    const base = q.diff === '基础' ? 2 : q.diff === '中档' ? 3 : 5
    return sum + base
  }, 0)
  const diffCount = { '基础': 0, '中档': 0, '提高': 0 }
  selectedQuestions.forEach(q => { diffCount[q.diff]++ })

  const toggleQuestion = (id) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, selected: !q.selected } : q))
  }

  const filteredQuestions = questions.filter(q => {
    if (keyword.trim() && !q.text.includes(keyword.trim()) && !q.kp.includes(keyword.trim())) return false
    return true
  })

  const handlePublish = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <Link to="/homework" className="hover:text-brand-600">作业布置</Link>
        <ChevronRight className="w-3 h-3" /> <span className="text-slate-700 font-medium">布置新作业</span>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-4">
              <FileText className="w-4 h-4 text-brand-600" /> 作业信息
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <div className="text-xs text-slate-500 mb-1">作业名称</div>
                <input
                  className="input w-full"
                  value={homeworkName}
                  onChange={e => setHomeworkName(e.target.value)}
                />
              </label>
              <label className="block">
                <div className="text-xs text-slate-500 mb-1">班级</div>
                <div className="input flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-800">{className}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </label>
              <label className="block">
                <div className="text-xs text-slate-500 mb-1">截止日期</div>
                <input
                  type="date"
                  className="input w-full"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </label>
              <label className="block">
                <div className="text-xs text-slate-500 mb-1">截止时间</div>
                <input
                  type="time"
                  className="input w-full"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="card">
            <div className="px-5 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <span className="text-sm font-semibold text-slate-800">选题区</span>
                  <span className="text-xs text-slate-400">共 {questions.length} 题</span>
                </div>
                <button className="btn-ghost h-7 px-2 text-xs">
                  <Plus className="w-3 h-3" /> 添加题目
                </button>
              </div>
              <div className="flex gap-1 mt-3">
                {QUESTION_SOURCES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSource(s)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${source === s ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'}`}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-8 w-full"
                  placeholder="搜索题目或知识点..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-[460px] overflow-y-auto">
              {filteredQuestions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">没有匹配的题目</div>
              ) : (
                filteredQuestions.map(q => (
                  <div
                    key={q.id}
                    onClick={() => toggleQuestion(q.id)}
                    className={`flex items-start gap-3 px-5 py-3 border-b border-slate-50 cursor-pointer transition ${q.selected ? 'bg-brand-50/40' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${q.selected ? 'bg-brand-500 border-brand-500' : 'border-slate-300 hover:border-brand-400'}`}>
                      {q.selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-800 leading-snug">{q.text}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`pill text-[10px] ${diffBg[q.diff]}`}>{q.diff}</span>
                        <span className="text-[10px] text-slate-400">{q.kp}</span>
                        <span className="text-[10px] text-slate-400">{q.type}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
              <Layers className="w-4 h-4 text-brand-600" /> 作业概览
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">已选题目</span>
                <span className="text-slate-800 font-semibold">{selectedQuestions.length} 题</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">预计时长</span>
                <span className="text-slate-800 font-semibold">约 {totalTime} 分钟</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">总分</span>
                <span className="text-slate-800 font-semibold">{selectedQuestions.length * 10} 分</span>
              </div>
            </div>

            {selectedQuestions.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <div className="text-xs text-slate-500">难度分布</div>
                {['基础', '中档', '提高'].map(d => (
                  <div key={d} className="flex items-center gap-2">
                    <span className={`pill text-[10px] ${diffBg[d]}`}>{d}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${d === '基础' ? 'bg-blue-400' : d === '中档' ? 'bg-amber-400' : 'bg-rose-400'}`}
                        style={{ width: `${(diffCount[d] / selectedQuestions.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{diffCount[d]}题</span>
                  </div>
                ))}
              </div>
            )}

            {selectedQuestions.length === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 text-xs text-slate-400 mb-3">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                请从左侧选题区勾选题目
              </div>
            )}

            {selectedQuestions.length > 0 && (
              <div className="space-y-1 mb-3 max-h-[160px] overflow-y-auto">
                <div className="text-xs text-slate-500">已选题目列表</div>
                {selectedQuestions.map(q => (
                  <div key={q.id} className="flex items-center gap-2 text-xs py-1">
                    <span className="w-4 h-4 rounded bg-brand-50 text-brand-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0">{q.id}</span>
                    <span className="text-slate-700 truncate">{q.text.slice(0, 24)}...</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleQuestion(q.id) }}
                      className="ml-auto w-5 h-5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-4">
            <div className="text-sm font-semibold text-slate-800 mb-3">发布设置</div>
            <ToggleRow label="提交后显示解析" sub="学生提交后可查看题目解析" on={showAnswer} toggle={() => setShowAnswer(!showAnswer)} />
            <div className="text-xs text-slate-500 mb-1 mt-2">截止前提醒</div>
            <div className="flex gap-1.5 mb-2">
              {['1h', '6h', '24h'].map(v => (
                <button
                  key={v}
                  onClick={() => setRemindBefore(v)}
                  className={`px-3 py-1 rounded text-xs transition ${remindBefore === v ? 'bg-brand-50 text-brand-600 font-medium' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >提前 {v}</button>
              ))}
            </div>
            <ToggleRow label="允许补交" sub="截止后 24 小时内可补交一次" on={allowLate} toggle={() => setAllowLate(!allowLate)} />
            <div className="text-xs text-slate-400 mt-2 leading-snug">通过站内信提醒学生</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-800">发布检查</span>
            </div>
            <RiskRow icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />} title="选题数量" value={`${selectedQuestions.length} 题`} right={selectedQuestions.length >= 3 ? '正常' : '偏少'} rightColor={selectedQuestions.length >= 3 ? 'text-emerald-600' : 'text-amber-500'} />
            <RiskRow icon={<Clock className="w-3.5 h-3.5 text-slate-400" />} title="预计时长" value={`${totalTime} 分钟`} right={totalTime <= 40 ? '合适' : '偏长'} rightColor={totalTime <= 40 ? 'text-emerald-600' : 'text-amber-500'} />
            <RiskRow icon={<Layers className="w-3.5 h-3.5 text-slate-400" />} title="班级人数" value="45 人" right="正常" rightColor="text-emerald-600" />
          </div>

          <div className="flex gap-2">
            <Link to="/homework" className="btn-ghost flex-1 h-10 text-xs">返回修改</Link>
            <button
              onClick={handlePublish}
              disabled={selectedQuestions.length === 0}
              className="btn-primary flex-1 h-10 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" /> 确认发布
            </button>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          ✓ 作业已发布！学生将收到站内信通知
        </div>
      )}
    </div>
  )
}

function ToggleRow({ label, sub, on, toggle }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <div className="flex-1">
        <div className="text-sm text-slate-700">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
      </div>
      <button
        onClick={toggle}
        className={`relative w-9 h-5 rounded-full transition mt-1 ${on ? 'bg-brand-500' : 'bg-slate-300'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

function RiskRow({ icon, title, value, right, rightColor }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-t border-slate-50 first:border-t-0 text-xs">
      {icon}
      <span className="text-slate-600 flex-1">{title}</span>
      <span className="text-slate-700 font-medium">{value}</span>
      <span className={`${rightColor}`}>{right}</span>
    </div>
  )
}
