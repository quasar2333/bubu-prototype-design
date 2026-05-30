import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, Send, ChevronDown, Search, SlidersHorizontal, RotateCw, X,
  Trash2, Eye, ClipboardCheck, MessageSquareText, ClipboardList, ChevronUp
} from 'lucide-react'

const TABS = [
  { key: '未发布', label: '未发布' },
  { key: '待批阅', label: '已发布（待批阅）' },
  { key: '待讲评', label: '待讲评' }
]

const CLASSES = ['全部班级', '五 (1) 班', '五 (2) 班', '五 (3) 班']

const initialData = {
  未发布: [
    { id: 'd1', name: '五年级小数除法巩固练习', klass: '五 (1) 班', count: 12, deadline: '未设置', created: '2026-05-30 15:30' },
    { id: 'd2', name: '分数加减法基础练习', klass: '待选班级', count: 8, deadline: '未设置', created: '2026-05-29 10:12' },
    { id: 'd3', name: '多边形面积单元预习', klass: '五 (2) 班', count: 10, deadline: '未设置', created: '2026-05-28 09:40' }
  ],
  待批阅: [
    { id: 'p1', name: '小数乘法每日一练', klass: '五 (1) 班', count: 15, deadline: '2026-05-28 23:59', submit: 38, total: 45, graded: 12, state: '待批阅' },
    { id: 'p2', name: '位置与方向课后练', klass: '五 (2) 班', count: 10, deadline: '2026-05-27 23:59', submit: 45, total: 45, graded: 0, state: '待批阅' },
    { id: 'p3', name: '小数除法随堂检测', klass: '五 (1) 班', count: 18, deadline: '2026-05-26 23:59', submit: 40, total: 45, graded: 25, state: '批阅中' }
  ],
  待讲评: [
    { id: 'r1', name: '期中复习卷', klass: '五 (1) 班', count: 26, deadline: '2026-05-20 已截止', submit: 45, total: 45, graded: 45 },
    { id: 'r2', name: '小数乘法单元测', klass: '五 (2) 班', count: 20, deadline: '2026-05-18 已截止', submit: 43, total: 43, graded: 43 },
    { id: 'r3', name: '简易方程基础练', klass: '五 (1) 班', count: 16, deadline: '2026-05-15 已截止', submit: 45, total: 45, graded: 45 }
  ]
}

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
  const [tab, setTab] = useState('未发布')
  const [data, setData] = useState(initialData)
  const [keyword, setKeyword] = useState('')
  const [klass, setKlass] = useState('全部班级')
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('五年级小数除法巩固练习')
  const [flowOpen, setFlowOpen] = useState(true)
  const [toast, setToast] = useState('')

  const rows = useMemo(() =>
    data[tab].filter(r =>
      (!keyword.trim() || r.name.includes(keyword.trim())) &&
      (klass === '全部班级' || r.klass === klass)
    ), [data, tab, keyword, klass])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200) }
  const deleteDraft = (id) => setData(d => ({ ...d, 未发布: d.未发布.filter(r => r.id !== id) }))
  const editDraft = (r) => navigate('/homework/select', { state: { name: r.name } })
  const goSelect = () => { setShowCreate(false); navigate('/homework/select', { state: { name } }) }

  return (
    <div className="p-6 grid grid-cols-[1fr_300px] gap-5">
      <div className="space-y-4 min-w-0">
        {/* 工具栏 */}
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
            <input type="date" className="input w-[140px] text-slate-500" />
            <span className="text-slate-300">–</span>
            <input type="date" className="input w-[140px] text-slate-500" />
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={keyword} onChange={e => setKeyword(e.target.value)} className="input pl-8 w-[180px]" placeholder="搜索作业名称" />
            </div>
            <button className="btn-ghost h-9 px-3"><SlidersHorizontal className="w-3.5 h-3.5" /> 筛选</button>
            <button onClick={() => { setKeyword(''); setKlass('全部班级') }} className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50">
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 列表卡片 */}
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
                  <th className="text-left py-3 font-normal">班级</th>
                  <th className="text-left py-3 font-normal">题量</th>
                  <th className="text-left py-3 font-normal">截止时间</th>
                  <th className="text-left py-3 font-normal">{tab === '未发布' ? '保存进度' : tab === '待批阅' ? '提交 / 批阅进度' : '批阅进度'}</th>
                  <th className="text-left py-3 font-normal">状态</th>
                  <th className="text-right py-3 pr-5 font-normal">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/40">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-500" />
                        <span className="text-slate-800">{r.name}</span>
                      </div>
                      {r.created && <div className="text-xs text-slate-400 mt-1 pl-6">创建于 {r.created}</div>}
                    </td>
                    <td className="text-slate-600">{r.klass}</td>
                    <td className="text-slate-600">{r.count} 题</td>
                    <td className="text-slate-600 text-xs">{r.deadline}</td>
                    <td className="pr-4"><ProgressCell tab={tab} row={r} /></td>
                    <td><span className={`pill ${stateBg[tab === '未发布' ? '草稿' : tab === '待讲评' ? '待讲评' : r.state]}`}>{tab === '未发布' ? '草稿' : tab === '待讲评' ? '待讲评' : r.state}</span></td>
                    <td className="text-right pr-5">
                      <RowActions tab={tab} row={r} onEdit={editDraft} onDelete={deleteDraft}
                        onPublish={() => showToast('已发布作业，已通知学生')}
                        onReview={() => navigate('/review')}
                        onLecture={() => navigate('/lecture-gen')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {rows.length > 0 && (
            <div className="px-5 py-3 flex items-center justify-between text-sm border-t border-slate-50">
              <span className="text-slate-500">共 {rows.length} 条</span>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100">‹</button>
                <button className="w-8 h-8 rounded-md bg-brand-500 text-white">1</button>
                <button className="w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100">›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧：作业流程 */}
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

      {/* 新建作业弹窗 */}
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

      {toast && (
        <div className="fixed left-1/2 top-16 z-[60] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">✓ {toast}</div>
      )}
    </div>
  )
}

