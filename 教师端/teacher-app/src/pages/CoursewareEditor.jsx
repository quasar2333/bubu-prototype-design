import { Link } from 'react-router-dom'
import {
  BookOpen, Minus, Square, X, Undo2, Redo2, Play, Send, ChevronDown, Plus,
  Type, Image as ImageIcon, Shapes, Sigma, BarChart3, Table, Sparkles, Music,
  Video, GitBranch, MoreHorizontal, CheckCircle2, Cloud, Maximize2
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

export default function CoursewareEditor() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      {/* 标题栏 */}
      <div className="h-10 bg-white border-b border-slate-200 flex items-center px-3 gap-2">
        <BookOpen className="w-4 h-4 text-brand-600" />
        <span className="text-sm font-semibold text-slate-800">T04 课件编辑器</span>
        <div className="ml-auto flex items-center gap-1">
          <Link to="/courseware" className="w-8 h-8 hover:bg-slate-100 flex items-center justify-center"><Minus className="w-4 h-4 text-slate-500" /></Link>
          <button className="w-8 h-8 hover:bg-slate-100 flex items-center justify-center"><Square className="w-3.5 h-3.5 text-slate-500" /></button>
          <Link to="/courseware" className="w-8 h-8 hover:bg-red-100 flex items-center justify-center"><X className="w-4 h-4 text-slate-500" /></Link>
        </div>
      </div>

      {/* 菜单栏 */}
      <div className="h-11 bg-white border-b border-slate-100 flex items-center px-4 gap-5 text-sm">
        <span className="text-slate-700">文件</span>
        <span className="text-slate-700">插入</span>
        <span className="text-slate-700">互动</span>
        <span className="text-slate-700">学科工具</span>
        <Undo2 className="w-4 h-4 text-slate-500 ml-2" />
        <Redo2 className="w-4 h-4 text-slate-500" />
        <div className="ml-auto flex items-center gap-2">
          <button className="btn-ghost h-8"><Play className="w-3.5 h-3.5 text-brand-500" /> 预览</button>
          <button className="btn-primary h-8"><Send className="w-3.5 h-3.5" /> 发送到白板</button>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-2">
        {tools.map(({ icon: Icon, label, active }, i) => (
          <button key={i} className={`flex flex-col items-center gap-1 w-16 py-1.5 rounded-md text-xs transition ${active ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0">
        {/* 左侧页面列表 */}
        <div className="w-[140px] bg-white border-r border-slate-100 flex flex-col">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-600">页面</span>
          </div>
          <button className="mx-3 mt-3 h-8 rounded-md border border-dashed border-brand-300 text-brand-600 text-xs flex items-center justify-center gap-1 hover:bg-brand-50">
            <Plus className="w-3 h-3" /> 新建页面
          </button>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={`relative ${n === 1 ? 'ring-2 ring-brand-500' : ''} rounded-md`}>
                <span className="absolute -left-1 top-2 text-xs text-slate-400">{n}</span>
                <div className="border border-slate-200 rounded bg-white aspect-[4/3] flex items-center justify-center text-[10px] text-slate-400 p-1">
                  {n === 1 ? '8.2 一元一次不等式（第1课时）' : `第 ${n} 页`}
                </div>
              </div>
            ))}
            <button className="w-full aspect-[4/3] rounded border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 中间画布 */}
        <div className="flex-1 flex items-center justify-center bg-slate-100 p-8 overflow-auto">
          <div className="bg-white shadow-soft rounded-lg w-[680px] aspect-[4/3] p-10 relative">
            <h1 className="text-3xl font-bold text-slate-800 mb-3">8.2 一元一次不等式（第1课时）</h1>
            <div className="pill bg-brand-50 text-brand-600 mb-4">探究思考</div>
            <p className="text-slate-700 text-lg mb-2">解不等式：<span className="italic font-serif">2x + 3 &gt; 7</span></p>
            <p className="text-slate-700 text-lg mb-6">请写出解集，并在数轴上表示出来。</p>

            <div className="border-2 border-dashed border-brand-300 rounded-xl bg-brand-50/30 p-6 flex items-center gap-4">
              <Sparkles className="w-12 h-12 text-brand-500" />
              <div>
                <div className="text-base text-slate-800">拖拽互动模块到此处</div>
                <div className="text-xs text-slate-500 mt-1">支持随堂练、选择题、判断题、填空题等</div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-1 text-xs text-slate-500">
              {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(n => (
                <div key={n} className="w-10 flex flex-col items-center">
                  <div className="w-px h-2 bg-slate-400" />
                  <span>{n}</span>
                </div>
              ))}
            </div>

            <BookOpen className="absolute bottom-4 right-4 w-12 h-12 text-brand-100" />
          </div>
        </div>

        {/* 右侧配置面板 */}
        <div className="w-[260px] bg-white border-l border-slate-100 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-slate-800">互动模块设置</span>
            <X className="w-4 h-4 text-slate-400" />
          </div>

          <FormGroup label="模块类型" value="随堂练（选择题）" />

          <div className="flex border-b border-slate-200 mt-3 mb-3">
            <button className="flex-1 pb-2 text-sm border-b-2 border-brand-600 text-brand-600 font-medium">基础设置</button>
            <button className="flex-1 pb-2 text-sm text-slate-500">高级设置</button>
          </div>

          <FormGroup label="题目来源" value="智能题库" />
          <div className="grid grid-cols-[1fr_auto] gap-2 mt-2">
            <FormGroup label="题目数量" value="1" thin unit="题" />
          </div>
          <FormGroup label="难度" value="中等" />

          <div className="mt-4 space-y-2.5">
            <ToggleLine label="提交后公布" on />
            <ToggleLine label="允许学生查看解析" on />
            <ToggleLine label="收集学情" on />
          </div>

          <button className="btn-primary w-full mt-5">保存设置</button>
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="h-10 bg-white border-t border-slate-100 flex items-center px-4 text-xs text-slate-500">
        <span>第 1 / 18 页</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-4" />
        <span className="ml-1">已保存</span>
        <Cloud className="w-3.5 h-3.5 text-emerald-500 ml-4" />
        <span className="ml-1 text-emerald-600">云端同步成功</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex border border-slate-200 rounded overflow-hidden">
            <button className="px-2 py-0.5 bg-slate-100">|</button>
            <button className="px-2 py-0.5">||</button>
          </div>
          <span>86%</span>
          <button>−</button>
          <button>+</button>
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  )
}

function FormGroup({ label, value, thin, unit }) {
  return (
    <div className={thin ? '' : 'mb-3'}>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <button className="flex-1 h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 flex items-center justify-between hover:border-brand-300">
          {value}
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  )
}

function ToggleLine({ label, on }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-slate-700">{label}</span>
      <div className={`relative w-9 h-5 rounded-full transition ${on ? 'bg-brand-500' : 'bg-slate-300'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </div>
    </div>
  )
}
