import { Link } from 'react-router-dom'
import {
  AlertCircle,
  BarChart3,
  ChevronRight,
  Download,
  FileText,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Save,
  Sparkles,
  Target,
  Users
} from 'lucide-react'

const stats = [
  { title: '班级正确率', icon: BarChart3, color: 'brand', unit: '%', hint: '等待后端同步' },
  { title: '平均得分', icon: Target, color: 'emerald', unit: '/ 2分', hint: '等待后端同步' },
  { title: '提交率', icon: Users, color: 'violet', unit: '%', hint: '等待提交统计' },
  { title: '高风险学生', icon: AlertCircle, color: 'red', unit: '人', hint: '等待风险阈值计算' }
]

const sectionSkeletons = ['概念混淆', '计算错误', '解集表示错误', '移项方向错误', '审题遗漏']
const heatRows = ['全班', 'A层（优秀）', 'B层（中等）', 'C层（待提升）']
const heatCols = ['知识点1', '知识点2', '知识点3', '知识点4']
const stepLabels = ['第1步', '第2步', '第3步', '第4步', '第5步']

export default function ErrorAnalysis() {
  const dataStatus = 'waiting'

  return (
    <div className="min-h-full bg-[#f7faff] px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[22px] font-bold tracking-tight text-slate-900">T13 错因分析</div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Link to="/review" className="hover:text-brand-600">作业批阅</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-700">错因分析</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary h-9 opacity-60" disabled>
            <Sparkles className="h-4 w-4" /> 生成讲评材料
          </button>
          <button className="btn-ghost h-9 opacity-60" disabled>
            <Download className="h-4 w-4" /> 导出分析
          </button>
          <button className="btn-ghost h-9 opacity-60" disabled>
            <Save className="h-4 w-4" /> 保存为错因卡
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-dashed border-brand-200 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">等待后端错因分析数据同步</div>
              <div className="mt-0.5 text-xs text-slate-500">
                Stage 10 按 B6 要求只保留 UI 结构、loading 与空状态，不硬填 Mock 数值或 AI 结论。
              </div>
            </div>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            dataStatus: {dataStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((item) => (
          <StatPlaceholder key={item.title} {...item} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[1.15fr_1.05fr_1.2fr] gap-4">
        <Panel title="高频错因聚类" subtitle="按出现学生数" action="查看详情">
          <div className="space-y-3">
            {sectionSkeletons.map((label, index) => (
              <div key={label} className="grid grid-cols-[24px_84px_1fr_52px] items-center gap-2 text-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-100 font-bold text-brand-600">
                  {index + 1}
                </span>
                <span className="text-slate-500">{label}</span>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-full w-0 rounded-full bg-brand-500" />
                </div>
                <span className="text-right text-slate-400">待同步</span>
              </div>
            ))}
          </div>
          <EmptyHint text="后端返回 wrongCauseBuckets 后填充柱状图、人数和占比。" />
        </Panel>

        <Panel title="知识点掌握热力图" subtitle="正确率%" action="说明">
          <div className="grid grid-cols-[88px_repeat(4,1fr)] gap-1 text-center text-xs">
            <div />
            {heatCols.map((col) => (
              <div key={col} className="rounded bg-slate-50 px-1 py-2 text-slate-400">{col}</div>
            ))}
            {heatRows.map((row) => (
              <div key={row} className="contents">
                <div className="flex items-center justify-end rounded bg-slate-50 px-2 py-3 text-right text-slate-500">{row}</div>
                {heatCols.map((col) => (
                  <div key={`${row}-${col}`} className="rounded border border-dashed border-slate-200 bg-white py-3 text-slate-300">--</div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <Legend color="bg-emerald-500" label="≥80%" />
            <Legend color="bg-emerald-300" label="60%~79%" />
            <Legend color="bg-amber-300" label="40%~59%" />
            <Legend color="bg-rose-400" label="<40%" />
          </div>
        </Panel>

        <Panel title="典型错答" subtitle="部分" action="查看更多">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="grid grid-cols-[36px_1fr_74px] items-center gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-slate-100" />
                <div>
                  <div className="h-3 w-20 rounded bg-slate-100" />
                  <div className="mt-2 h-10 rounded-lg border border-dashed border-slate-200 bg-slate-50" />
                </div>
                <button className="h-8 rounded-lg border border-brand-100 text-xs font-medium text-brand-500 opacity-60" disabled>
                  加入讲评
                </button>
              </div>
            ))}
          </div>
          <EmptyHint text="后端返回 typicalWrongAnswers 后展示匿名学生、错因标签、作答截图和加入讲评操作。" />
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-[1.15fr_1.05fr_1.2fr] gap-4">
        <Panel title="分题步骤错因时序分析" subtitle="平均耗时">
          <div className="relative px-4 py-5">
            <div className="absolute left-8 right-8 top-12 h-0.5 bg-brand-100" />
            <div className="relative grid grid-cols-5 gap-3 text-center text-xs">
              {stepLabels.map((step) => (
                <div key={step}>
                  <div className="mx-auto mb-3 h-4 w-4 rounded-full border-2 border-brand-400 bg-white" />
                  <div className="font-medium text-slate-600">{step}</div>
                  <div className="mt-1 text-slate-400">等待步骤名</div>
                  <div className="mt-4 text-slate-400">平均耗时 --</div>
                  <div className="mt-3 text-slate-400">正确率 --</div>
                  <span className="mt-3 inline-flex rounded border border-dashed border-slate-200 px-2 py-1 text-[10px] text-slate-400">
                    主要错因待同步
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="分层错因对比" subtitle="按出现学生数占比">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="py-2 text-left font-normal">错因类型</th>
                <th className="py-2 text-center font-normal">A层</th>
                <th className="py-2 text-center font-normal">B层</th>
                <th className="py-2 text-center font-normal">C层</th>
              </tr>
            </thead>
            <tbody>
              {sectionSkeletons.map((label) => (
                <tr key={label} className="border-b border-slate-50">
                  <td className="py-2 text-slate-600">{label}</td>
                  <td className="text-center text-slate-300">--</td>
                  <td className="text-center text-slate-300">--</td>
                  <td className="text-center text-slate-300">--</td>
                </tr>
              ))}
            </tbody>
          </table>
          <EmptyHint text="后端返回 layerComparisons 后再计算 A/B/C 层错因占比。" />
        </Panel>

        <Panel title="AI 洞察与建议" subtitle="基于真实错因聚类">
          <div className="space-y-3">
            <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/40 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-700">
                <FileText className="h-4 w-4" /> 核心发现
              </div>
              <div className="text-xs leading-6 text-slate-500">
                等待 `insights` 字段同步后展示。当前不生成假结论，避免误导老师判断。
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-brand-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-700">
                <Lightbulb className="h-4 w-4" /> 教学建议
              </div>
              <div className="text-xs leading-6 text-slate-500">
                等待后端基于错因归类、典型错答和知识点掌握度生成建议。
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
        <span>数据统计截止：等待后端返回 `generatedAt`</span>
        <button className="inline-flex items-center gap-1 font-medium text-brand-600">
          <RefreshCw className="h-3.5 w-3.5" /> 刷新数据
        </button>
      </div>
    </div>
  )
}

function StatPlaceholder({ title, icon: Icon, color, unit, hint }) {
  const colorClass = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    red: 'bg-red-50 text-red-500'
  }[color]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${colorClass}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <div className="text-sm text-slate-600">{title}</div>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-300">--</span>
            <span className="pb-1 text-sm text-slate-400">{unit}</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">{hint}</div>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, subtitle, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{title}</span>
          {subtitle && <span className="text-xs text-slate-400">（{subtitle}）</span>}
          <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
        </div>
        {action && <button className="text-xs text-slate-400" disabled>{action} ›</button>}
      </div>
      {children}
    </div>
  )
}

function EmptyHint({ text }) {
  return (
    <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
      {text}
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-3 w-3 rounded ${color}`} />
      {label}
    </span>
  )
}
