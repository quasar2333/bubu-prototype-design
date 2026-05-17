import { CheckCircle2, ClipboardCheck, Users, AlertCircle, Download, Sparkles, Eye } from 'lucide-react'

const students = [
  { name: '李明阳', done: 95, acc: 88, weak: '一元一次不等式应用、函数图像应用', risk: '低风险', task: '8.2 一元一次不等式（练习） 完成于 05-15' },
  { name: '王思涵', done: 100, acc: 92, weak: '方程应用', risk: '低风险', task: '7.3 一次函数应用（练习） 完成于 05-15' },
  { name: '张子涵', done: 85, acc: 76, weak: '一元一次不等式应用、方程应用', risk: '中风险', task: '8.2 一元一次不等式（练习） 完成于 05-14' },
  { name: '陈宇航', done: 70, acc: 62, weak: '函数图像性质、一元一次方程应用', risk: '高风险', task: '8.2 一元一次不等式（练习） 完成于 05-14' },
  { name: '刘雨桐', done: 90, acc: 83, weak: '一元一次方程应用', risk: '中风险', task: '7.3 一次函数的图像（练习） 完成于 05-13' }
]

const riskColors = {
  '低风险': 'text-emerald-600 bg-emerald-50',
  '中风险': 'text-amber-600 bg-amber-50',
  '高风险': 'text-red-600 bg-red-50'
}

