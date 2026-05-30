import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Upload, FileText, Search, RefreshCw, RotateCcw, Grid3x3, List,
  Edit3, Eye, Send, Copy, Trash2, CheckCircle2, AlertTriangle, X,
  ChevronRight, ChevronLeft, CalendarDays
} from 'lucide-react'

const items = [
  { title: '8.2 一元一次不等式', pages: 18, subject: '数学', grade: '初二', className: '3班', textbook: '人教版', lesson: '第1课时', updated: '2026-05-15 14:32', status: '已同步', interact: true, gradient: 'from-blue-100 to-indigo-200' },
  { title: '7.3 平面直角坐标系', pages: 22, subject: '数学', grade: '初二', className: '3班', textbook: '人教版', lesson: '第2课时', updated: '2026-05-14 16:20', status: '已同步', interact: true, gradient: 'from-emerald-100 to-teal-200' },
  { title: '7.2 一次函数的图像', pages: 16, subject: '数学', grade: '初二', className: '3班', textbook: '人教版', lesson: '第1课时', updated: '2026-05-12 10:15', status: '已同步', interact: true, gradient: 'from-amber-100 to-orange-200' },
  { title: '概率初步复习', pages: 14, subject: '数学', grade: '初二', className: '3班', textbook: '人教版', lesson: '复习课', updated: '2026-05-10 09:45', status: '已同步', interact: true, gradient: 'from-rose-100 to-pink-200' },
  { title: '二次根式练习', pages: 12, subject: '数学', grade: '初二', className: '3班', textbook: '人教版', lesson: '练习课', updated: '2026-05-08 17:30', status: '已同步', interact: false, gradient: 'from-violet-100 to-purple-200' },
  { title: '期中复习课', pages: 28, subject: '数学', grade: '初二', className: '3班', textbook: '人教版', lesson: '复习课', updated: '2026-05-07 11:05', status: '已同步', interact: true, gradient: 'from-sky-100 to-cyan-200' }
]

