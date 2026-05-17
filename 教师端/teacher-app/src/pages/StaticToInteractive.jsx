import { Link } from 'react-router-dom'
import {
  ArrowLeft, Play, Save, Send, Plus, ChevronDown, X, Type, Cloud, Edit3,
  Eraser, Image as ImageIcon, Sigma, BarChart3, Table, Layers, MoreHorizontal,
  MousePointer, Hand, Undo2, Redo2, Maximize2, MousePointerClick
} from 'lucide-react'

const tools = [
  { icon: Type, label: '文本' },
  { icon: Cloud, label: '形状' },
  { icon: Edit3, label: '画笔' },
  { icon: Eraser, label: '橡皮' },
  { icon: ImageIcon, label: '图片' },
  { icon: Sigma, label: '公式' },
  { icon: BarChart3, label: '图表' },
  { icon: BarChart3, label: '图形' },
  { icon: Table, label: '表格' },
  { icon: Layers, label: '素材' },
  { icon: MoreHorizontal, label: '更多' }
]

export default function StaticToInteractive() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      {/* 标题栏 */}
      <div className="h-12 bg-white border-b border-slate-100 flex items-center px-4 gap-3">
        <Link to="/courseware" className="w-8 h-8 hover:bg-slate-100 rounded flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <span className="text-base font-semibold text-slate-800">T08 静态题互动化配置</span>
        <div className="ml-auto flex items-center gap-2">
          <button className="btn-ghost h-8"><Play className="w-3.5 h-3.5 text-brand-500" /> 预览</button>
          <button className="btn-ghost h-8"><Save className="w-3.5 h-3.5" /> 保存</button>
          <button className="btn-primary h-8"><Send className="w-3.5 h-3.5" /> 发送到白板</button>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center gap-2">
        {tools.map(({ icon: Icon, label }, i) => (
          <button key={i} className="flex flex-col items-center gap-0.5 w-14 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-50">
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0">
        {/* 课件页面 */}
        <div className="w-[120px] bg-white border-r border-slate-100 flex flex-col">
          <div className="p-2 text-xs text-slate-600 border-b border-slate-100 flex items-center justify-between">
            <span>课件页面</span>
          </div>
          <button className="mx-2 mt-2 h-7 rounded border border-dashed border-brand-300 text-brand-600 text-xs flex items-center justify-center">
            <Plus className="w-3 h-3" /> 新建页面
          </button>
          <div className="flex-1 overflow-auto px-2 py-2 space-y-1.5">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className={`relative ${n === 1 ? 'ring-2 ring-brand-500' : ''} rounded`}>
                <span className="absolute -left-1 top-1 text-[10px] text-slate-400">{n}</span>
                <div className="border border-slate-200 rounded bg-white aspect-[4/3] flex items-center justify-center text-[9px] text-slate-400 p-1">
                  第 {n} 页
                </div>
              </div>
            ))}
            <button className="w-full aspect-[4/3] rounded border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 中间画布 */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 overflow-auto relative">
          <div className="bg-white shadow-soft rounded-lg w-[640px] aspect-[4/3] p-8 relative my-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-3">8.2 一元一次不等式（第1课时）</h1>
            <span className="pill bg-brand-50 text-brand-600">探究思考</span>
            <div className="mt-3 mb-3 text-sm text-slate-700">解不等式：<span className="italic">2x + 3 &gt; 7</span></div>
            <p className="text-sm text-slate-700 mb-4">请写出解集，并在数轴上表示出来。</p>

            {/* 选中区域 */}
            <div className="relative border-2 border-dashed border-brand-500 p-3 rounded mb-2">
              <Tag pos="-top-3 left-2">题干</Tag>
              <div className="text-sm text-slate-700">不等式 2x + 3 &gt; 7 的解集是 (    )</div>

              <Tag pos="top-8 -left-1.5">选项</Tag>
              <div className="text-sm text-slate-700 mt-3 grid grid-cols-2">
                <div>A. x &gt; −2</div>
                <div>B. x &lt; −2</div>
                <div>C. x &gt; 2</div>
                <div>D. x &lt; 2</div>
              </div>

              <Tag pos="bottom-10 -left-1.5">图形</Tag>
              <div className="mt-3 flex justify-center gap-1 text-xs text-slate-500">
                {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(n => (
                  <div key={n} className="w-8 flex flex-col items-center">
                    <div className="w-px h-2 bg-slate-400" />
                    <span>{n}</span>
                  </div>
                ))}
              </div>

              {/* 4 个调整手柄 */}
              {[
                'top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0',
                'top-0 left-1/2 -translate-x-1/2', 'bottom-0 left-1/2 -translate-x-1/2',
                'left-0 top-1/2 -translate-y-1/2', 'right-0 top-1/2 -translate-y-1/2'
              ].map((p, i) => (
                <div key={i} className={`absolute w-2 h-2 bg-white border border-brand-500 -translate-x-1/2 -translate-y-1/2 ${p}`} style={{ transform: 'translate(-50%,-50%)' }} />
              ))}
            </div>

            <div className="flex justify-center mt-4">
              <button className="px-5 py-2 bg-white border-2 border-brand-500 text-brand-600 rounded-lg shadow-soft flex items-center gap-2 text-sm font-medium hover:bg-brand-50">
                <MousePointerClick className="w-4 h-4" /> 设为互动题
              </button>
            </div>
          </div>

          {/* 底部画布工具 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white shadow-soft border border-slate-100 rounded-lg flex items-center gap-2 px-3 py-1.5 text-slate-500">
            <MousePointer className="w-3.5 h-3.5" />
            <Hand className="w-3.5 h-3.5" />
            <Undo2 className="w-3.5 h-3.5" />
            <Redo2 className="w-3.5 h-3.5" />
            <span className="text-xs">−</span>
            <span className="text-xs">100%</span>
            <span className="text-xs">+</span>
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 右侧互动题配置 */}
        <div className="w-[280px] bg-white border-l border-slate-100 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-base font-semibold text-slate-800">互动题配置</span>
            <X className="w-4 h-4 text-slate-400" />
          </div>

          {/* 步骤条 */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center text-xs gap-2">
              <Step n={1} label="框选题目" active />
              <span className="flex-1 h-px bg-slate-200" />
              <Step n={2} label="配置答案" />
              <span className="flex-1 h-px bg-slate-200" />
              <Step n={3} label="绑定下发" />
            </div>
          </div>

          <div className="p-4 space-y-3 text-sm">
            <Field label="题型" value="单选题" />

            <div>
              <div className="text-xs text-slate-500 mb-2">正确答案</div>
              <div className="flex gap-3">
                {['A', 'B', 'C', 'D'].map((c, i) => (
                  <label key={c} className="flex items-center gap-1.5">
                    <input type="radio" name="ca" defaultChecked={i === 2} className="accent-brand-600" />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-2">解析</div>
              <textarea
                className="input w-full !h-20 py-2"
                defaultValue="解不等式 2x + 3 > 7，得 2x > 4，两边同时除以 2，得 x > 2。"
              />
              <div className="text-[10px] text-slate-400 mt-1 text-right">28/500</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NumField label="分值" value="5" unit="分" />
              <Field label="知识点" value="一元一次不等式" mini />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="难度" value="中等" mini />
              <Field label="下发方式" value="全体学生" mini info />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">加入题库</span>
              <Switch on />
              <button className="flex-1 ml-2 h-8 rounded-md border border-slate-200 text-sm text-slate-700 flex items-center justify-between px-3">我的题库 <ChevronDown className="w-3 h-3 text-slate-400" /></button>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 p-4 flex gap-2">
            <button className="btn-ghost flex-1 h-9">取消</button>
            <button className="btn-primary flex-1 h-9">保存为互动题</button>
          </div>
          <div className="px-4 pb-4">
            <button className="btn-ghost w-full h-9">预览学生端</button>
          </div>
        </div>
      </div>

      {/* 底部状态 */}
      <div className="h-9 bg-white border-t border-slate-100 flex items-center px-4 text-xs text-slate-500 gap-4">
        <span>课件名称: 8.2 一元一次不等式（第1课时）</span>
        <span className="text-emerald-600">● 已保存 14:32</span>
      </div>
    </div>
  )
}

function Tag({ pos, children }) {
  return (
    <span className={`absolute ${pos} pill bg-brand-500 text-white text-[10px] z-10`}>{children}</span>
  )
}

function Step({ n, label, active }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{n}</span>
      <span className={active ? 'text-brand-600 font-medium' : 'text-slate-500'}>{label}</span>
    </div>
  )
}

function Field({ label, value, mini, info }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">{label}{info && <span className="text-slate-300">ⓘ</span>}</div>
      <button className={`w-full ${mini ? 'h-8' : 'h-9'} px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 flex items-center justify-between hover:border-brand-300`}>
        {value}
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>
    </div>
  )
}

function NumField({ label, value, unit }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="h-8 px-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700 flex items-center justify-between">
        <input className="w-full bg-transparent outline-none" defaultValue={value} />
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
    </div>
  )
}

function Switch({ on }) {
  return (
    <div className={`relative w-9 h-5 rounded-full transition ${on ? 'bg-brand-500' : 'bg-slate-300'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </div>
  )
}

