import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight, Cloud, UploadCloud, FileText, FileType2,
  CheckCircle2, Edit3, AlertCircle, FilePlus, Loader2, Film, Image as ImageIcon
} from 'lucide-react'
import { pickAndParse, classifyExt, formatSize, hasDesktop, renderPdfBytes, stashImportedDeck } from '../lib/importEngine'

const steps = [
  { n: 1, title: '上传文件', sub: '上传课件原始文件', state: 'active' },
  { n: 2, title: '导入设置', sub: '设置课件信息与解析选项', state: 'wait' },
  { n: 3, title: '解析完成', sub: '预览解析结果，可进入编辑', state: 'wait' }
]

const SUPPORTED_EXTENSIONS = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'mp4', 'mov', 'avi', 'mkv', 'png', 'jpg', 'jpeg']
const ACCEPT_TYPES = '.ppt,.pptx,.doc,.docx,.xls,.xlsx,.pdf,.mp4,.mov,.avi,.mkv,.png,.jpg,.jpeg,application/pdf,video/mp4'

const STAGE_ORDER = ['read', 'convert', 'render', 'done']
function stageState(current, target) {
  if (current === 'error' || current === 'idle') return 'wait'
  const ci = STAGE_ORDER.indexOf(current)
  const ti = STAGE_ORDER.indexOf(target)
  if (ci === ti) return 'doing'
  return ci > ti ? 'done' : 'wait'
}

