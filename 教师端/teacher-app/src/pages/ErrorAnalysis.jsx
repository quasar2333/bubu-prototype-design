import { Link, useParams } from 'react-router-dom'
import { ChevronRight, BarChart3, Target, Users, AlertCircle, Download, Save, Sparkles, Plus, ClipboardList, ClipboardCheck } from 'lucide-react'
import { getReviewContext, getErrorAnalysis } from '../data/homeworkStore.js'

const accColor = (v) => v >= 80 ? 'bg-emerald-500' : v >= 60 ? 'bg-amber-400' : 'bg-rose-400'

export default function ErrorAnalysis() {
  const { pubId } = useParams()
  const ctx = pubId ? getReviewContext(pubId) : null
  const analysis = pubId ? getErrorAnalysis(pubId) : null

  if (!ctx || !analysis) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center">
        <ClipboardList className="w-12 h-12 text-slate-300 mb-3" />
        <div className="text-slate-700 font-medium">请从作业列表进入错因分析</div>
        <div className="text-xs text-slate-400 mt-1">在批阅页或「待讲评」的讲评页中可进入对应班级的错因分析</div>
        <Link to="/homework" className="btn-primary h-9 px-5 mt-4">去作业列表</Link>
      </div>
    )
  }

  const submitRate = ctx.roster ? Math.round((analysis.submitted / ctx.roster) * 100) : 0
  const causes = analysis.causes.map((c, i) => ({ ...c, rank: i + 1 }))
  const maxCause = causes[0]?.n || 1
  const typical = [...analysis.byQuestion].sort((a, b) => a.accuracy - b.accuracy).slice(0, 4)
  const suggestions = causes.slice(0, 3)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link to="/homework" className="hover:text-brand-600">作业</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700">错因分析 · {ctx.name} · {ctx.className}</span>
        </div>
        <div className="flex gap-2">
          <Link to={`/review/${pubId}`} className="btn-ghost h-8"><ClipboardCheck className="w-3 h-3" /> 去批阅</Link>
          <Link to={`/lecture-gen/${pubId}`} className="btn-primary h-8"><Sparkles className="w-3 h-3" /> 生成讲评材料</Link>
          <button className="btn-ghost h-8"><Download className="w-3 h-3" /> 导出分析</button>
          <button className="btn-ghost h-8"><Save className="w-3 h-3" /> 保存为错因卡</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Stat color="brand" icon={<BarChart3 className="w-6 h-6" />} title="班级正确率" val={`${analysis.correctRate}%`} sub={`基于 ${analysis.submitted} 份提交`} subColor="text-slate-400" />
        <Stat color="emerald" icon={<Target className="w-6 h-6" />} title="题目数" val={ctx.items.length} suffix="题" sub={`满分 ${ctx.maxScore} 分`} subColor="text-slate-400" />
        <Stat color="violet" icon={<Users className="w-6 h-6" />} title="提交率" val={`${submitRate}%`} sub={`已提交 ${analysis.submitted} / ${ctx.roster} 人`} subColor="text-slate-400" />
        <Stat color="red" icon={<AlertCircle className="w-6 h-6" />} title="高风险学生" val={`${analysis.highRisk}人`} sub="正确率 < 40%" subColor="text-slate-400" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800">高频错因聚类</span>
            <span className="text-xs text-slate-400">按出现人数排序</span>
          </div>
          {causes.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">本次作业暂无共性错误，整体掌握良好。</div>
          ) : (
            <div className="space-y-2">
              {causes.map(c => (
                <div key={c.name} className="flex items-center gap-2 text-sm">
                  <span className={`w-5 h-5 rounded text-white text-[10px] flex items-center justify-center font-bold ${c.rank === 1 ? 'bg-red-500' : c.rank === 2 ? 'bg-amber-500' : 'bg-slate-400'}`}>{c.rank}</span>
                  <span className="w-32 text-slate-700 text-xs truncate">{c.name}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${Math.round((c.n / maxCause) * 100)}%` }} />
                  </div>
                  <span className="w-10 text-right text-slate-600 text-xs">{c.n}人</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <div className="text-sm font-semibold text-slate-800 mb-3">逐题正确率</div>
          <div className="space-y-2">
            {analysis.byQuestion.map((q, i) => (
              <div key={q.id} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-slate-500 text-xs">{i + 1}</span>
                <span className="w-28 text-slate-600 text-xs truncate">{q.kp}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${accColor(q.accuracy)}`} style={{ width: `${q.accuracy}%` }} />
                </div>
                <span className="w-10 text-right text-slate-600 text-xs">{q.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-800">最需关注的题目 <span className="text-xs text-slate-400 font-normal">(正确率最低)</span></span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {typical.map((q, i) => (
            <div key={q.id} className="border border-slate-100 rounded-lg p-3 hover:border-brand-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">第 {analysis.byQuestion.findIndex(x => x.id === q.id) + 1} 题 · {q.type}</span>
                <span className={`pill ${q.accuracy >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600'}`}>{q.accuracy}%</span>
              </div>
              <div className="text-xs text-slate-700 line-clamp-3">{q.stem}</div>
              <div className="text-[10px] text-slate-400 mt-2">{q.kp} · 错 {q.wrong}/{q.total} 人</div>
            </div>
          ))}
        </div>
      </div>

      {/* 教学建议 */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-800">教学建议 <span className="text-xs text-slate-400 font-normal">由 AI 基于错因聚类分析自动生成</span></span>
          <button className="btn-ghost h-7"><Sparkles className="w-3 h-3 text-violet-500" /> 重新生成</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {suggestions.length === 0 && <div className="text-sm text-slate-400 col-span-3 py-6 text-center">整体表现良好，建议进行拓展提升训练。</div>}
          {suggestions.map((c, i) => (
            <SuggestCard
              key={c.name}
              color={['brand', 'emerald', 'amber'][i]}
              rank={String(i + 1)}
              title={['重点讲解', '补充练习', '个性化辅导'][i]}
              desc={i === 0 ? `针对「${c.name}」（${c.pct}%）安排专项讲解 + 竖式分步演示。`
                : i === 1 ? `配套「${c.name}」巩固练习 10 道，布置为课后订正作业。`
                : `对 ${analysis.highRisk} 名高风险学生，重点突破「${c.name}」基础。`}
            />
          ))}
        </div>
        <div className="flex justify-end mt-3">
          <Link to={`/lecture-gen/${pubId}`} className="btn-primary h-9"><Plus className="w-3.5 h-3.5" /> 应用到讲评</Link>
        </div>
      </div>
    </div>
  )
}

