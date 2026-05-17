import { Link } from 'react-router-dom'
import {
  ChevronRight, Cloud, UploadCloud, FileText, Image as ImageIcon, FileType2,
  CheckCircle2, Edit3, AlertCircle, FilePlus
} from 'lucide-react'

const steps = [
  { n: 1, title: '上传文件', sub: '上传课件原始文件', state: 'active' },
  { n: 2, title: '导入设置', sub: '设置课件信息与解析选项', state: 'wait' },
  { n: 3, title: '解析完成', sub: '预览解析结果，可进入编辑', state: 'wait' }
]

export default function CoursewareImport() {
  return (
    <div className="p-6 space-y-5">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <Link to="/courseware" className="hover:text-brand-600">课件</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700">导入课件</span>
      </div>

      {/* 步骤条 */}
      <div className="card p-5">
        <div className="flex items-center">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-initial">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${s.state === 'active' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {s.n}
                </div>
                <div>
                  <div className={`text-sm ${s.state === 'active' ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>{s.title}</div>
                  <div className="text-xs text-slate-400">{s.sub}</div>
                </div>
              </div>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* 文件上传 */}
        <div className="card p-5">
          <div className="border-2 border-dashed border-slate-200 rounded-xl py-12 flex flex-col items-center bg-slate-50/50">
            <Cloud className="w-14 h-14 text-brand-400 mb-3" />
            <div className="text-base text-slate-700 mb-4">拖拽 PPTX / PDF / 图片到这里</div>
            <button className="btn-primary"><FilePlus className="w-4 h-4" /> 选择本地文件</button>
          </div>

          <div className="mt-5">
            <div className="text-sm text-slate-700 font-medium mb-3">支持的文件格式</div>
            <div className="grid grid-cols-4 gap-3 text-xs">
              <FormatTag color="orange" icon={<FileType2 className="w-4 h-4" />} title="PPTX" desc="演示文稿" />
              <FormatTag color="red" icon={<FileText className="w-4 h-4" />} title="PDF" desc="PDF 文档" />
              <FormatTag color="emerald" icon={<ImageIcon className="w-4 h-4" />} title="PNG" desc="PNG 图片" />
              <FormatTag color="blue" icon={<ImageIcon className="w-4 h-4" />} title="JPG" desc="JPG 图片" />
            </div>
            <div className="text-xs text-slate-400 mt-2">· 单个文件大小不超过 200MB</div>
          </div>
        </div>

        {/* 导入设置 */}
        <div className="card p-5">
          <div className="text-sm font-semibold text-slate-800 mb-4">导入设置</div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="课件名称" required value="8.2 一元一次不等式 (第1课时)" full />
            <FormField label="学科" required value="数学" />
            <FormField label="年级" required value="初二" />
            <FormField label="教材版本" required value="人教版（2024版）" />
            <FormField label="关联班级" required value="初二 (3) 班" />
          </div>

          <div className="border-t border-slate-100 mt-4 pt-4 space-y-3">
            <ToggleRow icon={<CheckCircle2 className="w-5 h-5 text-brand-500" />} title="自动识别题目" sub="识别课件中的题目并提取知识信息" on />
            <ToggleRow icon={<Edit3 className="w-5 h-5 text-brand-500" />} title="生成课件目录" sub="根据课件结构自动生成目录" on />
            <ToggleRow icon={<Cloud className="w-5 h-5 text-brand-500" />} title="上传到云端资源库" sub="导入完成后保存到我的资源库" on />
          </div>
        </div>
      </div>

      {/* 上传进度 + 解析结果预览 */}
      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5 space-y-3">
          <ProgressRow icon={<UploadCloud className="w-4 h-4 text-brand-500" />} label="文件上传" pct={82} status="上传中" />
          <ProgressRow icon={<FileText className="w-4 h-4 text-violet-500" />} label="页面解析" pct={45} status="解析中" />
          <ProgressRow icon={<CheckCircle2 className="w-4 h-4 text-slate-400" />} label="题目识别" pct={0} status="等待中" disabled />
          <ProgressRow icon={<Cloud className="w-4 h-4 text-slate-400" />} label="云端同步" pct={0} status="未开始" disabled />
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold text-slate-800 mb-3">解析完成预览</div>
          <div className="flex gap-3 mb-3">
            <PageThumb num="1" active />
            <PageThumb num="2" />
            <PageThumb num="3" />
            <PageThumb num="4" />
          </div>
          <div className="text-xs text-slate-400 mb-3">共 18 页</div>

          <div className="space-y-2 text-sm">
            <ResultRow icon="📄" label="18 页" desc="课件页数" color="brand" />
            <ResultRow icon="✓" label="6 道" desc="已识别题目" color="emerald" />
            <ResultRow icon="⭐" label="可进入互动化配置" desc="可对题目进行互动化设置" color="amber" />
          </div>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="flex justify-between">
        <button className="btn-ghost">取消</button>
        <div className="flex gap-3">
          <button className="btn-primary"><Cloud className="w-4 h-4" /> 开始导入</button>
          <Link to="/editor" className="btn-ghost"><Edit3 className="w-4 h-4" /> 进入课件编辑</Link>
        </div>
      </div>
    </div>
  )
}

function FormatTag({ color, icon, title, desc }) {
  const cls = {
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600'
  }[color]
  return (
    <div className="border border-slate-100 rounded-lg p-2 flex items-center gap-2">
      <div className={`w-7 h-7 rounded-md ${cls} flex items-center justify-center`}>{icon}</div>
      <div>
        <div className="text-slate-700 font-medium">{title}</div>
        <div className="text-slate-400 text-[10px]">{desc}</div>
      </div>
    </div>
  )
}

function FormField({ label, required, value, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-xs text-slate-500 mb-1">
        {required && <span className="text-red-500 mr-0.5">*</span>}{label}
      </div>
      <button className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 flex items-center justify-between hover:border-brand-300">
        {value}
        <svg className="w-3 h-3 text-slate-400" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" /></svg>
      </button>
    </div>
  )
}

function ToggleRow({ icon, title, sub, on }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1">
        <div className="text-sm text-slate-700">{title}</div>
        <div className="text-xs text-slate-400">{sub}</div>
      </div>
      <div className={`relative w-9 h-5 rounded-full transition ${on ? 'bg-brand-500' : 'bg-slate-300'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </div>
    </div>
  )
}

function ProgressRow({ icon, label, pct, status, disabled }) {
  return (
    <div className={disabled ? 'opacity-50' : ''}>
      <div className="flex items-center gap-2 text-sm mb-1">
        {icon}
        <span className="text-slate-700">{label}</span>
        <span className="ml-auto text-xs text-slate-500">{status} {!disabled && `${pct}%`}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${disabled ? 'bg-slate-300' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function PageThumb({ num, active }) {
  return (
    <div className={`w-16 h-12 rounded border ${active ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'} bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-xs text-slate-400 relative`}>
      <span className="absolute bottom-0 right-1 text-[10px]">{num}</span>
    </div>
  )
}

function ResultRow({ icon, label, desc, color }) {
  const cls = { brand: 'text-brand-600', emerald: 'text-emerald-600', amber: 'text-amber-600' }[color]
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center ${cls}`}>{icon}</div>
      <div>
        <div className={`text-base font-bold ${cls}`}>{label}</div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
    </div>
  )
}