export default function CoursewareImport() {
  const desktop = hasDesktop()
  const [deck, setDeck] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [stage, setStage] = useState('idle')
  const [renderInfo, setRenderInfo] = useState({ done: 0, total: 0 })
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [settings, setSettings] = useState({
    title: '',
    subject: '数学',
    grade: '初二',
    lesson: '第1课时',
    textbook: '人教版（2024版）',
    className: '初二 (3) 班',
    autoDetectQuestions: true,
    generateOutline: true,
    uploadToCloud: true
  })
  const inputRef = useRef(null)

  const applyDeck = (result) => {
    if (!result) return
    setDeck(result)
    const titleBase = result.name.replace(/\.[^.]+$/, '')
    setSettings(current => ({ ...current, title: current.title || titleBase }))
    stashImportedDeck(result)
    setStage('done')
  }

  const runDesktopImport = async () => {
    setError('')
    setParsing(true)
    setStage('read')
    setRenderInfo({ done: 0, total: 0 })
    try {
      const result = await pickAndParse({
        onStage: setStage,
        onRenderProgress: (done, total) => setRenderInfo({ done, total })
      })
      if (result) applyDeck(result)
      else setStage(deck ? 'done' : 'idle')
    } catch (e) {
      setError(e.message || '导入失败')
      setStage('error')
    } finally {
      setParsing(false)
    }
  }

  const onInputFile = async (file) => {
    if (!file) return
    const ext = file.name.toLowerCase().split('.').pop()
    const kind = classifyExt(ext)
    setError('')
    if (kind === 'office' || kind === 'video') {
      setError('Office / 视频请用「选择本地文件」在桌面应用中导入（依赖本地 LibreOffice 解析）')
      return
    }
    if (kind === 'unknown') { setError('暂不支持的文件类型：.' + ext); return }
    setParsing(true)
    setStage(kind === 'pdf' ? 'render' : 'read')
    setRenderInfo({ done: 0, total: 0 })
    try {
      let result
      if (kind === 'pdf') {
        const buf = await file.arrayBuffer()
        const r = await renderPdfBytes(new Uint8Array(buf), { onProgress: (d, t) => setRenderInfo({ done: d, total: t }) })
        result = { name: file.name, ext, size: file.size, kind, ...r }
      } else {
        result = { name: file.name, ext, size: file.size, kind, pageCount: 1, pages: [{ page: 1, dataUrl: URL.createObjectURL(file) }] }
      }
      applyDeck(result)
    } catch (e) {
      setError(e.message || '解析失败')
      setStage('error')
    } finally {
      setParsing(false)
    }
  }

  const handlePickClick = () => {
    if (desktop) runDesktopImport()
    else inputRef.current?.click()
  }

  const updateSetting = (key, value) => setSettings(current => ({ ...current, [key]: value }))
  const toggleSetting = key => setSettings(current => ({ ...current, [key]: !current[key] }))

  const isOffice = deck?.kind === 'office' || stage === 'convert'
  const progress = [
    { label: '读取文件', state: stageState(stage, 'read') },
    ...(isOffice ? [{ label: 'Office 转换 · LibreOffice', state: stageState(stage, 'convert') }] : []),
    { label: '逐页渲染', state: stageState(stage, 'render'), sub: renderInfo.total ? `${renderInfo.done}/${renderInfo.total} 页` : '' },
    { label: '完成', state: stage === 'done' ? 'done' : 'wait' }
  ]

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
          <div
            className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center transition ${isDragging ? 'border-brand-400 bg-brand-50/70' : 'border-slate-200 bg-slate-50/50'}`}
            onDragOver={event => { event.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={event => {
              event.preventDefault()
              setIsDragging(false)
              onInputFile(event.dataTransfer.files?.[0])
            }}
          >
            <Cloud className="w-14 h-14 text-brand-400 mb-3" />
            <div className="text-base text-slate-700 mb-2">拖拽 Office / PDF / 视频 / 图片到这里</div>
            <div className="text-xs text-slate-400 mb-4">本地真实解析：Office→LibreOffice 转 PDF，PDF→pdf.js 逐页渲染，进入 T04 编辑器叠加互动</div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_TYPES}
              className="hidden"
              onChange={event => onInputFile(event.target.files?.[0])}
            />
            <button className="btn-primary disabled:opacity-60" disabled={parsing} onClick={handlePickClick}>
              {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
              {parsing ? '正在解析…' : '选择本地文件'}
            </button>
            {!desktop && (
              <div className="mt-2 text-[11px] text-amber-600">网页预览仅支持 PDF / 图片；Office / 视频请在桌面应用中导入</div>
            )}
            {deck && (
              <div className="mt-4 px-3 py-2 rounded-lg bg-white border border-brand-100 text-xs text-slate-600 flex items-center gap-2">
                {deck.kind === 'video' ? <Film className="w-4 h-4 text-emerald-500" /> : deck.kind === 'image' ? <ImageIcon className="w-4 h-4 text-violet-500" /> : <FileType2 className="w-4 h-4 text-orange-500" />}
                <span className="max-w-[220px] truncate">{deck.name}</span>
                <span className="text-slate-400">{formatSize(deck.size)}</span>
                <span className="text-brand-600 font-medium">{deck.video ? '视频' : `${deck.pageCount} 页`}</span>
              </div>
            )}
            {error && (
              <div className="mt-3 flex items-start gap-1.5 text-xs text-red-500 max-w-[360px] text-center">
                <AlertCircle className="w-3.5 h-3.5 flex-none mt-0.5" /> {error}
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="text-sm text-slate-700 font-medium mb-3">支持的文件格式</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <FormatTag color="orange" icon={<FileType2 className="w-4 h-4" />} title="PPT / PPTX" desc="LibreOffice 转 PDF 渲染" />
              <FormatTag color="blue" icon={<FileText className="w-4 h-4" />} title="Word / Excel" desc="转 PDF 分页预览" />
              <FormatTag color="violet" icon={<FileText className="w-4 h-4" />} title="PDF" desc="pdf.js 逐页渲染" />
              <FormatTag color="emerald" icon={<Film className="w-4 h-4" />} title="视频" desc="原生播放页" />
              <FormatTag color="rose" icon={<ImageIcon className="w-4 h-4" />} title="PNG / JPG" desc="图片素材页" />
            </div>
            <div className="text-xs text-slate-400 mt-2">· 单个文件大小不超过 200MB</div>
          </div>
        </div>

        {/* 导入设置 */}
        <div className="card p-5">
          <div className="text-sm font-semibold text-slate-800 mb-4">导入设置</div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="课件名称" required value={settings.title} onChange={value => updateSetting('title', value)} full />
            <FormField label="学科" required value={settings.subject} onChange={value => updateSetting('subject', value)} options={['数学', '语文', '英语']} />
            <FormField label="年级" required value={settings.grade} onChange={value => updateSetting('grade', value)} options={['初二', '初一', '初三']} />
            <FormField label="课时" required value={settings.lesson} onChange={value => updateSetting('lesson', value)} options={['第1课时', '第2课时', '练习课', '复习课']} />
            <FormField label="教材版本" required value={settings.textbook} onChange={value => updateSetting('textbook', value)} options={['人教版（2024版）', '北师大版', '苏教版']} />
            <FormField label="关联班级" required value={settings.className} onChange={value => updateSetting('className', value)} options={['初二 (3) 班', '初二 (1) 班', '初二 (2) 班']} />
          </div>

          <div className="border-t border-slate-100 mt-4 pt-4 space-y-3">
            <ToggleRow icon={<CheckCircle2 className="w-5 h-5 text-brand-500" />} title="自动识别题目" sub="识别课件中的题目并提取知识信息" on={settings.autoDetectQuestions} onToggle={() => toggleSetting('autoDetectQuestions')} />
            <ToggleRow icon={<Edit3 className="w-5 h-5 text-brand-500" />} title="生成课件目录" sub="根据课件结构自动生成目录" on={settings.generateOutline} onToggle={() => toggleSetting('generateOutline')} />
            <ToggleRow icon={<Cloud className="w-5 h-5 text-brand-500" />} title="上传到云端资源库" sub="导入完成后保存到我的资源库" on={settings.uploadToCloud} onToggle={() => toggleSetting('uploadToCloud')} />
          </div>
        </div>
      </div>

      {/* 上传进度 + 解析结果预览 */}
      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5 space-y-3">
          <div className="text-sm font-semibold text-slate-800 mb-1">解析进度</div>
          {progress.map(item => (
            <ProgressRow key={item.label} {...item} />
          ))}
          {stage === 'idle' && <div className="text-xs text-slate-400">尚未选择文件</div>}
          {stage === 'error' && <div className="text-xs text-red-500">解析中断，请重试或换文件</div>}
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold text-slate-800 mb-3">解析完成预览</div>
          {deck ? (
            deck.video ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 py-10 flex flex-col items-center text-sm text-slate-500">
                <Film className="w-8 h-8 text-emerald-500 mb-2" />
                视频素材页 · {deck.name}
              </div>
            ) : (
              <>
                <div className="flex gap-3 mb-3 flex-wrap">
                  {deck.pages.slice(0, 4).map((p, i) => (
                    <PageThumb key={p.page} num={String(p.page)} src={p.dataUrl} active={i === 0} />
                  ))}
                </div>
                <div className="text-xs text-slate-400 mb-3">共 {deck.pageCount} 页</div>
                <div className="space-y-2 text-sm">
                  <ResultRow icon="📄" label={`${deck.pageCount} 页`} desc="真实渲染的课件页" color="brand" />
                  <ResultRow icon="🗂" label={(deck.ext || '').toUpperCase()} desc={deck.kind === 'office' ? 'Office 经 LibreOffice 转 PDF' : 'PDF / 图片直接渲染'} color="emerald" />
                  <ResultRow icon="⭐" label="可进入 T04 编辑器" desc="页图作背景，叠加互动 / 媒体层" color="amber" />
                </div>
              </>
            )
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-sm text-slate-400">
              选择文件后这里显示真实渲染的页面预览
            </div>
          )}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="flex justify-between">
        <Link to="/courseware" className="btn-ghost">取消</Link>
        <div className="flex gap-3">
          <Link
            to="/editor"
            onClick={(e) => { if (!deck) { e.preventDefault(); return } try { sessionStorage.setItem('bubu:enter-imported', '1') } catch {} }}
            className={`btn-primary ${deck ? '' : 'opacity-60 pointer-events-none'}`}
          >
            <Cloud className="w-4 h-4" /> 开始导入并进入编辑
          </Link>
          <Link
            to="/editor"
            onClick={(e) => { if (!deck) { e.preventDefault(); return } try { sessionStorage.setItem('bubu:enter-imported', '1') } catch {} }}
            className={`btn-ghost ${deck ? '' : 'opacity-60 pointer-events-none'}`}
          >
            <Edit3 className="w-4 h-4" /> 进入课件编辑
          </Link>
        </div>
      </div>
    </div>
  )
}

function FormatTag({ color, icon, title, desc, muted }) {
  const cls = {
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
    slate: 'bg-slate-100 text-slate-400'
  }[color]
  return (
    <div className={`border border-slate-100 rounded-lg p-2 flex items-center gap-2 ${muted ? 'opacity-70' : ''}`}>
      <div className={`w-7 h-7 rounded-md ${cls} flex items-center justify-center`}>{icon}</div>
      <div>
        <div className="text-slate-700 font-medium">{title}</div>
        <div className="text-slate-400 text-[10px]">{desc}</div>
      </div>
    </div>
  )
}

function FormField({ label, required, value, onChange, full, options }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-xs text-slate-500 mb-1">
        {required && <span className="text-red-500 mr-0.5">*</span>}{label}
      </div>
      {options ? (
        <select
          className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-brand-300"
          value={value}
          onChange={event => onChange(event.target.value)}
        >
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input
          className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-brand-300"
          value={value}
          onChange={event => onChange(event.target.value)}
        />
      )}
    </div>
  )
}

function ToggleRow({ icon, title, sub, on, onToggle }) {
  return (
    <button className="w-full flex items-center gap-3 text-left" onClick={onToggle}>
      {icon}
      <div className="flex-1">
        <div className="text-sm text-slate-700">{title}</div>
        <div className="text-xs text-slate-400">{sub}</div>
      </div>
      <div className={`relative w-9 h-5 rounded-full transition ${on ? 'bg-brand-500' : 'bg-slate-300'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </div>
    </button>
  )
}

function ProgressRow({ label, state, sub }) {
  const isDone = state === 'done'
  const isDoing = state === 'doing'
  return (
    <div className={state === 'wait' ? 'opacity-50' : ''}>
      <div className="flex items-center gap-2 text-sm mb-1">
        {isDone
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          : isDoing
            ? <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
            : <span className="w-4 h-4 rounded-full border-2 border-slate-300 inline-block" />}
        <span className="text-slate-700">{label}</span>
        <span className="ml-auto text-xs text-slate-500">{isDone ? '完成' : isDoing ? (sub || '进行中') : '等待'}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full transition-all ${isDone ? 'bg-emerald-500 w-full' : isDoing ? 'bg-brand-500 w-2/3' : 'bg-slate-200 w-0'}`} />
      </div>
    </div>
  )
}

function PageThumb({ num, active, src }) {
  return (
    <div className={`w-16 h-12 rounded border overflow-hidden ${active ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'} bg-white flex items-center justify-center text-xs text-slate-400 relative`}>
      {src ? <img src={src} alt={`第${num}页`} className="w-full h-full object-contain" /> : <span>{num}</span>}
      <span className="absolute bottom-0 right-0 text-[10px] bg-white/80 px-0.5 rounded-tl">{num}</span>
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
