import { Link } from 'react-router-dom'
import { ChevronRight, BarChart3, Target, Users, AlertCircle, Download, Save, Sparkles, Plus } from 'lucide-react'

const causes = [
  { rank: 1, name: '概念混淆', n: 23, pct: 51 },
  { rank: 2, name: '计算错误', n: 18, pct: 40 },
  { rank: 3, name: '解集表示错误', n: 15, pct: 33 },
  { rank: 4, name: '移项方向错误', n: 9, pct: 20 },
  { rank: 5, name: '审题遗漏', n: 7, pct: 16 }
]
const heat = [
  ['全班', 58, 54, 61, 64],
  ['A 层（优）', 68, 82, 91, 86],
  ['B 层（中）', 61, 55, 63, 59],
  ['C 层（待提升）', 28, 23, 31, 26]
]
const heatColor = (v) => v >= 80 ? 'bg-emerald-500 text-white' : v >= 60 ? 'bg-emerald-300/80 text-emerald-900' : v >= 40 ? 'bg-amber-300/80 text-amber-900' : 'bg-rose-400 text-white'

const typicalErr = [
  { id: 23, cause: '概念混淆', formula: '2(x − 3) = x + 5\n=> x + 8' },
  { id: 17, cause: '解集表示错误', formula: 'x − 2 ≤ 1\n   ≤ 1' },
  { id: 8, cause: '移项方向错误', formula: '2x + 3 > x − 5\n   x > −8' },
  { id: 31, cause: '审题遗漏', formula: '(x − 3) ≥ x + 5\n   x ≥ 5.5' }
]

const stepData = [
  { step: '第1步', name: '理解不等式', time: '26秒', rate: 92, cause: '主要错因' },
  { step: '第2步', name: '列不等式', time: '31秒', rate: 81, cause: '审题遗漏' },
  { step: '第3步', name: '解不等式', time: '47秒', rate: 63, cause: '概念混淆' },
  { step: '第4步', name: '表示解集', time: '38秒', rate: 48, cause: '解集表示错误' },
  { step: '第5步', name: '应用检验', time: '10秒', rate: 72, cause: '计算错误' }
]

const layerErrors = [
  { type: '概念混淆', a: 12, b: 46, c: 68 },
  { type: '计算错误', a: 8, b: 32, c: 57 },
  { type: '解集表示错误', a: 6, b: 28, c: 54 },
  { type: '移项方向错误', a: 4, b: 18, c: 42 },
  { type: '审题遗漏', a: 3, b: 14, c: 31 }
]

