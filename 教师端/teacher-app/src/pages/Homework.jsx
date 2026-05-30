import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  Filter,
  ListOrdered,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  Send,
  X
} from 'lucide-react'

const tabs = ['未发布', '已发布（待批阅）', '待讲评']

const homeworkRows = [
  {
    id: 'hw_001',
    name: '五年级小数除法巩固练习',
    className: '五(1)班',
    questionCount: 18,
    deadline: '2026-06-02 20:00',
    progress: '0/45',
    status: '草稿'
  },
  {
    id: 'hw_002',
    name: '小数乘除法综合训练',
    className: '五(2)班',
    questionCount: 22,
    deadline: '2026-06-04 20:00',
    progress: '12/46',
    status: '待发布'
  },
  {
    id: 'hw_003',
    name: '植树问题专题练习',
    className: '五(3)班',
    questionCount: 12,
    deadline: '2026-06-05 18:30',
    progress: '0/44',
    status: '草稿'
  }
]

const processSteps = [
  { title: '命名作业', desc: '填写作业名称和说明', icon: PenLine },
  { title: '去题库选题', desc: '从题库选择题目加入作业', icon: ClipboardList },
  { title: '排版', desc: '调整题目顺序与版式', icon: ListOrdered },
  { title: '保存或发布', desc: '保存草稿或发布给学生', icon: Send }
]

export default function Homework() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('未发布')
  const [selectedClass, setSelectedClass] = useState('全部班级')
  const [keyword, setKeyword] = useState('')
  const [homeworkName, setHomeworkName] = useState('五年级小数除法巩固练习')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showRows, setShowRows] = useState(false)

  const visibleRows = useMemo(() => {
    if (!showRows) return []
    return homeworkRows.filter((item) => {
      const classMatched = selectedClass === '全部班级' || item.className === selectedClass
      const keywordMatched = !keyword.trim() || item.name.includes(keyword.trim())
      return classMatched && keywordMatched
    })
  }, [keyword, selectedClass, showRows])

  const goQuestionBank = () => {
    setIsModalOpen(false)
    navigate('/homework/select', { state: { homeworkName } })
  }

  return (
    <div className="relative min-h-full px-7 py-7 text-slate-700">
      <div className="grid grid-cols-[minmax(0,1fr)_330px] items-start gap-5">
        <section className="min-w-0 space-y-5">
          <div className="flex items-center justify-between gap-5">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="h-[52px] w-[172px] rounded-xl bg-brand-600 text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.8)] hover:bg-brand-700 transition flex items-center justify-center gap-2 text-[16px] font-medium"
            >
              <Plus className="w-5 h-5" />
              新建作业
            </button>

            <div className="flex items-center gap-3">
              <SelectLike value={selectedClass} onClick={() => setSelectedClass(selectedClass === '全部班级' ? '五(1)班' : '全部班级')} />
              <DateRangeLike />
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="h-[52px] w-[270px] rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[15px] outline-none placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100/70"
                  placeholder="搜索作业名称"
                />
              </div>
              <button type="button" className="h-[52px] px-5 rounded-xl border border-slate-200 bg-white text-brand-600 text-[15px] flex items-center gap-2 hover:bg-brand-50">
                筛选
                <Filter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowRows((value) => !value)}
                className="h-[52px] w-[58px] rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50"
                aria-label="刷新"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white shadow-card min-h-[690px]">
            <div className="mx-7 pt-6 border-b border-slate-100">
              <div className="flex items-center gap-14">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={[
                      'relative pb-5 text-[17px] transition',
                      activeTab === tab ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-800'
                    ].join(' ')}
                  >
                    {tab}
                    {activeTab === tab && <span className="absolute left-0 right-0 -bottom-px h-[3px] rounded-full bg-brand-600" />}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-[calc(100%-56px)] mx-7 table-fixed text-left">
              <thead>
                <tr className="h-[58px] border-b border-slate-100 text-[16px] text-slate-500">
                  <th className="font-medium w-[25%]">作业名称</th>
                  <th className="font-medium w-[13%]">班级</th>
                  <th className="font-medium w-[12%]">题量</th>
                  <th className="font-medium w-[18%]">截止时间</th>
                  <th className="font-medium w-[18%]">提交/批阅进度</th>
                  <th className="font-medium w-[8%]">状态</th>
                  <th className="font-medium w-[6%] text-right">操作</th>
                </tr>
              </thead>
              {visibleRows.length > 0 && (
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.id} className="h-[70px] border-b border-slate-50 text-[15px] hover:bg-slate-50/70">
                      <td>
                        <div className="flex items-center gap-2 text-slate-800">
                          <FileText className="w-4 h-4 text-brand-500" />
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td>{row.className}</td>
                      <td>{row.questionCount} 题</td>
                      <td>{row.deadline}</td>
                      <td>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <span className="block h-full w-1/5 bg-brand-500 rounded-full" />
                          </span>
                          {row.progress}
                        </span>
                      </td>
                      <td><span className="pill bg-brand-50 text-brand-600">{row.status}</span></td>
                      <td className="text-right"><button className="text-brand-600 hover:underline">编辑</button></td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>

            {visibleRows.length === 0 && (
              <div className="relative h-[448px] flex flex-col items-center justify-center">
                <EmptyIllustration />
                <div className="mt-6 text-[22px] font-medium text-slate-700">暂无未发布作业</div>
                <div className="mt-3 text-[16px] text-slate-400">点击新建作业，从题库选题后可保存为草稿</div>
                <DashedGuide />
              </div>
            )}
          </div>
        </section>

        <ProcessPanel />
      </div>

      {isModalOpen && (
        <NewHomeworkModal
          value={homeworkName}
          onChange={setHomeworkName}
          onClose={() => setIsModalOpen(false)}
          onConfirm={goQuestionBank}
        />
      )}
    </div>
  )
}

