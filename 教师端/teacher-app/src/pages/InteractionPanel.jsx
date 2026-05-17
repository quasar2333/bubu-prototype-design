import { Link } from 'react-router-dom'
import {
  Sparkles, Play, Send, Save, ChevronDown, Plus, X, RefreshCw, Mic,
  ClipboardList, MessageCircle, FlaskConical, Users, MousePointer,
  BarChart3, FileText, GripVertical, Type, Image as ImageIcon, Shapes,
  Sigma, Table, Music, Video, GitBranch, MoreHorizontal, Undo2, Redo2
} from 'lucide-react'

const tools = [
  { icon: Type, label: '文本' },
  { icon: ImageIcon, label: '图片' },
  { icon: Shapes, label: '形状' },
  { icon: Sigma, label: '公式' },
  { icon: BarChart3, label: '图表' },
  { icon: Table, label: '表格' },
  { icon: Sparkles, label: '互动', active: true },
  { icon: Music, label: '音频' },
  { icon: Video, label: '视频' },
  { icon: GitBranch, label: '思维导图' },
  { icon: MoreHorizontal, label: '更多' }
]

const components = [
  { icon: Mic, color: 'brand', title: '听写 / 默写', sub: '随堂音播报、学生听写作答' },
  { icon: ClipboardList, color: 'emerald', title: '随堂练 / 测验', sub: '题目练习、自动批改' },
  { icon: MessageCircle, color: 'violet', title: '讨论', sub: '开放讨论、发表观点' },
  { icon: FlaskConical, color: 'amber', title: '实验', sub: '虚拟或实物实验探究' },
  { icon: Users, color: 'rose', title: '抽人回答', sub: '随机抽取学生回答' },
  { icon: MousePointer, color: 'sky', title: '圈选提问', sub: '圈选学生内容提问' },
  { icon: BarChart3, color: 'indigo', title: '投票', sub: '单选 / 多选投票统计' },
  { icon: FileText, color: 'teal', title: '互动页', sub: '插入互动专用页面' }
]

const cmpColors = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  teal: 'bg-teal-50 text-teal-600'
}