export default function ErrorAnalysis() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link to="/review" className="hover:text-brand-600">作业批阅</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700">错因分析</span>
        </div>
        <div className="flex gap-2">
          <Link to="/lecture-gen" className="btn-primary h-8"><Sparkles className="w-3 h-3" /> 生成讲评材料</Link>
          <button className="btn-ghost h-8"><Download className="w-3 h-3" /> 导出分析</button>
          <button className="btn-ghost h-8"><Save className="w-3 h-3" /> 保存为错因卡</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Stat color="brand" icon={<BarChart3 className="w-6 h-6" />} title="班级正确率" val="62%" sub="较上次 -6.3% ↓" subColor="text-red-500" />
        <Stat color="emerald" icon={<Target className="w-6 h-6" />} title="平均得分" val="1.24" suffix="/ 2分" sub="较上次 -0.28 ↓" subColor="text-red-500" />
        <Stat color="violet" icon={<Users className="w-6 h-6" />} title="提交率" val="91%" sub="已提交 41 / 45 人" subColor="text-slate-400" />
        <Stat color="red" icon={<AlertCircle className="w-6 h-6" />} title="高风险学生" val="8人" sub="正确率 < 40%" subColor="text-slate-400" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800">高频错因聚类</span>
            <a className="text-xs text-brand-600 hover:underline">查看详情 ›</a>
          </div>
          <div className="space-y-2">
            {causes.map(c => (
              <div key={c.rank} className="flex items-center gap-2 text-sm">
                <span className={`w-5 h-5 rounded text-white text-[10px] flex items-center justify-center font-bold ${c.rank === 1 ? 'bg-red-500' : c.rank === 2 ? 'bg-amber-500' : 'bg-slate-400'}`}>{c.rank}</span>
                <span className="w-24 text-slate-700 text-xs">{c.name}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${c.pct * 1.8}%` }} />
                </div>
                <span className="w-10 text-right text-slate-600 text-xs">{c.n}人</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-semibold text-slate-800 mb-3">知识点掌握热力图 <span className="text-xs text-slate-400 font-normal">(正确率%)</span></div>
          <div className="grid grid-cols-[1fr_repeat(4,1fr)] gap-1 text-center text-xs">
            <div></div>
            <div className="text-slate-500">一元一次<br />不等式</div>
            <div className="text-slate-500">解集</div>
            <div className="text-slate-500">数轴表示</div>
            <div className="text-slate-500">应用题</div>
            {heat.map((row, i) => (
              <div key={i} className="contents">
                <div className="text-slate-600 text-right py-2 flex items-center justify-end pr-1 text-xs">{row[0]}</div>
                {row.slice(1).map((v, j) => (
                  <div key={j} className={`py-2 ${heatColor(v)} rounded text-xs font-medium`}>{v}%</div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 text-[10px] flex-wrap">
            <Legend color="bg-emerald-500" label="≥80%" />
            <Legend color="bg-emerald-300/80" label="60~79" />
            <Legend color="bg-amber-300/80" label="40~59" />
            <Legend color="bg-rose-400" label="<40" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800">典型错答 <span className="text-xs text-slate-400 font-normal">(部分)</span></span>
            <a className="text-xs text-brand-600 hover:underline">查看更多 ›</a>
          </div>
          <div className="space-y-2 text-xs">
            {typicalErr.map(e => (
              <div key={e.id} className="border border-slate-100 rounded-lg p-2 hover:border-brand-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500">题目 {e.id}</span>
                  <span className="pill bg-rose-50 text-rose-600">{e.cause}</span>
                </div>
                <pre className="text-slate-700 font-mono text-xs bg-slate-50 rounded px-2 py-1.5 whitespace-pre-wrap">{e.formula}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部三栏 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 步骤分析 */}
        <div className="card p-4 col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800">作答过程分析 <span className="text-xs text-slate-400 font-normal">(各步骤平均)</span></span>
            <a className="text-xs text-brand-600 hover:underline">查看详细步骤数据 ›</a>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {stepData.map((s, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-3">
                <div className="text-slate-400 mb-1">{s.step}</div>
                <div className="text-sm text-slate-700 font-medium mb-2">{s.name}</div>
                <div className="text-[10px] text-slate-400 mb-1">平均用时 {s.time}</div>
                <div className={`text-2xl font-bold ${s.rate >= 80 ? 'text-emerald-600' : s.rate >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{s.rate}%</div>
                <div className="text-[10px] text-slate-400 mt-1">{s.cause}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs flex items-center justify-between">
            <span className="text-slate-500">建议关注：</span>
            <div className="flex gap-1.5">
              <span className="pill bg-rose-50 text-rose-600">第3步 解不等式 (63%)</span>
              <span className="pill bg-amber-50 text-amber-600">第4步 表示解集 (48%)</span>
            </div>
          </div>
        </div>

        {/* 分层差异 */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800">分层学生错因差异</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="text-left py-1 font-normal">错因</th>
                <th className="text-center py-1 font-normal text-red-500">A层</th>
                <th className="text-center py-1 font-normal text-emerald-600">B层</th>
                <th className="text-center py-1 font-normal text-amber-600">C层</th>
              </tr>
            </thead>
            <tbody>
              {layerErrors.map(l => (
                <tr key={l.type} className="border-b border-slate-50">
                  <td className="py-1.5 text-slate-700">{l.type}</td>
                  <td className="text-center text-slate-600">{l.a}%</td>
                  <td className="text-center text-slate-600">{l.b}%</td>
                  <td className="text-center text-rose-500 font-semibold">{l.c}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[10px] text-slate-400 mt-2">提示：不同层级学生在不同错因上的占比差异。</div>
        </div>
      </div>

      {/* 教学建议 */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-800">教学建议 <span className="text-xs text-slate-400 font-normal">由 AI 基于错因聚类分析自动生成</span></span>
          <button className="btn-ghost h-7"><Sparkles className="w-3 h-3 text-violet-500" /> 重新生成</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <SuggestCard color="brand" rank="1" title="重点讲解" desc="不等式两边同时除以负数时变号问题，建议安排专项讲解 + 微课视频" />
          <SuggestCard color="emerald" rank="2" title="补充练习" desc="数轴上解集表示规范化练习 (10 道)，建议布置课后作业巩固" />
          <SuggestCard color="amber" rank="3" title="个性化辅导" desc="对 8 名高风险学生进行一对一辅导，重点突破基础概念" />
        </div>
        <div className="flex justify-end mt-3">
          <button className="btn-primary h-9"><Plus className="w-3.5 h-3.5" /> 应用建议</button>
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

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`w-3 h-3 rounded ${color}`} />
      <span className="text-slate-500">{label}</span>
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

