import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown, ChevronUp, ClipboardCheck, ClipboardList, Eye, FileText,
  MessageSquareText, Plus, RotateCw, Search, Send, Trash2, X
} from 'lucide-react'
import {
  deleteDraftFromStore,
  publishDraftFromStore,
  getHomeworkListData,
  getHomeworkItems,
  CLASS_NAMES
} from '../data/homeworkStore.js'

const TABS = [
  { key: '未发布', label: '未发布' },
  { key: '待批阅', label: '已发布（待批阅）' },
  { key: '待讲评', label: '待讲评' }
]

const CLASSES = ['全部班级', ...CLASS_NAMES]
const PUBLISH_CLASSES = [...CLASS_NAMES]
const PAGE_SIZE = 8

const FLOW = [
  { n: 1, title: '命名作业', sub: '填写作业名称和说明' },
  { n: 2, title: '去题库选题', sub: '从题库选择题目加入作业' },
  { n: 3, title: '排版', sub: '调整题目顺序与版式' },
  { n: 4, title: '保存或发布', sub: '保存草稿或发布给学生' }
]

const stateBg = {
  草稿: 'bg-slate-100 text-slate-600',
  待批阅: 'bg-amber-100 text-amber-700',
  批阅中: 'bg-brand-100 text-brand-700',
  待讲评: 'bg-violet-100 text-violet-700'
}