export default function Analytics() {
  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <StatCard color="brand" icon={<CheckCircle2 className="w-7 h-7" />} title="本周正确率" value="78%" delta="↑ 6.2%" deltaColor="text-emerald-600" desc="较上周" />
        <StatCard color="emerald" icon={<ClipboardCheck className="w-7 h-7" />} title="作业完成率" value="91%" delta="↑ 4.5%" deltaColor="text-emerald-600" desc="较上周" />
        <StatCard color="amber" icon={<Users className="w-7 h-7" />} title="课堂参与率" value="86%" delta="↑ 3.1%" deltaColor="text-emerald-600" desc="较上周" />
        <StatCard color="red" icon={<AlertCircle className="w-7 h-7" />} title="薄弱知识点" value="5个" delta="↑ 1个" deltaColor="text-red-500" desc="较上周" />
      </div>

      <div className="grid grid-cols-[1fr_1fr_280px] gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-slate-800">学情趋势 <span className="text-xs text-slate-400">(近7天)</span></div>
            <div className="flex items-center gap-3 text-xs">
              <Legend color="#3B82F6" label="正确率" />
              <Legend color="#F59E0B" label="参与率" />
            </div>
          </div>
          <TrendChart />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-slate-800">知识点掌握情况</div>
            <div className="flex border border-slate-200 rounded-md overflow-hidden text-xs">
              <button className="px-3 py-1 bg-brand-50 text-brand-600">雷达图</button>
              <button className="px-3 py-1 text-slate-500 hover:bg-slate-50">柱状图</button>
            </div>
          </div>
          <RadarChart />
          <div className="flex items-center justify-center gap-4 text-xs mt-2">
            <Legend color="#3B82F6" label="班级平均" />
            <Legend color="#10B981" label="年级平均" />
          </div>
        </div>

        <div className="card p-5">
          <div className="font-semibold text-slate-800 mb-4">学情提醒</div>
          <div className="mb-4">
            <div className="text-sm text-slate-700 mb-2 font-medium">共性薄弱点 <span className="text-slate-400 font-normal">5</span></div>
            <WeakItem rank={1} text="一元一次不等式应用" pct="68%" />
            <WeakItem rank={2} text="函数图像的性质" pct="63%" />
            <WeakItem rank={3} text="一元一次方程应用" pct="71%" />
            <a className="text-xs text-brand-600 hover:underline">查看全部 ›</a>
          </div>
          <div className="mb-4 border-t border-slate-100 pt-3">
            <div className="text-sm text-slate-700 mb-2 font-medium">高错题 TOP3</div>
            <ErrItem rank={1} text="一元一次不等式解集" pct="错误率 62%" />
            <ErrItem rank={2} text="函数图像的平移" pct="错误率 58%" />
            <ErrItem rank={3} text="方程应用 - 行程问题" pct="错误率 55%" />
            <a className="text-xs text-brand-600 hover:underline">查看全部 ›</a>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <div className="text-sm text-slate-700 mb-2 font-medium">未提交学生 <span className="text-red-500 font-normal">3</span></div>
            <div className="text-xs text-slate-500">刘子涵 - 未提交 2 份作业</div>
            <div className="text-xs text-slate-500">杨雨晨 - 未提交 1 份作业</div>
            <div className="text-xs text-slate-500">陈浩宇 - 未提交 1 份作业</div>
            <a className="text-xs text-brand-600 hover:underline mt-1 inline-block">查看全部 ›</a>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-800">学生学情列表</span>
            <div className="flex gap-1 text-xs">
              <Tab on>全部 (45)</Tab>
              <Tab>需关注 (12)</Tab>
              <Tab>进步明显 (8)</Tab>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input className="input w-48" placeholder="搜索学生姓名" />
            <button className="btn-ghost h-9"><Download className="w-3.5 h-3.5" /> 导出</button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-100">
              <th className="text-left py-2 font-normal">学生</th>
              <th className="text-left py-2 font-normal">完成率</th>
              <th className="text-left py-2 font-normal">正确率</th>
              <th className="text-left py-2 font-normal">薄弱点 (Top2)</th>
              <th className="text-left py-2 font-normal">风险等级</th>
              <th className="text-left py-2 font-normal">最近任务</th>
              <th className="text-right py-2 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/40">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-white text-xs">{s.name[0]}</div>
                    <span className="text-slate-700">{s.name}</span>
                  </div>
                </td>
                <td className="pr-4 w-32"><ProgressMini value={s.done} color="emerald" /></td>
                <td className="pr-4 w-32"><ProgressMini value={s.acc} color={s.acc >= 80 ? 'brand' : s.acc >= 70 ? 'amber' : 'red'} /></td>
                <td className="text-slate-600 text-xs max-w-[200px] truncate pr-4">{s.weak}</td>
                <td>
                  <span className={`pill ${riskColors[s.risk]}`}>{s.risk}</span>
                </td>
                <td className="text-slate-500 text-xs">{s.task}</td>
                <td className="text-right">
                  <button className="text-xs text-brand-600 hover:underline flex items-center gap-0.5 ml-auto">
                    查看详情 <Eye className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-slate-500">共 45 人</span>
          <div className="flex gap-1">
            <Page on>1</Page>
            <Page>2</Page>
            <Page>3</Page>
            <Page>4</Page>
            <Page>5</Page>
            <Page>›</Page>
          </div>
          <select className="input"><option>10条/页</option></select>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-slate-800">讲评素材库 <span className="text-xs text-slate-400 font-normal">(基于本班学情智能推荐)</span></div>
          <div className="flex gap-2">
            <button className="btn-ghost h-8 text-xs"><Sparkles className="w-3 h-3" /> 生成补充练习</button>
            <button className="btn-ghost h-8 text-xs"><Download className="w-3 h-3" /> 导出学情报告</button>
            <button className="btn-primary h-8 text-xs"><Users className="w-3 h-3" /> 查看学生详情</button>
          </div>
        </div>
        <div className="grid grid-cols-[120px_1fr] gap-4">
          <div className="space-y-1.5 text-sm">
            <button className="w-full text-left px-3 py-2 rounded-md bg-brand-50 text-brand-700 font-medium">推荐素材</button>
            <button className="w-full text-left px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50">我的素材</button>
            <button className="w-full text-left px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50">收藏素材</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <MatCard tag="高频错题详解" title="一元一次不等式解集易错点" desc="适用：初二 · 数学" used="128 次" gradient="from-rose-100 to-pink-200" />
            <MatCard tag="方法归纳" title="函数图像平移规律详解" desc="适用：初二 · 数学" used="96 次" gradient="from-blue-100 to-indigo-200" />
            <MatCard tag="拓展模块" title="行程问题中的方程应用" desc="适用：初二 · 数学" used="112 次" gradient="from-emerald-100 to-teal-200" />
            <MatCard tag="基础巩固" title="一元一次方程知识梳理" desc="适用：初二 · 数学" used="89 次" gradient="from-amber-100 to-orange-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ color, icon, title, value, delta, deltaColor, desc }) {
  const map = {
    brand: 'from-brand-500 to-brand-600 text-brand-500 bg-brand-50',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-500 bg-emerald-50',
    amber: 'from-amber-400 to-amber-500 text-amber-500 bg-amber-50',
    red: 'from-red-400 to-red-500 text-red-500 bg-red-50'
  }
  const [_, __, textCls, bgCls] = map[color].split(' ')
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="flex-1">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-3xl font-bold text-slate-800 mt-1">{value}</div>
        <div className="text-xs text-slate-400 mt-1">{desc} <span className={deltaColor}>{delta}</span></div>
      </div>
      <div className={`w-14 h-14 rounded-full ${bgCls} ${textCls} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-500">
      <span className="w-3 h-0.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  )
}

function TrendChart() {
  // 使用 SVG 绘制双折线图
  const w = 460, h = 200, pad = 30
  const accPts = [78, 80, 82, 84, 87, 85, 86]
  const parPts = [68, 72, 75, 74, 79, 76, 78]
  const days = ['5.10', '5.11', '5.12', '5.13', '5.14', '5.15', '5.16']
  const xStep = (w - pad * 2) / (accPts.length - 1)
  const y = (v) => h - pad - ((v - 50) / 50) * (h - pad * 2)

  const linePath = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'} ${pad + i * xStep} ${y(v)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[200px]">
      {[100, 75, 50, 25, 0].map((v, i) => (
        <g key={i}>
          <line x1={pad} x2={w - pad} y1={pad + i * (h - pad * 2) / 4} y2={pad + i * (h - pad * 2) / 4} stroke="#F1F5F9" />
          <text x={4} y={pad + i * (h - pad * 2) / 4 + 4} fontSize="9" fill="#94A3B8">{v}%</text>
        </g>
      ))}
      <path d={linePath(accPts)} stroke="#3B82F6" strokeWidth="2" fill="none" />
      <path d={linePath(parPts)} stroke="#F59E0B" strokeWidth="2" fill="none" />
      {accPts.map((v, i) => (
        <g key={'a' + i}>
          <circle cx={pad + i * xStep} cy={y(v)} r="3" fill="#3B82F6" />
          <text x={pad + i * xStep} y={y(v) - 8} fontSize="9" fill="#3B82F6" textAnchor="middle">{v}%</text>
        </g>
      ))}
      {parPts.map((v, i) => (
        <g key={'p' + i}>
          <circle cx={pad + i * xStep} cy={y(v)} r="3" fill="#F59E0B" />
          <text x={pad + i * xStep} y={y(v) + 14} fontSize="9" fill="#F59E0B" textAnchor="middle">{v}%</text>
        </g>
      ))}
      {days.map((d, i) => (
        <text key={i} x={pad + i * xStep} y={h - 8} fontSize="10" fill="#64748B" textAnchor="middle">{d}</text>
      ))}
    </svg>
  )
}

function RadarChart() {
  const labels = [
    { name: '一元一次不等式', val: 72 },
    { name: '函数图像', val: 68 },
    { name: '方程应用', val: 82 },
    { name: '几何证明', val: 60 }
  ]
  const cx = 140, cy = 110, r = 80
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / labels.length
  const pt = (i, v) => [cx + Math.cos(angle(i)) * r * (v / 100), cy + Math.sin(angle(i)) * r * (v / 100)]
  const classPath = labels.map((l, i) => pt(i, l.val)).map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ') + ' Z'
  const gradePath = labels.map((l, i) => pt(i, l.val - 6)).map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ') + ' Z'

  return (
    <svg viewBox="0 0 280 220" className="w-full h-[200px]">
      {[1, 0.75, 0.5, 0.25].map((s, i) => {
        const poly = labels.map((_, k) => `${cx + Math.cos(angle(k)) * r * s},${cy + Math.sin(angle(k)) * r * s}`).join(' ')
        return <polygon key={i} points={poly} fill="none" stroke="#E2E8F0" strokeDasharray={i ? '2 2' : ''} />
      })}
      {labels.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle(i)) * r} y2={cy + Math.sin(angle(i)) * r} stroke="#E2E8F0" />
      ))}
      <path d={classPath} fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" strokeWidth="1.5" />
      <path d={gradePath} fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
      {labels.map((l, i) => {
        const [x, y] = [cx + Math.cos(angle(i)) * (r + 22), cy + Math.sin(angle(i)) * (r + 22)]
        return (
          <text key={i} x={x} y={y} fontSize="10" fill="#475569" textAnchor="middle">
            <tspan x={x}>{l.name}</tspan>
            <tspan x={x} dy="11" fill="#3B82F6" fontWeight="bold">{l.val}分</tspan>
          </text>
        )
      })}
    </svg>
  )
}

function WeakItem({ rank, text, pct }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-slate-600">{rank}. {text}</span>
      <span className="text-red-500 text-xs">{pct}</span>
    </div>
  )
}

function ErrItem({ rank, text, pct }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <div className="flex items-center gap-2">
        <span className={`w-4 h-4 rounded text-white text-[10px] flex items-center justify-center ${rank === 1 ? 'bg-red-500' : rank === 2 ? 'bg-amber-500' : 'bg-slate-400'}`}>{rank}</span>
        <span className="text-slate-600">{text}</span>
      </div>
      <span className="text-xs text-slate-400">{pct}</span>
    </div>
  )
}

function Tab({ children, on }) {
  return <button className={`px-3 py-1 rounded ${on ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}>{children}</button>
}

function ProgressMini({ value, color }) {
  const bg = { brand: 'bg-brand-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500' }[color]
  const tx = { brand: 'text-brand-600', emerald: 'text-emerald-600', amber: 'text-amber-600', red: 'text-red-600' }[color]
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
        <div className={`${bg} h-full rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-semibold ${tx}`}>{value}%</span>
    </div>
  )
}

function Page({ children, on }) {
  return <button className={`w-8 h-8 rounded-md text-sm ${on ? 'bg-brand-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{children}</button>
}

function MatCard({ tag, title, desc, used, gradient }) {
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden hover:shadow-soft transition">
      <div className={`h-20 bg-gradient-to-br ${gradient} relative`}>
        <span className="absolute top-2 left-2 pill bg-white/90 text-rose-600 text-[10px]">{tag}</span>
      </div>
      <div className="p-3">
        <div className="text-sm text-slate-800 truncate">{title}</div>
        <div className="text-xs text-slate-400 mt-1">{desc}</div>
        <div className="text-xs text-slate-400 mt-0.5">使用 {used}</div>
      </div>
    </div>
  )
}