export default function InteractionPanel() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      <div className="h-12 bg-white border-b border-slate-100 flex items-center px-4 gap-2">
        <Sparkles className="w-5 h-5 text-brand-600" />
        <span className="text-sm font-semibold text-slate-800">T05 互动组件面板</span>
        <span className="text-xs text-slate-400 ml-2">已自动保存 20:36</span>
        <div className="ml-auto flex items-center gap-2">
          <button className="btn-ghost h-8"><Play className="w-3.5 h-3.5 text-brand-500" /> 预览</button>
          <button className="btn-primary h-8"><Send className="w-3.5 h-3.5" /> 发送到白板</button>
          <button className="btn-success h-8"><Save className="w-3.5 h-3.5" /> 保存 <ChevronDown className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="h-11 bg-white border-b border-slate-100 flex items-center px-4 gap-5 text-sm">
        <span className="text-slate-700">文件 <ChevronDown className="inline w-3 h-3" /></span>
        <span className="text-slate-700">插入 <ChevronDown className="inline w-3 h-3" /></span>
        <span className="text-slate-700">互动 <ChevronDown className="inline w-3 h-3" /></span>
        <span className="text-slate-700">学科工具</span>
        <Undo2 className="w-4 h-4 text-slate-500 ml-2" />
        <Redo2 className="w-4 h-4 text-slate-500" />
        <RefreshCw className="w-4 h-4 text-slate-500" />
      </div>

      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-2">
        {tools.map(({ icon: Icon, label, active }, i) => (
          <button key={i} className={`flex flex-col items-center gap-1 w-16 py-1.5 rounded-md text-xs ${active ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Icon className="w-5 h-5" />{label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0">
        {/* 页面列表 */}
        <div className="w-[100px] bg-white border-r border-slate-100 flex flex-col">
          <div className="p-2 text-xs text-slate-600">页面</div>
          <button className="mx-2 mb-2 h-7 rounded border border-dashed border-brand-300 text-brand-600 text-xs flex items-center justify-center">
            <Plus className="w-3 h-3" /> 新建页面
          </button>
          <div className="flex-1 overflow-auto px-2 space-y-1.5">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={`relative ${n === 1 ? 'ring-2 ring-brand-500' : ''} rounded`}>
                <span className="absolute -left-1 top-1 text-[10px] text-slate-400">{n}</span>
                <div className="border border-slate-200 rounded bg-white aspect-[4/3] flex items-center justify-center text-[9px] text-slate-400 p-1">
                  第 {n} 页
                </div>
              </div>
            ))}
            <button className="w-full aspect-[4/3] rounded border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 左侧互动组件库 */}
        <div className="w-[200px] bg-white border-r border-slate-100 flex flex-col">
          <div className="px-3 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">互动组件</span>
            <X className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xs text-slate-400 px-3 py-2">拖拽组件到画布中</div>
          <div className="flex-1 overflow-auto px-3 space-y-2 pb-3">
            {components.map((c, i) => {
              const C = c.icon
              return (
                <div key={i} className="border border-slate-100 rounded-lg p-2 flex items-center gap-2 hover:border-brand-200 hover:bg-brand-50/30 cursor-grab">
                  <div className={`w-8 h-8 rounded-md ${cmpColors[c.color]} flex items-center justify-center`}>
                    <C className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-700 font-medium">{c.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{c.sub}</div>
                  </div>
                  <GripVertical className="w-3 h-3 text-slate-300" />
                </div>
              )
            })}
          </div>
        </div>

        {/* 画布 */}
        <div className="flex-1 flex items-center justify-center bg-slate-100 p-6 overflow-auto">
          <div className="bg-white shadow-soft rounded-lg w-[640px] aspect-[4/3] p-8 relative">
            <h1 className="text-2xl font-bold text-slate-800 mb-3">8.2 二次函数的图像与性质（随堂练）</h1>
            <span className="pill bg-brand-50 text-brand-600">学习目标</span>
            <p className="text-sm text-slate-600 mt-2 mb-4">会根据公式与图像，判断二次函数的开口方向、对称轴和最值。</p>

            <div className="border-l-4 border-brand-500 bg-brand-50/40 pl-3 py-1.5 mb-3 text-sm text-slate-700">
              <span className="font-semibold">随堂练：</span>二次函数基础检测
            </div>
            <div className="text-sm text-slate-700 mb-4">
              <p>1. 已知二次函数 y = -2x² + 4x − 1，下列说法正确的是（    ）</p>
              <p className="pl-4 mt-1">A. 开口向上　　 B. 对称轴是直线 x = 1</p>
              <p className="pl-4">C. 当 x &gt; 1 时，函数值 y 随 x 增大而增大</p>
              <p className="pl-4">D. 函数有最大值 1</p>
            </div>

            <div className="border-2 border-dashed border-brand-300 rounded-lg p-4 bg-brand-50/30 text-center">
              <Sparkles className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <div className="text-sm text-slate-700">将互动组件拖拽到此处</div>
              <div className="text-xs text-slate-500 mt-1">支持在此插入：听写 / 测验 / 讨论 / 投票等互动组件</div>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 border border-emerald-200 rounded bg-emerald-50 text-emerald-700 text-xs">
                <ClipboardList className="w-3.5 h-3.5" /> 随堂练: 二次函数基础检测 <X className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧互动列表 + 配置 */}
        <div className="w-[260px] bg-white border-l border-slate-100 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-800">当前页面互动</span>
              <button className="text-xs text-brand-600 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> 刷新</button>
            </div>
            <ItemRow label="随堂练：二次函数基础检测" icon={<ClipboardList className="w-3.5 h-3.5 text-emerald-600" />} status="已配置" color="emerald" />
            <ItemRow label="抽人回答：随机点名提问" icon={<Users className="w-3.5 h-3.5 text-rose-600" />} status="待完善" color="amber" />
            <ItemRow label="讨论：函数图像特征" icon={<MessageCircle className="w-3.5 h-3.5 text-violet-600" />} status="未绑定" color="slate" />
            <button className="w-full mt-2 h-9 border border-dashed border-brand-300 rounded text-brand-600 text-sm flex items-center justify-center gap-1 hover:bg-brand-50">
              <Plus className="w-3.5 h-3.5" /> 添加互动组件
            </button>
          </div>

          <div className="p-4 border-b border-slate-100">
            <div className="text-sm font-semibold text-slate-800 mb-3">触发设置</div>
            <RadioOption label="手动点击触发" sub="教师点击后即可发送给学生" on />
            <RadioOption label="翻页自动提示" sub="翻到此页时在学生端提示进入互动" />
            <RadioOption label="翻页即下发" sub="翻到此页时自动下发互动到学生端" />
          </div>

          <div className="p-4">
            <div className="text-sm font-semibold text-slate-800 mb-3">显示设置</div>
            <CheckLine label="在学生端显示互动入口" on />
            <CheckLine label="显示互动标题" on />
            <CheckLine label="显示作答进度（学生端）" />
          </div>

          <button className="mx-4 mb-4 mt-auto btn-ghost h-9">高级设置</button>
        </div>
      </div>
    </div>
  )
}

function ItemRow({ label, icon, status, color }) {
  const bg = { emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', slate: 'bg-slate-100 text-slate-500' }[color]
  return (
    <div className="border border-slate-100 rounded-md px-3 py-2 mb-2 flex items-center gap-2 text-xs">
      {icon}
      <span className="text-slate-700 flex-1 truncate">{label}</span>
      <span className={`pill ${bg}`}>{status}</span>
    </div>
  )
}

function RadioOption({ label, sub, on }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${on ? 'border-brand-500 bg-white' : 'border-slate-300'}`}>
        {on && <div className="w-2 h-2 rounded-full bg-brand-500 m-0.5" />}
      </div>
      <div className="text-xs">
        <div className="text-slate-700">{label}</div>
        <div className="text-slate-400 mt-0.5">{sub}</div>
      </div>
    </div>
  )
}

function CheckLine({ label, on }) {
  return (
    <label className="flex items-center gap-2 py-1.5 text-xs">
      <input type="checkbox" defaultChecked={on} className="accent-brand-600" />
      <span className="text-slate-700">{label}</span>
    </label>
  )
}

