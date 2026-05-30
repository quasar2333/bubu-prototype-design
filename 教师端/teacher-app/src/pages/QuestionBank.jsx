import { useMemo, useState } from 'react'
import {
  Bookmark,
  ChevronDown,
  CirclePlus,
  Clock3,
  FileText,
  Lightbulb,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from 'lucide-react'
import {
  difficultyOptions,
  mathGrade5Catalog,
  questionBankMock,
  questionTypeOptions,
  selectedQuestionIdsMock,
  textbookMeta,
} from '../data/index.js'

const pageTabs = ['作业', '测试', '考试']
const sceneOptions = ['全部', '预习', '作业', '单元测', '阶段检测', '期中', '期末', '真题', '模拟']
const moreOptions = ['年份', '地区', '来源', '能力维度']
const moreFilterGroups = {
  年份: ['2025年', '2024年', '2023年'],
  地区: ['湖南省', '广东省', '江苏省', '浙江省', '四川省', '河南省'],
  来源: ['期中试卷', '阶段检测', '单元测试', '同步练习', '周测卷', '月考试卷'],
  能力维度: ['计算能力', '应用意识', '推理能力'],
}
const sortOptions = ['综合', '最新', '热门']
const aiOptions = ['按章节均衡', '按难度递进', '按能力维度']

const difficultyStyle = {
  容易: 'bg-emerald-50 text-emerald-600',
  适中: 'bg-orange-50 text-orange-500',
  困难: 'bg-rose-50 text-rose-500',
}

const priorityQuestionIds = ['g5-q011', 'g5-q016', 'g5-q066', 'g5-q017', 'g5-q018']

export default function QuestionBank() {
  const [activeTab, setActiveTab] = useState('作业')
  const [activeScene, setActiveScene] = useState('全部')
  const [activeType, setActiveType] = useState('全部')
  const [activeDifficulty, setActiveDifficulty] = useState('全部')
  const [activeSort, setActiveSort] = useState('综合')
  const [keyword, setKeyword] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [moreFilters, setMoreFilters] = useState({ 年份: [], 地区: [], 来源: [], 能力维度: [] })
  const [selectedKnowledge, setSelectedKnowledge] = useState('除数是小数的小数除法')
  const [selectedIds, setSelectedIds] = useState(() => new Set(selectedQuestionIdsMock))
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(['g5-q011', 'g5-q016']))
  const [aiOpen, setAiOpen] = useState(true)
  const [aiLoading, setAiLoading] = useState('')
  const [visibleCount, setVisibleCount] = useState(8)

  const catalogCounts = useMemo(() => {
    const counts = {}
    mathGrade5Catalog.forEach(chapter => {
      let chapterCount = 0
      chapter.sections.forEach(section => {
        let sectionCount = 0
        section.knowledgePoints.forEach(point => {
          const pointCount = questionBankMock.filter(question => question.knowledgePoints.includes(point)).length
          counts[point] = pointCount
          sectionCount += pointCount
        })
        counts[section.id] = sectionCount
        chapterCount += sectionCount
      })
      counts[chapter.id] = chapterCount
    })
    return counts
  }, [])

  const filteredQuestions = useMemo(() => {
    const normalizedKeyword = keyword.trim()
    const ranked = [...questionBankMock].sort((left, right) => {
      const leftPriority = priorityQuestionIds.indexOf(left.id)
      const rightPriority = priorityQuestionIds.indexOf(right.id)
      if (leftPriority !== -1 || rightPriority !== -1) {
        return (leftPriority === -1 ? 99 : leftPriority) - (rightPriority === -1 ? 99 : rightPriority)
      }
      return left.number - right.number
      })

    return ranked
      .filter(question => !selectedKnowledge || question.knowledgePoints.includes(selectedKnowledge))
      .filter(question => activeScene === '全部' || question.scene === activeScene)
      .filter(question => activeType === '全部' || question.type === activeType)
      .filter(question => activeDifficulty === '全部' || question.difficulty === activeDifficulty)
      .filter(question => matchesMoreFilters(question, moreFilters))
      .filter(question => {
        if (!normalizedKeyword) return true
        return question.content.includes(normalizedKeyword) || question.knowledgePoints.some(point => point.includes(normalizedKeyword))
      })
  }, [activeDifficulty, activeScene, activeType, keyword, moreFilters, selectedKnowledge])

  const visibleQuestions = filteredQuestions.slice(0, visibleCount)

  const selectedQuestions = questionBankMock.filter(question => selectedIds.has(question.id))
  const totalScore = selectedQuestions.reduce((sum, question) => sum + question.score, 0)
  const totalMinutes = selectedQuestions.reduce((sum, question) => sum + question.estimatedMinutes, 0)

  const toggleSelected = (questionId) => {
    setSelectedIds(current => {
      const next = new Set(current)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  const toggleFavorite = (questionId) => {
    setFavoriteIds(current => {
      const next = new Set(current)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  const toggleMoreFilter = (group, value) => {
    setMoreFilters(current => {
      const activeValues = current[group]
      const nextValues = activeValues.includes(value)
        ? activeValues.filter(item => item !== value)
        : [...activeValues, value]
      return { ...current, [group]: nextValues }
    })
  }

  const applyAiRecommend = (mode) => {
    setAiLoading(mode)
    window.setTimeout(() => {
      setSelectedIds(current => {
        const next = new Set(current)
        visibleQuestions.slice(0, 3).forEach(question => next.add(question.id))
        return next
      })
      setAiLoading('')
    }, 450)
  }

  return (
    <div className="h-full p-6 bg-[#f5f8fc] overflow-hidden relative">
      <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4 h-full">
        <section className="min-w-0 min-h-0 flex flex-col gap-4">
          <div className="grid grid-cols-[270px_minmax(0,1fr)] gap-4">
            <div className="card p-2 flex items-center gap-2 h-16">
              {pageTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-10 flex-1 rounded-lg text-sm font-semibold transition ${
                    activeTab === tab ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="card p-3 h-16 flex items-center gap-4">
              <SelectButton value={textbookMeta.subject} />
              <SelectButton value={textbookMeta.publisher} />
              <SelectButton value={`${textbookMeta.grade}${textbookMeta.volume}`} />
              <button className="ml-auto h-10 px-4 text-sm text-brand-600 font-semibold hover:bg-brand-50 rounded-lg flex items-center gap-2">
                切换教材 <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-4 min-h-0 flex-1">
            <CatalogPanel selectedKnowledge={selectedKnowledge} onSelect={setSelectedKnowledge} catalogCounts={catalogCounts} />

            <main className="min-w-0 min-h-0 flex flex-col gap-3 overflow-hidden">
              <FilterPanel
                activeScene={activeScene}
                activeType={activeType}
                activeDifficulty={activeDifficulty}
                moreOpen={moreOpen}
                moreFilters={moreFilters}
                onScene={setActiveScene}
                onType={setActiveType}
                onDifficulty={setActiveDifficulty}
                onToggleMoreOpen={() => setMoreOpen(open => !open)}
                onToggleMoreFilter={toggleMoreFilter}
              />

              <div className="card min-h-0 flex-1 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    {sortOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => setActiveSort(option)}
                        className={`text-sm pb-1 border-b-2 ${
                          activeSort === option ? 'text-brand-600 border-brand-600 font-semibold' : 'text-slate-500 border-transparent'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="relative w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={keyword}
                        onChange={event => setKeyword(event.target.value)}
                        className="input w-full pl-9 rounded-lg"
                        placeholder="在结果中搜索"
                      />
                    </div>
                    <div className="text-sm text-slate-600">
                      共 <span className="text-red-500 font-semibold">13,408</span> 道试题
                    </div>
                    <button className="btn-ghost h-9 text-brand-600 border-brand-200 bg-white">
                      <Sparkles className="w-4 h-4" /> 智能推荐
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                  {visibleQuestions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      displayNumber={index + 1}
                      selected={selectedIds.has(question.id)}
                      favorite={favoriteIds.has(question.id)}
                      onToggleSelected={() => toggleSelected(question.id)}
                      onToggleFavorite={() => toggleFavorite(question.id)}
                    />
                  ))}
                  {visibleQuestions.length < filteredQuestions.length && (
                    <div className="py-3 text-center">
                      <button
                        onClick={() => setVisibleCount(count => count + 8)}
                        className="h-9 px-5 rounded-lg border border-brand-200 bg-white text-brand-600 text-sm font-semibold hover:bg-brand-50"
                      >
                        加载更多（{visibleQuestions.length}/{filteredQuestions.length}）
                      </button>
                    </div>
                  )}
                  {visibleQuestions.length === 0 && (
                    <div className="py-12 text-center text-sm text-slate-400">当前筛选下暂无题目</div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </section>

        <BasketPanel
          selectedCount={selectedIds.size}
          totalScore={totalScore}
          totalMinutes={totalMinutes}
          onClear={() => setSelectedIds(new Set())}
        />
      </div>

      <div className="absolute right-[322px] bottom-7 flex flex-col items-end gap-2">
        {aiOpen && (
          <div className="w-28 rounded-lg bg-white border border-slate-200 shadow-lg overflow-hidden text-xs text-slate-600">
            {aiOptions.map(option => (
              <button
                key={option}
                onClick={() => applyAiRecommend(option)}
                className="w-full px-3 py-2 text-left hover:bg-brand-50 hover:text-brand-600"
              >
                {aiLoading === option ? '生成中...' : option}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setAiOpen(open => !open)}
          className="w-14 h-14 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/30 flex flex-col items-center justify-center text-[10px]"
        >
          <Lightbulb className="w-6 h-6" />
          智能组卷
        </button>
      </div>
    </div>
  )
}

function matchesMoreFilters(question, moreFilters) {
  const checks = {
    年份: value => question.source.includes(value),
    地区: value => question.source.includes(value),
    来源: value => question.source.includes(value),
    能力维度: value => {
      if (value === '计算能力') return question.type === '计算题' || question.knowledgePoints.some(point => point.includes('计算'))
      if (value === '应用意识') return question.type === '应用题' || question.knowledgePoints.some(point => point.includes('应用') || point.includes('解决问题'))
      if (value === '推理能力') return question.difficulty === '困难' || question.knowledgePoints.some(point => point.includes('推理') || point.includes('规律'))
      return true
    },
  }

  return Object.entries(moreFilters).every(([group, values]) => {
    if (!values.length) return true
    return values.some(value => checks[group]?.(value))
  })
}

function SelectButton({ value }) {
  return (
    <button className="h-10 min-w-[150px] px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 flex items-center justify-between">
      <span>{value}</span>
      <ChevronDown className="w-4 h-4 text-slate-500" />
    </button>
  )
}

function FilterPanel({
  activeScene,
  activeType,
  activeDifficulty,
  moreOpen,
  moreFilters,
  onScene,
  onType,
  onDifficulty,
  onToggleMoreOpen,
  onToggleMoreFilter,
}) {
  return (
    <div className="card px-4 py-3 space-y-3">
      <FilterRow label="场景" options={sceneOptions} active={activeScene} onChange={onScene} />
      <FilterRow label="题型" options={questionTypeOptions} active={activeType} onChange={onType} />
      <FilterRow label="难度" options={difficultyOptions} active={activeDifficulty} onChange={onDifficulty} />
      <div className="flex items-center gap-4 text-sm">
        <span className="w-10 text-slate-500">更多</span>
        {moreOptions.map(option => (
          <button
            key={option}
            onClick={onToggleMoreOpen}
            className={`h-7 px-3 rounded-md flex items-center gap-1 ${
              moreFilters[option].length ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {option} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        ))}
        <button onClick={onToggleMoreOpen} className="ml-auto h-7 px-3 text-brand-600 hover:bg-brand-50 rounded-md">+ 多选</button>
      </div>
      {moreOpen && (
        <div className="rounded-lg border border-brand-100 bg-brand-50/40 px-3 py-2 space-y-2">
          {Object.entries(moreFilterGroups).map(([group, values]) => (
            <div key={group} className="flex items-center gap-3 text-xs">
              <span className="w-14 text-slate-500">{group}</span>
              <div className="flex flex-wrap gap-2">
                {values.map(value => {
                  const active = moreFilters[group].includes(value)
                  return (
                    <button
                      key={value}
                      onClick={() => onToggleMoreFilter(group, value)}
                      className={`h-6 px-2 rounded border ${
                        active ? 'border-brand-300 bg-white text-brand-600 font-semibold' : 'border-transparent bg-white/60 text-slate-500 hover:bg-white'
                      }`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterRow({ label, options, active, onChange }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="w-10 text-slate-500">{label}</span>
      {options.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`h-7 px-3 rounded-md ${
            active === option ? 'border border-brand-300 bg-brand-50 text-brand-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function CatalogPanel({ selectedKnowledge, onSelect, catalogCounts }) {
  const [expanded, setExpanded] = useState(() => new Set(['g5a-c3', 'g5a-c3-s2']))

  const toggle = (id) => {
    setExpanded(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <aside className="card p-4 overflow-y-auto">
      <div className="flex items-center gap-8 border-b border-slate-100 mb-3">
        <button className="text-sm font-semibold text-brand-600 border-b-2 border-brand-600 pb-2">章节目录</button>
        <button className="text-sm text-slate-500 pb-2">知识点</button>
      </div>
      <div className="space-y-1 text-sm">
        {mathGrade5Catalog.map(chapter => {
          const chapterOpen = expanded.has(chapter.id)
          return (
            <div key={chapter.id}>
              <button onClick={() => toggle(chapter.id)} className="w-full h-8 flex items-center gap-2 text-left text-slate-700">
                <NodeIcon open={chapterOpen} active={chapter.number === 3} />
                <span className="flex-1">{chapter.number} {chapter.title}</span>
                <span className="text-[11px] text-slate-400">{catalogCounts[chapter.id] ?? 0}</span>
              </button>
              {chapterOpen && (
                <div className="ml-6 border-l border-slate-200 pl-3 space-y-1">
                  {chapter.sections.map(section => {
                    const sectionOpen = expanded.has(section.id) || section.title === '一个数除以小数'
                    return (
                      <div key={section.id}>
                        <button onClick={() => toggle(section.id)} className="w-full h-8 flex items-center gap-2 text-left text-slate-600">
                          <NodeIcon open={sectionOpen} active={section.title === '一个数除以小数'} small />
                          <span className="truncate flex-1">{section.title}</span>
                          <span className="text-[11px] text-slate-400">{catalogCounts[section.id] ?? 0}</span>
                        </button>
                        {sectionOpen && (
                          <div className="ml-6 space-y-1">
                            {section.knowledgePoints.map(point => (
                              <button
                                key={point}
                                onClick={() => onSelect(point)}
                                className={`w-full h-8 px-2 rounded-md text-left text-xs truncate ${
                                  selectedKnowledge === point ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                <span>{point}</span>
                                <span className="float-right text-[11px] text-slate-400">{catalogCounts[point] ?? 0}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function NodeIcon({ open, active, small }) {
  return (
    <span className={`${small ? 'w-4 h-4' : 'w-5 h-5'} rounded-full flex items-center justify-center text-[11px] ${
      active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
    }`}>
      {open ? '−' : '+'}
    </span>
  )
}

function QuestionCard({ question, displayNumber, selected, favorite, onToggleSelected, onToggleFavorite }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-brand-200 transition">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-5 h-5 rounded bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">
          {displayNumber}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <p className="text-sm leading-7 text-slate-800 flex-1">{question.content}</p>
            <button onClick={onToggleFavorite} className={favorite ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}>
              <Star className={`w-5 h-5 ${favorite ? 'fill-amber-300' : ''}`} />
            </button>
          </div>

          <div className="mt-2 flex items-center flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-slate-100 text-slate-500">来源：{question.source}</span>
            <span className={`px-2 py-1 rounded ${difficultyStyle[question.difficulty]}`}>难度：{question.difficulty}</span>
            <span className="px-2 py-1 rounded bg-slate-100 text-slate-500">知识点：{question.knowledgePoints.slice(0, 2).join('、')}</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>2024年</span>
              <span>湖南省</span>
              <span>来自：{displayNumber % 2 ? '期中试卷' : '单元测试'}</span>
            </div>
            <div className="flex items-center gap-5">
              {['相似题', '纠错', '详情', '收藏'].map(action => (
                <button key={action} className="text-brand-600 hover:text-brand-700">{action}</button>
              ))}
              <button
                onClick={onToggleSelected}
                className={`h-8 px-3 rounded-md text-white font-semibold flex items-center gap-1 ${
                  selected ? 'bg-slate-400 hover:bg-slate-500' : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                <CirclePlus className="w-4 h-4" /> {selected ? '已加入' : '加入试题栏'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function BasketPanel({ selectedCount, totalMinutes, totalScore, onClear }) {
  const countCards = [
    ['计算题', '4/6', 'text-brand-600 bg-blue-50'],
    ['填空题', '2/4', 'text-emerald-600 bg-emerald-50'],
    ['解答题', '2/3', 'text-violet-600 bg-violet-50'],
  ]

  return (
    <aside className="card p-5 min-h-0 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-slate-900">试题栏</h2>
        <span className="text-sm text-slate-700">共 {selectedCount} 题</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {countCards.map(([label, count, className]) => (
          <div key={label} className={`rounded-lg px-3 py-3 text-center ${className}`}>
            <div className="text-sm font-semibold">{label}</div>
            <div className="mt-2 text-xl font-bold">{count}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="text-sm text-slate-500 mb-3">排版模板</div>
        <div className="grid grid-cols-2 gap-3">
          <button className="h-10 rounded-lg border border-brand-500 text-brand-600 bg-brand-50 font-semibold">作业排版</button>
          <button className="h-10 rounded-lg border border-slate-200 text-slate-500 bg-white">考试排版</button>
        </div>
      </div>

      <div className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
        <Metric icon={Clock3} label="预计时长" value={`${Math.max(28, totalMinutes)} 分钟`} />
        <Metric icon={FileText} label="总分" value={Math.max(100, totalScore)} />
        <Metric icon={Sparkles} label="难度" value="适中" accent="text-orange-500" />
      </div>

      <div className="mt-6 space-y-3">
        <button className="btn-primary w-full h-12 text-base">去排版</button>
        <button className="w-full h-11 rounded-lg bg-brand-50 text-brand-600 font-semibold hover:bg-brand-100">智能组卷</button>
        <button className="w-full h-11 rounded-lg bg-brand-50 text-brand-600 font-semibold hover:bg-brand-100">手动组卷</button>
        <button className="btn-ghost w-full h-11 text-brand-600 border-brand-200">
          <Upload className="w-4 h-4" /> 导入题目
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
        <button onClick={onClear} className="h-10 text-slate-500 hover:text-rose-500 flex items-center justify-center gap-2">
          <Trash2 className="w-4 h-4" /> 清空试题栏
        </button>
        <button className="h-10 text-slate-600 hover:text-brand-600 flex items-center justify-center gap-2">
          <Bookmark className="w-4 h-4" /> 保存为题篮
        </button>
      </div>
    </aside>
  )
}

function Metric({ icon: Icon, label, value, accent = 'text-slate-900' }) {
  return (
    <div className="h-14 flex items-center gap-3">
      <Icon className="w-5 h-5 text-brand-500" />
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`ml-auto text-sm font-bold ${accent}`}>{value}</span>
    </div>
  )
}
