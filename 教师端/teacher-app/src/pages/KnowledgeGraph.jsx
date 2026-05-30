import { AlertCircle, Layers3, Network, Sparkles } from 'lucide-react'

const graphNodes = [
  { label: '一元一次不等式', x: '50%', y: '46%', tone: 'primary' },
  { label: '解法步骤', x: '24%', y: '28%', tone: 'blue' },
  { label: '数轴表示', x: '74%', y: '30%', tone: 'green' },
  { label: '变号规则', x: '30%', y: '72%', tone: 'orange' },
  { label: '实际应用题', x: '72%', y: '70%', tone: 'violet' }
]

export default function KnowledgeGraph() {
  return (
    <div className="min-h-full bg-[#f5f8ff] px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400">X1 / B8 争议项</div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">知识图谱</h1>
        </div>
        <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
          开发中，占位展示
        </div>
      </div>

      <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="relative min-h-[560px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_28%,rgba(20,184,166,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0),rgba(226,232,240,0.42))]" />
          <div className="absolute left-8 top-8 z-10">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-600">
              <Network className="h-4 w-4" />
              低保真侧栏入口
            </div>
            <p className="mt-2 max-w-[420px] text-sm leading-6 text-slate-500">
              当前只保留菜单入口与开发中占位页，完整知识图谱形态需要后续与甲方确认后再展开。
            </p>
          </div>

          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <line x1="50%" y1="46%" x2="24%" y2="28%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 8" />
            <line x1="50%" y1="46%" x2="74%" y2="30%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 8" />
            <line x1="50%" y1="46%" x2="30%" y2="72%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 8" />
            <line x1="50%" y1="46%" x2="72%" y2="70%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 8" />
          </svg>

          {graphNodes.map((node) => (
            <div
              key={node.label}
              className={[
                'absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-5 py-3 text-center shadow-lg backdrop-blur',
                node.tone === 'primary' ? 'border-brand-200 bg-brand-600 text-white' : '',
                node.tone === 'blue' ? 'border-blue-100 bg-blue-50 text-blue-700' : '',
                node.tone === 'green' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : '',
                node.tone === 'orange' ? 'border-orange-100 bg-orange-50 text-orange-700' : '',
                node.tone === 'violet' ? 'border-violet-100 bg-violet-50 text-violet-700' : ''
              ].join(' ')}
              style={{ left: node.x, top: node.y }}
            >
              <div className="text-sm font-semibold">{node.label}</div>
              <div className={node.tone === 'primary' ? 'text-xs text-blue-100' : 'text-xs text-slate-400'}>占位节点</div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              MVP 边界
            </div>
            <p className="text-sm leading-6 text-slate-500">
              只做入口 + 占位，不接真实知识点图谱、不做节点编辑、不做学习路径推荐。
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Layers3 className="h-4 w-4 text-brand-500" />
              后续确认项
            </div>
            <div className="space-y-2 text-sm text-slate-500">
              <div>• 图谱数据来源与知识点粒度</div>
              <div>• 是否需要班级掌握度叠加</div>
              <div>• 是否接入错因分析和智能推荐</div>
            </div>
          </div>
          <div className="rounded-[24px] border border-brand-100 bg-brand-50 p-5 text-brand-700">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              当前状态
            </div>
            <div className="text-2xl font-semibold">功能开发中</div>
            <p className="mt-2 text-sm leading-6 text-brand-600">
              等甲方确认完整形态后，再进入正式图谱页面设计与数据联调。
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