function ProgressCell({ tab, row }) {
  if (tab === '未发布') return <span className="text-xs text-slate-400">草稿待完善</span>
  if (tab === '待讲评') {
    return (
      <div className="flex items-center gap-2 max-w-[150px]">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-full" /></div>
        <span className="text-xs text-emerald-600">已批阅完成</span>
      </div>
    )
  }
  const pct = Math.round((row.submit / row.total) * 100)
  return (
    <div className="max-w-[160px]">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${pct >= 80 ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} /></div>
        <span className="text-xs text-slate-500">{row.submit}/{row.total}</span>
      </div>
      <div className="text-[11px] text-slate-400 mt-1">已批 {row.graded}/{row.submit}</div>
    </div>
  )
}

function RowActions({ tab, row, onEdit, onDelete, onPublish, onReview, onLecture }) {
  if (tab === '未发布') {
    return (
      <div className="flex items-center justify-end gap-3 text-xs">
        <button onClick={() => onEdit(row)} className="text-brand-600 hover:underline">继续编辑</button>
        <button onClick={onPublish} className="text-slate-500 hover:text-brand-600">发布</button>
        <button onClick={() => onDelete(row.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )
  }
  if (tab === '待批阅') {
    return (
      <div className="flex items-center justify-end gap-3 text-xs">
        <button onClick={onReview} className="text-brand-600 font-medium hover:underline flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5" /> 批阅</button>
        <button className="text-slate-500 hover:text-brand-600 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 查看</button>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <button onClick={onLecture} className="text-violet-600 font-medium hover:underline flex items-center gap-1"><MessageSquareText className="w-3.5 h-3.5" /> 讲评</button>
      <button className="text-slate-500 hover:text-brand-600 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 查看</button>
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