function Stat({ color, icon, title, val, suffix, sub, subColor }) {
  const cls = { brand: 'text-brand-600 bg-brand-50', emerald: 'text-emerald-600 bg-emerald-50', violet: 'text-violet-600 bg-violet-50', red: 'text-red-500 bg-red-50' }[color]
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl ${cls} flex items-center justify-center`}>{icon}</div>
      <div>
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-2xl font-bold text-slate-800 mt-0.5">{val} {suffix && <span className="text-sm font-normal text-slate-400">{suffix}</span>}</div>
        <div className={`text-xs ${subColor} mt-0.5`}>{sub}</div>
      </div>
    </div>
  )
}

function SuggestCard({ color, rank, title, desc }) {
  const cls = {
    brand: 'border-brand-200 bg-brand-50/40',
    emerald: 'border-emerald-200 bg-emerald-50/40',
    amber: 'border-amber-200 bg-amber-50/40'
  }[color]
  const ringCls = { brand: 'bg-brand-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500' }[color]
  return (
    <div className={`border rounded-xl p-3 ${cls}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-6 h-6 rounded-full ${ringCls} text-white text-xs flex items-center justify-center font-bold`}>{rank}</span>
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      <div className="text-xs text-slate-600 leading-snug">{desc}</div>
    </div>
  )
}