export default function Homework() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState('未发布')
  const [data, setData] = useState(() => getHomeworkListData())
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [viewingRow, setViewingRow] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [klass, setKlass] = useState('全部班级')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('五年级小数除法巩固练习')
  const [flowOpen, setFlowOpen] = useState(true)
  const [selectedClassByRow, setSelectedClassByRow] = useState({})
  const [publishingDraft, setPublishingDraft] = useState(null)
  const [publishClasses, setPublishClasses] = useState(() => new Set())
  const [publishDeadline, setPublishDeadline] = useState('2026-06-02T23:59')
  const [toast, setToast] = useState('')

  useEffect(() => {
    setData(getHomeworkListData())
    if (location.state?.toast) showToast(location.state.toast)
  }, [location.state])

  const rows = useMemo(() =>
    data[tab].filter(row =>
      (!keyword.trim() || row.name.includes(keyword.trim())) &&
      hasClass(row, klass) &&
      inDateRange(row, startDate, endDate)
    ), [data, tab, keyword, klass, startDate, endDate])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [tab, keyword, klass, startDate, endDate])
  useEffect(() => { if (page > pageCount) setPage(pageCount) }, [page, pageCount])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const deleteDraft = (id) => { setData(deleteDraftFromStore(id)); setConfirmDelete(null) }

  const editDraft = (row) => {
    const items = row.items?.length ? row.items : getHomeworkItems(row.id)
    navigate('/homework/select', { state: { id: row.id, name: row.name, selectedIds: items.map(q => q.id), items } })
  }

  const startPublishDraft = (row) => {
    setPublishingDraft(row)
    setPublishClasses(new Set(splitClasses(row.klass)))
    setPublishDeadline('2026-06-02T23:59')
  }

  const confirmPublishDraft = () => {
    if (!publishingDraft) return
    if (publishClasses.size === 0) {
      showToast('请选择发布班级')
      return
    }

    setData(publishDraftFromStore(publishingDraft, [...publishClasses], publishDeadline))
    setPublishingDraft(null)
    setTab('待批阅')
    showToast('已发布作业，已通知学生')
  }

  const togglePublishClass = (className) => {
    setPublishClasses(prev => {
      const next = new Set(prev)
      next.has(className) ? next.delete(className) : next.add(className)
      return next
    })
  }

  const goSelect = () => {
    setShowCreate(false)
    navigate('/homework/select', { state: { name: name.trim(), selectedIds: [] } })
  }

  const resetFilters = () => {
    setKeyword('')
    setKlass('全部班级')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="p-6 grid grid-cols-[1fr_300px] gap-5">
      <div className="space-y-4 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setShowCreate(true)} className="btn-primary h-9">
            <Plus className="w-4 h-4" /> 新建作业
          </button>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <select value={klass} onChange={e => setKlass(e.target.value)} className="input appearance-none pr-8 cursor-pointer">
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input w-[140px] text-slate-500" />
            <span className="text-slate-300">–</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input w-[140px] text-slate-500" />
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={keyword} onChange={e => setKeyword(e.target.value)} className="input pl-8 w-[180px]" placeholder="搜索作业名称" />
            </div>
            <button onClick={resetFilters} title="重置筛选" className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50">
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 pt-4 flex items-center gap-6 border-b border-slate-100">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`pb-3 text-sm relative whitespace-nowrap ${tab === t.key ? 'text-brand-600 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}>
                {t.label}
                <span className={`ml-1 text-xs ${tab === t.key ? 'text-brand-500' : 'text-slate-400'}`}>{data[t.key].length}</span>
                {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
              </button>
            ))}
          </div>

          {rows.length === 0 ? (
            <EmptyState tab={tab} onCreate={() => setShowCreate(true)} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-100">
                  <th className="text-left py-3 px-5 font-normal">作业名称</th>
                  <th className="text-left py-3 font-normal">当前班级</th>
                  <th className="text-left py-3 font-normal">题量</th>
                  <th className="text-left py-3 font-normal">截止时间</th>
                  <th className="text-left py-3 font-normal">{tab === '未发布' ? '保存进度' : tab === '待批阅' ? '提交 / 批阅进度' : '批阅进度'}</th>
                  <th className="text-left py-3 font-normal">状态</th>
                  <th className="text-right py-3 pr-5 font-normal">操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(row => (
                  <HomeworkRow
                    key={row.id}
                    row={row}
                    tab={tab}
                    selectedClassName={selectedClassByRow[row.id]}
                    onSelectClass={(className) => setSelectedClassByRow(prev => ({ ...prev, [row.id]: className }))}
                    onEdit={editDraft}
                    onDelete={() => setConfirmDelete(row)}
                    onView={() => setViewingRow(row)}
                    onPublish={() => startPublishDraft(row)}
                    onReview={(target) => target?.pubId && navigate(`/review/${target.pubId}`)}
                    onLecture={(target) => target?.pubId && navigate(`/lecture-gen/${target.pubId}`)}
                  />
                ))}
              </tbody>
            </table>
          )}

          {rows.length > 0 && (
            <div className="px-5 py-3 flex items-center justify-between text-sm border-t border-slate-50">
              <span className="text-slate-500">共 {rows.length} 条，第 {page}/{pageCount} 页</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent">‹</button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-md ${p === page ? 'bg-brand-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page >= pageCount} className="w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent">›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-800">作业流程</div>
            <button onClick={() => setFlowOpen(o => !o)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5">
              {flowOpen ? '收起' : '展开'} {flowOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
          {flowOpen && (
            <div className="mt-4 space-y-0">
              {FLOW.map((s, i) => (
                <div key={s.n} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${s.n === 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{s.n}</div>
                    {i < FLOW.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                  </div>
                  <div className="flex-1 pb-5">
                    <div className={`text-sm ${s.n === 1 ? 'text-brand-700 font-medium' : 'text-slate-700'}`}>{s.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowCreate(true)} className="btn-primary w-full h-9 mt-1">
                <Plus className="w-4 h-4" /> 新建作业
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="w-[440px] bg-white rounded-xl shadow-2xl p-6 animate-[fadeUp_.2s_ease-out]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="text-base font-semibold text-slate-800">新建作业</div>
              <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-sm text-slate-600 mb-1.5"><span className="text-rose-500">*</span> 作业名称</div>
            <div className="relative">
              <input
                autoFocus
                value={name}
                maxLength={50}
                onChange={e => setName(e.target.value)}
                className="input w-full pr-14"
                placeholder="请输入作业名称"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{name.length}/50</span>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-ghost h-9 px-5">取消</button>
              <button onClick={goSelect} disabled={!name.trim()} className="btn-primary h-9 px-5 disabled:opacity-40">去题库选题</button>
            </div>
          </div>
        </div>
      )}

      {publishingDraft && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center" onClick={() => setPublishingDraft(null)}>
          <div className="w-[460px] bg-white rounded-xl shadow-2xl p-6 animate-[fadeUp_.2s_ease-out]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-base font-semibold text-slate-800">发布作业</div>
                <div className="text-xs text-slate-400 mt-1">{publishingDraft.name}</div>
              </div>
              <button onClick={() => setPublishingDraft(null)} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>

            <div className="text-sm text-slate-600 mb-2"><span className="text-rose-500">*</span> 选择班级</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PUBLISH_CLASSES.map(className => (
                <button
                  key={className}
                  onClick={() => togglePublishClass(className)}
                  className={`h-10 rounded-lg border text-sm transition ${publishClasses.has(className) ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}
                >
                  {className}
                </button>
              ))}
            </div>

            <div className="text-sm text-slate-600 mb-1.5">截止时间</div>
            <input type="datetime-local" value={publishDeadline} onChange={e => setPublishDeadline(e.target.value)} className="input w-full" />

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setPublishingDraft(null)} className="btn-ghost h-9 px-5">取消</button>
              <button onClick={confirmPublishDraft} disabled={publishClasses.size === 0} className="btn-primary h-9 px-5 disabled:opacity-40">确认发布</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center" onClick={() => setConfirmDelete(null)}>
          <div className="w-[380px] bg-white rounded-xl shadow-2xl p-6 animate-[fadeUp_.2s_ease-out]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center"><Trash2 className="w-5 h-5 text-rose-500" /></div>
              <div className="text-base font-semibold text-slate-800">删除草稿</div>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed">确定删除草稿「{confirmDelete.name}」吗？此操作不可撤销。</div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost h-9 px-5">取消</button>
              <button onClick={() => deleteDraft(confirmDelete.id)} className="btn h-9 px-5 bg-rose-500 hover:bg-rose-600 text-white">删除</button>
            </div>
          </div>
        </div>
      )}

      {viewingRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center" onClick={() => setViewingRow(null)}>
          <div className="w-[560px] max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col animate-[fadeUp_.2s_ease-out]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <div className="text-base font-semibold text-slate-800 truncate">{viewingRow.name}</div>
                <div className="text-xs text-slate-400 mt-1">{viewingRow.klass || '待选班级'} · 共 {viewingRow.count} 题</div>
              </div>
              <button onClick={() => setViewingRow(null)} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {(viewingRow.items?.length ? viewingRow.items : getHomeworkItems(viewingRow.id)).map((q, i) => (
                <div key={q.id} className="border border-slate-100 rounded-lg p-3">
                  <div className="text-sm text-slate-800 leading-relaxed">
                    <span className="font-medium text-slate-500 mr-1">{i + 1}.</span>{q.stem}
                    <span className="text-xs text-slate-400 ml-2">（{q.score} 分）</span>
                  </div>
                  {q.lines?.map((l, li) => <div key={li} className="text-[13px] text-slate-500 mt-1 font-mono whitespace-pre-wrap">{l}</div>)}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="pill bg-slate-100 text-slate-500">{q.type}</span>
                    <span className="pill bg-slate-100 text-slate-500">{q.kp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 top-16 z-[60] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">✓ {toast}</div>
      )}
    </div>
  )
}

function HomeworkRow({ row, tab, selectedClassName, onSelectClass, onEdit, onDelete, onView, onPublish, onReview, onLecture }) {
  const target = getSelectedTarget(row, selectedClassName)
  const state = tab === '未发布' ? '草稿' : tab === '待讲评' ? '待讲评' : target?.state || row.state

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/40">
      <td className="py-3 px-5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-500" />
          <span className="text-slate-800">{row.name}</span>
        </div>
        {row.created && <div className="text-xs text-slate-400 mt-1 pl-6">创建于 {row.created}</div>}
        {tab !== '未发布' && (
          <ClassTargetButtons row={row} activeClassName={target?.name} onSelect={onSelectClass} />
        )}
      </td>
      <td className="text-slate-600">
        {tab === '未发布' ? row.klass : (
          <div>
            <div>{target?.name || '未选班级'}</div>
            <div className="text-[11px] text-slate-400 mt-1">共 {row.classTargets?.length || 0} 个班级</div>
          </div>
        )}
      </td>
      <td className="text-slate-600">{row.count} 题</td>
      <td className="text-slate-600 text-xs">{row.deadline}</td>
      <td className="pr-4"><ProgressCell tab={tab} row={row} target={target} /></td>
      <td><span className={`pill ${stateBg[state]}`}>{state}</span></td>
      <td className="text-right pr-5">
        <RowActions
          tab={tab}
          row={row}
          target={target}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onPublish={onPublish}
          onReview={onReview}
          onLecture={onLecture}
        />
      </td>
    </tr>
  )
}

function ClassTargetButtons({ row, activeClassName, onSelect }) {
  return (
    <div className="mt-2 pl-6 flex flex-wrap gap-1.5">
      {row.classTargets.map(target => (
        <button
          key={target.name}
          onClick={() => onSelect(target.name)}
          className={`px-2 py-1 rounded-md text-[11px] border transition ${activeClassName === target.name ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-500 hover:border-brand-200'}`}
        >
          {target.name} · 已批 {target.graded}/{target.submit}
        </button>
      ))}
    </div>
  )
}

function ProgressCell({ tab, row, target }) {
  if (tab === '未发布') return <span className="text-xs text-slate-400">草稿待完善</span>

  const progress = target || row
  if (tab === '待讲评') {
    return (
      <div className="flex items-center gap-2 max-w-[150px]">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-full" /></div>
        <span className="text-xs text-emerald-600">已批阅完成</span>
      </div>
    )
  }

  const pct = progress.total ? Math.round((progress.submit / progress.total) * 100) : 0
  return (
    <div className="max-w-[160px]">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${pct >= 80 ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} /></div>
        <span className="text-xs text-slate-500">{progress.submit}/{progress.total}</span>
      </div>
      <div className="text-[11px] text-slate-400 mt-1">已批 {progress.graded}/{progress.submit}</div>
    </div>
  )
}

function RowActions({ tab, row, target, onEdit, onDelete, onView, onPublish, onReview, onLecture }) {
  if (tab === '未发布') {
    return (
      <div className="flex items-center justify-end gap-3 text-xs">
        <button onClick={() => onEdit(row)} className="text-brand-600 hover:underline">继续编辑</button>
        <button onClick={onPublish} className="text-slate-500 hover:text-brand-600">发布</button>
        <button onClick={onDelete} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )
  }
  if (tab === '待批阅') {
    return (
      <div className="flex items-center justify-end gap-3 text-xs">
        <button onClick={() => onReview(target)} className="text-brand-600 font-medium hover:underline flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5" /> 批阅</button>
        <button onClick={() => onView?.(row)} className="text-slate-500 hover:text-brand-600 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 查看</button>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <button onClick={() => onLecture(target)} className="text-violet-600 font-medium hover:underline flex items-center gap-1"><MessageSquareText className="w-3.5 h-3.5" /> 讲评</button>
      <button onClick={() => onView?.(row)} className="text-slate-500 hover:text-brand-600 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 查看</button>
    </div>
  )
}

function EmptyState({ tab, onCreate }) {
  const text = {
    未发布: { title: '暂无未发布作业', sub: '点击新建作业，从题库选题后可保存为草稿' },
    待批阅: { title: '暂无待批阅作业', sub: '已发布且有学生提交的作业会出现在这里' },
    待讲评: { title: '暂无待讲评作业', sub: '批阅完成的作业可在这里组织课堂讲评' }
  }[tab]
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="relative w-20 h-20 mb-4">
        <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center">
          <ClipboardList className="w-9 h-9 text-slate-300" />
        </div>
        <Send className="w-5 h-5 text-brand-400 absolute -right-1 -bottom-1 bg-white rounded-full p-0.5" />
      </div>
      <div className="text-slate-700 font-medium">{text.title}</div>
      <div className="text-xs text-slate-400 mt-1">{text.sub}</div>
      {tab === '未发布' && (
        <button onClick={onCreate} className="btn-primary h-9 px-5 mt-4"><Plus className="w-4 h-4" /> 新建作业</button>
      )}
    </div>
  )
}

function getSelectedTarget(row, selectedClassName) {
  const targets = row.classTargets || []
  if (targets.length === 0) return null
  return targets.find(target => target.name === selectedClassName) || targets[0]
}

function getRowDate(row) {
  const value = row.created || row.deadline || ''
  const match = value.match(/\d{4}-\d{2}-\d{2}/)
  return match?.[0] || ''
}

function inDateRange(row, startDate, endDate) {
  const rowDate = getRowDate(row)
  if (!rowDate) return !startDate && !endDate
  if (startDate && rowDate < startDate) return false
  if (endDate && rowDate > endDate) return false
  return true
}

function splitClasses(klass) {
  return String(klass || '')
    .split('、')
    .map(item => item.trim())
    .filter(item => item && item !== '待选班级')
}

function hasClass(row, klass) {
  if (klass === '全部班级') return true
  if (Array.isArray(row.classTargets) && row.classTargets.length) {
    return row.classTargets.some(target => target.name === klass)
  }
  return row.klass === klass
}