function SelectLike({ value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[52px] w-[160px] rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-700 flex items-center justify-between hover:bg-slate-50"
    >
      {value}
      <ChevronDown className="w-4 h-4 text-slate-500" />
    </button>
  )
}

function DateRangeLike() {
  return (
    <button
      type="button"
      className="h-[52px] w-[302px] rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-400 flex items-center justify-between hover:bg-slate-50"
    >
      <span>开始日期</span>
      <span className="text-slate-500">~</span>
      <span>结束日期</span>
      <CalendarDays className="w-4 h-4 text-slate-400" />
    </button>
  )
}

function EmptyIllustration() {
  return (
    <div className="relative w-[104px] h-[92px]">
      <div className="absolute left-3 top-1 w-[74px] h-[80px] rounded-lg bg-gradient-to-b from-slate-100 to-slate-200 shadow-inner" />
      <div className="absolute left-7 top-[18px] w-11 h-3 bg-white/80 rounded-sm" />
      <div className="absolute left-7 top-[36px] w-14 h-3 bg-white/80 rounded-sm" />
      <div className="absolute left-7 top-[54px] w-9 h-3 bg-white/80 rounded-sm" />
      <Send className="absolute right-0 bottom-0 w-7 h-7 text-brand-500 fill-brand-500/20 rotate-12" />
    </div>
  )
}

function DashedGuide() {
  return (
    <svg className="absolute left-[150px] -top-[150px] w-[330px] h-[230px] pointer-events-none" viewBox="0 0 330 230" fill="none">
      <path
        d="M18 35 C148 67 236 115 254 224"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeDasharray="7 7"
        opacity="0.75"
      />
      <path d="M18 35 L46 30 L35 52 Z" fill="#3B82F6" opacity="0.8" />
    </svg>
  )
}

function ProcessPanel() {
  return (
    <aside className="rounded-xl border border-slate-100 bg-white shadow-card min-h-[465px] px-7 py-7">
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-semibold text-slate-800">作业流程</h2>
        <button type="button" className="text-[14px] text-brand-500 flex items-center gap-1">
          收起
          <ChevronDown className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      <div className="mt-8 space-y-9">
        {processSteps.map((step, index) => {
          const Icon = step.icon
          const active = index === 0
          return (
            <div key={step.title} className="relative flex gap-5">
              {index < processSteps.length - 1 && (
                <span className="absolute left-[13px] top-8 h-[58px] w-px bg-slate-200" />
              )}
              <div className={[
                'relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-semibold',
                active ? 'bg-brand-600 text-white shadow-[0_8px_18px_-8px_rgba(37,99,235,0.8)]' : 'bg-slate-100 text-slate-400'
              ].join(' ')}
              >
                {index + 1}
              </div>
              <Icon className={['mt-0.5 w-6 h-6', active ? 'text-brand-500' : 'text-slate-400'].join(' ')} />
              <div>
                <div className={['text-[17px] font-medium', active ? 'text-slate-800' : 'text-slate-500'].join(' ')}>{step.title}</div>
                <div className="mt-1 text-[14px] text-slate-400">{step.desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function NewHomeworkModal({ value, onChange, onClose, onConfirm }) {
  const displayCount = value === '五年级小数除法巩固练习' ? 13 : value.length

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center">
      <div className="w-[675px] h-[278px] rounded-xl bg-white shadow-[0_26px_70px_-25px_rgba(15,23,42,0.45)] border border-slate-200 px-8 py-7">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-semibold text-slate-900">新建作业</h2>
          <button type="button" onClick={onClose} className="text-slate-700 hover:text-slate-950">
            <X className="w-6 h-6" />
          </button>
        </div>

        <label className="block mt-8">
          <span className="text-[16px] font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>作业名称</span>
          <div className="relative mt-3">
            <input
              value={value}
              maxLength={50}
              onChange={(event) => onChange(event.target.value)}
              className="h-[45px] w-full rounded-lg border border-slate-300 px-4 pr-16 text-[17px] text-slate-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-slate-500">{displayCount}/50</span>
          </div>
        </label>

        <div className="mt-10 flex items-center justify-end gap-4">
          <button type="button" onClick={onClose} className="h-[50px] w-[108px] rounded-lg border border-slate-200 bg-white text-[17px] text-slate-700 hover:bg-slate-50">
            取消
          </button>
          <button type="button" onClick={onConfirm} className="h-[50px] w-[170px] rounded-lg bg-brand-600 text-[17px] font-medium text-white hover:bg-brand-700 shadow-[0_12px_24px_-12px_rgba(37,99,235,0.8)]">
            去题库选题
          </button>
        </div>
      </div>
    </div>
  )
}