export default function Courseware() {
  const [keyword, setKeyword] = useState('')
  const [view, setView] = useState('grid') // grid | list
  const [sortOrder, setSortOrder] = useState('desc')
  const [subject, setSubject] = useState('数学')
  const [grade, setGrade] = useState('初二')
  const [textbook, setTextbook] = useState('人教版')
  const [lesson, setLesson] = useState('全部')
  const [timeRange, setTimeRange] = useState('all')
  const [onlyInteractive, setOnlyInteractive] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selected, setSelected] = useState(new Set())

  const filtered = useMemo(() => {
    let result = [...items]
    if (keyword.trim()) {
      const kw = keyword.trim()
      result = result.filter(it => it.title.includes(kw) || it.lesson.includes(kw))
    }
    if (subject !== '全部') result = result.filter(it => it.subject === subject)
    if (grade !== '全部') result = result.filter(it => it.grade === grade)
    if (textbook !== '全部') result = result.filter(it => it.textbook === textbook)
    if (lesson !== '全部') result = result.filter(it => it.lesson === lesson)
    if (onlyInteractive) result = result.filter(it => it.interact)
    result.sort((a, b) => {
      const tA = new Date(a.updated).getTime()
      const tB = new Date(b.updated).getTime()
      if (sortOrder === 'timeAsc') return tA - tB
      if (sortOrder === 'pagesDesc') return b.pages - a.pages
      if (sortOrder === 'pagesAsc') return a.pages - b.pages
      return tB - tA
    })
    return result
  }, [keyword, subject, grade, textbook, lesson, onlyInteractive, sortOrder])

  const toggleSel = (i) => {
    const ns = new Set(selected)
    ns.has(i) ? ns.delete(i) : ns.add(i)
    setSelected(ns)
  }
  const clearSel = () => setSelected(new Set())
  const reset = () => {
    setKeyword('')
    setSubject('数学')
    setGrade('初二')
    setTextbook('人教版')
    setLesson('全部')
    setTimeRange('all')
    setOnlyInteractive(true)
    setSortOrder('timeDesc')
  }

  return (
    <div className={`p-6 gap-5 h-full ${sidebarOpen ? 'grid grid-cols-[1fr_280px]' : 'relative'}`}>
      <div className="flex flex-col min-w-0 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* 顶部操作按钮 */}
        <div className="flex gap-3">
          <Link to="/editor" className="btn-primary"><Plus className="w-4 h-4" /> 新建课件</Link>
          <Link to="/courseware/import" className="btn-ghost"><Upload className="w-4 h-4" /> 导入课件</Link>
          <button className="btn-ghost opacity-70 cursor-not-allowed" title="MVP 阶段不开放模板库">
            <FileText className="w-4 h-4" /> 从模板创建 <span className="text-[10px] text-slate-400">暂不开放</span>
          </button>
        </div>

        {/* 筛选区 */}
        <div className="card p-4">
          <div className="flex items-center gap-5 mb-3">
            <FilterSelect label="学科" value={subject} onChange={setSubject} options={['数学', '语文', '英语', '全部']} />
            <FilterSelect label="年级" value={grade} onChange={setGrade} options={['初二', '初一', '初三', '全部']} />
            <FilterSelect label="教材版本" value={textbook} onChange={setTextbook} options={['人教版', '北师大版', '苏教版', '全部']} />
            <FilterSelect label="课时" value={lesson} onChange={setLesson} options={['全部', '第1课时', '第2课时', '练习课', '复习课']} />
            <label className="flex items-center gap-2">
              <span className="text-sm text-slate-700 whitespace-nowrap">更新时间：</span>
              <div className="relative">
                <select className="input h-9 pr-9" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                  <option value="all">请选择日期</option>
                  <option value="week">最近一周</option>
                  <option value="month">最近一月</option>
                </select>
                <CalendarDays className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </label>
            <button
              onClick={() => setOnlyInteractive(value => !value)}
              className="ml-auto flex items-center gap-2 text-sm text-slate-700"
            >
              含互动
              <span className={`relative w-10 h-5 rounded-full transition ${onlyInteractive ? 'bg-brand-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${onlyInteractive ? 'left-[22px]' : 'left-0.5'}`} />
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-[360px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input w-full pl-9"
                placeholder="搜索课件名称、标签"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
              {keyword && (
                <button onClick={() => setKeyword('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 hover:bg-slate-100 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
            <button onClick={reset} className="btn-ghost h-9"><RotateCcw className="w-3.5 h-3.5" /> 重置</button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">排序:</span>
              <select
                className="input h-8 text-xs"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
              >
                <option value="timeDesc">最新在前</option>
                <option value="timeAsc">最早在前</option>
                <option value="pagesDesc">页数从高到低</option>
                <option value="pagesAsc">页数从低到高</option>
              </select>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-500">视图:</span>
              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={`w-9 h-9 flex items-center justify-center ${view === 'grid' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`w-9 h-9 flex items-center justify-center ${view === 'list' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 批量操作工具栏 */}
        {selected.size > 0 && (
          <div className="card p-3 flex items-center gap-3 bg-brand-50 border-brand-200">
            <span className="text-sm text-brand-700">已选择 <strong>{selected.size}</strong> 个课件</span>
            <button className="btn-ghost h-8 text-xs"><Send className="w-3 h-3" /> 批量发送</button>
            <button className="btn-ghost h-8 text-xs"><Copy className="w-3 h-3" /> 批量复制</button>
            <button className="btn-ghost h-8 text-xs text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3" /> 批量删除</button>
            <button onClick={clearSel} className="ml-auto text-xs text-slate-500 hover:text-slate-700">取消选择</button>
          </div>
        )}

        {/* 课件卡片网格 / 列表 */}
        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400 text-sm">没有找到匹配的课件</div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((it, i) => {
              const isSel = selected.has(i)
              return (
                <div
                  key={i}
                  className={`card overflow-hidden hover:shadow-soft transition group cursor-pointer relative ${isSel ? 'ring-2 ring-brand-500 border-brand-500' : ''}`}
                  onClick={() => toggleSel(i)}
                >
                  <div className={`h-32 bg-gradient-to-br ${it.gradient} relative flex items-center justify-center`}>
                    <CoursewareThumb title={it.title} />
                    {it.interact ? (
                      <span className="absolute top-2 right-2 pill bg-emerald-100 text-emerald-700">含互动</span>
                    ) : (
                      <span className="absolute top-2 right-2 pill bg-slate-100 text-slate-500">无互动</span>
                    )}
                    <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition ${isSel ? 'bg-brand-600 border-brand-600' : 'bg-white/90 border-slate-300 opacity-0 group-hover:opacity-100'}`}>
                      {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="text-sm font-medium text-slate-800 truncate">{it.title}</div>
                    <div className="text-xs text-slate-400">{it.subject}  ｜ {it.grade} ｜ {it.className}</div>
                    <div className="text-xs text-slate-400">共 {it.pages} 页</div>
                    <div className="text-xs text-slate-400">更新时间：{it.updated}</div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> {it.status}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 px-2 py-2 flex items-center justify-between text-xs text-slate-500" onClick={e => e.stopPropagation()}>
                    <CardAction to="/editor" icon={<Edit3 className="w-3 h-3" />} label="编辑" />
                    <CardAction icon={<Eye className="w-3 h-3" />} label="预览" />
                    <CardAction icon={<Send className="w-3 h-3" />} label="发送到白板" />
                    <CardAction icon={<Copy className="w-3 h-3" />} label="复制" />
                    <CardAction icon={<Trash2 className="w-3 h-3" />} label="删除" danger />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="py-2 px-3 text-left w-10"></th>
                  <th className="py-2 px-3 text-left">课件名称</th>
                  <th className="py-2 px-3 text-left">学科 / 班级</th>
                  <th className="py-2 px-3 text-center">页数</th>
                  <th className="py-2 px-3 text-center">互动</th>
                  <th className="py-2 px-3 text-left">更新时间</th>
                  <th className="py-2 px-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it, i) => {
                  const isSel = selected.has(i)
                  return (
                    <tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${isSel ? 'bg-brand-50/40' : ''}`} onClick={() => toggleSel(i)}>
                      <td className="py-2 px-3">
                        <input type="checkbox" checked={isSel} readOnly className="accent-brand-600" />
                      </td>
                      <td className="py-2 px-3 text-slate-800 font-medium">{it.title}</td>
                      <td className="py-2 px-3 text-slate-500">{it.subject} / {it.grade} / {it.className}</td>
                      <td className="py-2 px-3 text-center text-slate-500">{it.pages}</td>
                      <td className="py-2 px-3 text-center">
                        {it.interact ? <span className="pill bg-emerald-100 text-emerald-700">含互动</span> : <span className="pill bg-slate-100 text-slate-500">无</span>}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{it.updated}</td>
                      <td className="py-2 px-3 text-center text-xs" onClick={e => e.stopPropagation()}>
                        <Link to="/editor" className="text-brand-600 hover:underline mr-2">编辑</Link>
                        <button className="text-brand-600 hover:underline mr-2">预览</button>
                        <button className="text-red-500 hover:underline">删除</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        </div>

        {/* 分页 */}
        <div className="card p-3 flex items-center justify-between text-sm shrink-0">
          <span className="text-slate-500">共 24 个课件</span>
          <div className="flex items-center gap-1">
            <PageBtn>1</PageBtn>
            <PageBtn off>2</PageBtn>
            <PageBtn off>3</PageBtn>
            <PageBtn off>›</PageBtn>
          </div>
          <select className="input">
            <option>12 条/页</option>
          </select>
        </div>
      </div>

      {/* 右侧面板 */}
      {sidebarOpen ? (
        <div className="space-y-4 relative">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute -left-3 top-3 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 z-10"
            title="收起侧栏"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-800">云端同步</span>
              <button className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
                <RefreshCw className="w-3 h-3" /> 刷新
              </button>
            </div>

            <Section title="同步成功 (18)" defaultOpen>
              <Row green text="8.2 一元一次不等式" extra="今天 14:32" />
              <Row green text="7.3 平面直角坐标系" extra="今天 14:20" />
              <Row green text="概率初步复习" extra="今天 09:45" />
              <a className="text-xs text-brand-600 hover:underline mt-2 inline-block">查看全部成功记录</a>
            </Section>

            <Section title="上传中 (2)">
              <ProgressRow label="期中复习课" progress={65} status="正在上传 65%" />
              <ProgressRow label="二次根式练习" progress={30} status="正在上传 30%" />
            </Section>

            <Section title="同步失败 (1)">
              <Row red text="7.1 整式的乘除" extra="重试" extraLink />
              <div className="text-[11px] text-red-500 ml-5 mt-1">失败原因：网络异常</div>
            </Section>
          </div>

          <div className="card p-4">
            <div className="font-semibold text-slate-800 mb-3">存储空间</div>
            <div className="text-sm text-slate-700">已使用 <span className="font-semibold text-brand-600">6.12 GB</span> / 20 GB</div>
            <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-brand-500" style={{ width: '30%' }} />
            </div>
            <div className="text-xs text-slate-500 mt-1">30%</div>

            <div className="text-xs text-slate-500 mt-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500" /> 课件文件 <span className="ml-auto text-slate-700">4.82 GB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> 资源文件 <span className="ml-auto text-slate-700">1.30 GB</span>
              </div>
            </div>

            <button className="w-full mt-4 btn-ghost h-9">前往资源管理</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute right-4 top-4 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 z-10"
          title="展开侧栏"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}
    </div>
  )
}

function CoursewareThumb({ title }) {
  return (
    <div className="w-28 h-24 rounded-lg bg-white/80 border border-white/70 shadow-sm p-2 flex flex-col gap-1.5">
      <div className="h-2 rounded bg-brand-100 w-3/4" />
      <div className="space-y-1">
        <div className="h-1 rounded bg-slate-200 w-full" />
        <div className="h-1 rounded bg-slate-200 w-5/6" />
        <div className="h-1 rounded bg-slate-200 w-2/3" />
      </div>
      <div className="mt-auto h-10 rounded border border-slate-100 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 text-center px-1">
        {title.slice(0, 8)}
      </div>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-sm text-slate-700 whitespace-nowrap">{label}：</span>
      <select className="input h-9 min-w-[104px]" value={value} onChange={event => onChange(event.target.value)}>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function CardAction({ icon, label, danger, to }) {
  const className = `flex items-center gap-1 px-1.5 py-1 rounded hover:bg-slate-50 ${danger ? 'text-red-500' : ''}`
  if (to) {
    return (
      <Link to={to} className={className}>
        {icon} {label}
      </Link>
    )
  }
  return (
    <button className={className}>
      {icon} {label}
    </button>
  )
}

function PageBtn({ children, off }) {
  return (
    <button className={`w-8 h-8 rounded-md text-sm ${off ? 'text-slate-500 hover:bg-slate-100' : 'bg-brand-500 text-white'}`}>
      {children}
    </button>
  )
}

function Section({ title, children, defaultOpen }) {
  return (
    <div className="border-t border-slate-100 pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
      <div className="text-xs text-slate-600 font-medium mb-2 flex items-center justify-between">
        {title}
        <svg className={`w-3 h-3 text-slate-400 transition ${defaultOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" /></svg>
      </div>
      {children}
    </div>
  )
}

function Row({ text, extra, green, red, extraLink }) {
  return (
    <div className="flex items-center gap-2 text-sm py-1">
      {green && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
      {red && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
      <span className="text-slate-700 truncate flex-1">{text}</span>
      <span className={`text-xs ${extraLink ? 'text-brand-600 hover:underline cursor-pointer' : 'text-slate-400'}`}>{extra}</span>
    </div>
  )
}

function ProgressRow({ label, progress, status }) {
  return (
    <div className="py-1.5">
      <div className="flex items-center gap-2 text-sm">
        <RefreshCw className="w-3.5 h-3.5 text-brand-500 animate-spin" />
        <span className="text-slate-700 truncate flex-1">{label}</span>
      </div>
      <div className="flex items-center gap-2 mt-1 ml-5">
        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[11px] text-slate-400 whitespace-nowrap">{status}</span>
      </div>
    </div>
  )
}
