import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, Search, Check, ClipboardList,
  AlertCircle, MessageSquareText, Save
} from 'lucide-react'
import { getReviewContext, getErrorAnalysis, gradeSubmission } from '../data/homeworkStore.js'

const STATUS_FILTERS = ['全部', '待批', '已批', '未提交']
const COMMENTS = ['步骤规范', '计算准确', '思路清晰', '书写工整', '注意小数点对齐', '商的小数点要定位', '余数处理要规范', '订正后重做']

export default function HomeworkReview() {
  const { pubId } = useParams()
  const [ctx, setCtx] = useState(() => (pubId ? getReviewContext(pubId) : null))
  const [leftTab, setLeftTab] = useState('学生')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [keyword, setKeyword] = useState('')
  const [activeId, setActiveId] = useState(() => ctx?.students.find(s => s.submitted)?.id || null)
  const [scoreDraft, setScoreDraft] = useState(0)
  const [comments, setComments] = useState(() => new Set())
  const [toast, setToast] = useState('')

  const students = ctx?.students || []
  const activeStudent = students.find(s => s.id === activeId) || null
  const maxScore = ctx?.maxScore || 0

  const counts = useMemo(() => ({
    全部: students.length,
    待批: students.filter(s => s.status === '待批').length,
    已批: students.filter(s => s.status === '已批').length,
    未提交: students.filter(s => !s.submitted).length
  }), [students])

  const filteredStudents = useMemo(() => students.filter(s => {
    if (statusFilter === '待批' && s.status !== '待批') return false
    if (statusFilter === '已批' && s.status !== '已批') return false
    if (statusFilter === '未提交' && s.submitted) return false
    if (keyword.trim() && !s.name.includes(keyword.trim()) && !String(s.no).includes(keyword.trim())) return false
    return true
  }), [students, statusFilter, keyword])

  const analysis = useMemo(() => (pubId ? getErrorAnalysis(pubId) : null), [pubId, ctx])

  // 切换学生时载入该生的得分与评语建议
  useEffect(() => {
    if (!activeStudent) return
    const suggested = activeStudent.answers.reduce((s, a) => s + (a.score || 0), 0)
    setScoreDraft(activeStudent.score != null ? activeStudent.score : suggested)
    setComments(new Set())
  }, [activeId, ctx])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }
  const idx = filteredStudents.findIndex(s => s.id === activeId)
  const goPrev = () => { if (idx > 0) setActiveId(filteredStudents[idx - 1].id) }
  const goNext = () => { if (idx >= 0 && idx < filteredStudents.length - 1) setActiveId(filteredStudents[idx + 1].id) }
  const toggleComment = (c) => setComments(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n })

  const save = (autoNext = true) => {
    if (!activeStudent?.submitted) { showToast('该学生尚未提交'); return }
    const next = gradeSubmission(pubId, activeStudent.id, scoreDraft)
    setCtx(next)
    showToast('已保存批阅，进度已更新')
    if (autoNext) {
      const pending = next.students.find(s => s.submitted && s.status === '待批')
      if (pending) setActiveId(pending.id)
    }
  }

  if (!ctx) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center">
        <ClipboardList className="w-12 h-12 text-slate-300 mb-3" />
        <div className="text-slate-700 font-medium">请从作业列表进入批阅</div>
        <div className="text-xs text-slate-400 mt-1">在「作业 · 已发布（待批阅）」中点击某个班级的「批阅」</div>
        <Link to="/homework" className="btn-primary h-9 px-5 mt-4">去作业列表</Link>
      </div>
    )
  }

  const allGraded = ctx.submit > 0 && ctx.graded >= ctx.submit

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="px-6 py-3 text-xs text-slate-500 flex items-center gap-1.5">
        <Link to="/homework" className="hover:text-brand-600">作业</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700">批阅 · {ctx.name} · {ctx.className}</span>
        <span className="ml-3 text-slate-400">提交 {ctx.submit}/{ctx.roster} · 已批 {ctx.graded}/{ctx.submit}</span>
        {allGraded && (
          <Link to={`/lecture-gen/${pubId}`} className="ml-auto text-brand-600 hover:underline flex items-center gap-1">
            <MessageSquareText className="w-3.5 h-3.5" /> 本班已批阅完成，去讲评
          </Link>
        )}
      </div>

      <div className="flex-1 grid grid-cols-[260px_1fr_320px] gap-3 px-6 pb-6 min-h-0">
        {/* 左侧：学生 / 题目 */}
        <div className="card p-3 flex flex-col">
          <div className="flex border-b border-slate-100 -mt-1 -mx-1 mb-3">
            {['学生', '题目'].map(t => (
              <button key={t} onClick={() => setLeftTab(t)}
                className={`flex-1 py-2 text-sm ${leftTab === t ? 'text-brand-600 border-b-2 border-brand-600 font-medium' : 'text-slate-500'}`}>按{t}</button>
            ))}
          </div>

          {leftTab === '学生' ? (
            <>
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-8 w-full" placeholder="搜索学生姓名 / 学号" value={keyword} onChange={e => setKeyword(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-1 mb-2 text-xs">
                {STATUS_FILTERS.map(t => (
                  <FilterPill key={t} on={statusFilter === t} onClick={() => setStatusFilter(t)}>{t} ({counts[t]})</FilterPill>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto -mx-1">
                {filteredStudents.length === 0 && <div className="py-8 text-center text-xs text-slate-400">无匹配的学生</div>}
                {filteredStudents.map(s => {
                  const isActive = s.id === activeId
                  const dot = s.status === '已批' ? 'bg-emerald-500' : s.submitted ? 'bg-amber-500' : 'bg-slate-300'
                  return (
                    <div key={s.id} onClick={() => setActiveId(s.id)}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${isActive ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 text-white text-xs flex items-center justify-center">{s.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-800 truncate">{s.name}</div>
                        <div className="text-[10px] text-slate-400">{s.no} · {s.status}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-slate-100 mt-2 pt-2 text-xs text-slate-500">
                共 {ctx.roster} 人 · 已提交 {ctx.submit} · 待批 {counts.待批}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto -mx-1 space-y-2">
              {(analysis?.byQuestion || []).map((q, i) => (
                <div key={q.id} className="p-2 rounded-md hover:bg-slate-50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700">第{i + 1}题 · {q.type}</span>
                    <span className={q.accuracy >= 80 ? 'text-emerald-600' : q.accuracy >= 60 ? 'text-amber-600' : 'text-rose-500'}>正确率 {q.accuracy}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${q.accuracy >= 80 ? 'bg-emerald-500' : q.accuracy >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${q.accuracy}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">{q.kp} · 错 {q.wrong}/{q.total} 人</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 中间：作答区 */}
        <div className="card p-4 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-3 text-sm">
            <div className="text-slate-700">作业：{ctx.name}<span className="text-xs text-slate-400 ml-2">{ctx.className} · 共 {ctx.items.length} 题</span></div>
            <div className="flex items-center gap-2 text-xs">
              <button onClick={goPrev} disabled={idx <= 0} className="btn-ghost h-7 px-2 disabled:opacity-40"><ChevronLeft className="w-3 h-3" /> 上一人</button>
              <span className="text-slate-600">{idx >= 0 ? idx + 1 : '-'} / {filteredStudents.length}</span>
              <button onClick={goNext} disabled={idx < 0 || idx >= filteredStudents.length - 1} className="btn-ghost h-7 px-2 disabled:opacity-40">下一人 <ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>

          {!activeStudent ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400">请选择左侧学生</div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 mb-3">
                <span className="text-slate-700">{activeStudent.name} <span className="text-slate-400">{activeStudent.no}</span> 的作答</span>
                <span className="text-xs text-slate-400">{activeStudent.submitted ? `提交时间: ${activeStudent.submittedAt}` : '未提交'}</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {!activeStudent.submitted && (
                  <div className="py-16 text-center text-sm text-slate-400">该学生尚未提交作业</div>
                )}
                {activeStudent.submitted && ctx.items.map((it, i) => {
                  const ans = activeStudent.answers.find(a => a.qid === it.id) || {}
                  return (
                    <div key={it.id} className={`rounded-lg border p-3 ${ans.correct ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm text-slate-800 leading-relaxed min-w-0">
                          <span className="font-medium text-slate-500 mr-1">{i + 1}.</span>{it.stem}
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium ${ans.correct ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {ans.correct ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {ans.score}/{it.score} 分
                        </span>
                      </div>
                      {it.lines?.map((l, li) => (
                        <div key={li} className="text-[13px] text-slate-500 mt-1 font-mono whitespace-pre-wrap">{l}</div>
                      ))}
                      {!ans.correct && ans.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {ans.tags.map(t => <span key={t} className="pill bg-rose-50 text-rose-600">{t}</span>)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-slate-100 pt-3 mt-3 grid grid-cols-3 gap-2">
                <button onClick={() => setScoreDraft(maxScore)} className="btn-ghost h-9 text-xs"><Check className="w-3.5 h-3.5" /> 判为全对（{maxScore}分）</button>
                <button onClick={() => save(false)} className="btn-ghost h-9 text-xs"><Save className="w-3.5 h-3.5" /> 保存当前</button>
                <button onClick={() => save(true)} className="btn-primary h-9 text-xs">保存并下一人 <ChevronRight className="w-3 h-3" /></button>
              </div>
            </>
          )}
        </div>

        {/* 右侧：评分与反馈 */}
        <div className="card p-4 flex flex-col overflow-y-auto">
          <div className="text-sm font-semibold text-slate-800 mb-3">评分与反馈</div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-slate-600">得分</span>
            <div className="flex-1 flex items-center border border-slate-200 rounded-md overflow-hidden bg-white">
              <button onClick={() => setScoreDraft(s => Math.max(0, s - 1))} className="w-8 h-9 text-slate-500 hover:bg-slate-50">−</button>
              <input value={scoreDraft} onChange={e => setScoreDraft(Math.max(0, Math.min(maxScore, +e.target.value || 0)))} className="flex-1 text-center text-xl font-bold text-brand-600 outline-none w-0 h-9" />
              <button onClick={() => setScoreDraft(s => Math.min(maxScore, s + 1))} className="w-8 h-9 text-slate-500 hover:bg-slate-50">+</button>
            </div>
            <span className="text-sm text-slate-500">/{maxScore} 分</span>
          </div>

          {activeStudent?.score != null && (
            <div className="text-xs text-emerald-600 mb-3">该生已批阅，得分 {activeStudent.score} 分，可修改后重新保存。</div>
          )}

          <div className="text-sm font-medium text-slate-700 mb-2">常用评语</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {COMMENTS.map(c => (
              <button key={c} onClick={() => toggleComment(c)}
                className={`px-2 py-1 rounded text-xs transition ${comments.has(c) ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{c}</button>
            ))}
          </div>

          {activeStudent?.submitted && (
            <div className="border border-amber-100 bg-amber-50 rounded-lg p-3 text-xs mb-4">
              <div className="flex items-center gap-1.5 text-amber-700 font-medium mb-1">
                <AlertCircle className="w-3.5 h-3.5" /> 错题与错因
              </div>
              {(() => {
                const wrong = activeStudent.answers.filter(a => !a.correct)
                if (wrong.length === 0) return <div className="text-slate-600">本次作答全部正确，表现优秀。</div>
                return (
                  <div className="text-slate-600 leading-snug space-y-1">
                    {wrong.map((a, i) => {
                      const it = ctx.items.find(x => x.id === a.qid)
                      const no = ctx.items.findIndex(x => x.id === a.qid) + 1
                      return <div key={i}>第{no}题（{it?.kp}）：{a.tags?.join('、') || '需订正'}</div>
                    })}
                  </div>
                )
              })()}
            </div>
          )}

          <div className="mt-auto pt-2">
            <button onClick={() => save(false)} disabled={!activeStudent?.submitted} className="btn-primary w-full disabled:opacity-40"><Save className="w-4 h-4" /> 保存批阅</button>
            <div className="text-xs text-slate-400 text-center mt-2">保存后将更新列表的「已批 X/Y」进度</div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 top-16 z-[60] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">✓ {toast}</div>
      )}
    </div>
  )
}

function FilterPill({ children, on, onClick }) {
  return (
    <button onClick={onClick} className={`px-2 py-0.5 rounded transition ${on ? 'bg-brand-50 text-brand-600 font-medium' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{children}</button>
  )
}

