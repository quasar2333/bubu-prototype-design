import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Edit3,
  GripVertical,
  Info,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { mathGrade5Catalog, questionBankMock } from '../data/index.js'

const sceneOptions = ['全部', '作业', '课后练习', '单元测']
const typeOptions = ['全部', '选择题', '填空题', '判断题', '计算题', '解答题']
const difficultyOptions = ['全部', '容易', '中等', '困难']
const sourceOptions = ['校本题库', '近三年', '本学期', '只看新题']
const defaultSelectedIds = ['g5-q011', 'g5-q062', 'g5-q065']
const preferredQuestionIds = ['g5-q011', 'g5-q062', 'g5-q065', 'g5-q018', 'g5-q022', 'g5-q016', 'g5-q017', 'g5-q061']
const homeworkSceneIds = new Set(preferredQuestionIds.slice(0, 5))

export default function HomeworkSelect() {
  const navigate = useNavigate()
  const location = useLocation()
  const [homeworkName] = useState(location.state?.homeworkName || '五年级小数除法巩固练习')
  const [activeScene, setActiveScene] = useState('作业')
  const [activeType, setActiveType] = useState('全部')
  const [activeDifficulty, setActiveDifficulty] = useState('中等')
  const [keyword, setKeyword] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(defaultSelectedIds)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const questions = useMemo(() => {
    const keywordText = keyword.trim()
    return [...questionBankMock]
      .sort((left, right) => {
        const leftRank = preferredQuestionIds.indexOf(left.id)
        const rightRank = preferredQuestionIds.indexOf(right.id)
        if (leftRank !== -1 || rightRank !== -1) return (leftRank === -1 ? 99 : leftRank) - (rightRank === -1 ? 99 : rightRank)
        return left.number - right.number
      })
      .filter(question => activeScene === '全部' || question.scene === activeScene || (activeScene === '作业' && homeworkSceneIds.has(question.id)) || (activeScene === '课后练习' && question.scene === '作业'))
      .filter(question => activeType === '全部' || question.type === activeType)
      .filter(question => activeDifficulty === '全部' || question.difficulty === toDataDifficulty(activeDifficulty) || (activeDifficulty === '中等' && homeworkSceneIds.has(question.id)))
      .filter(question => !keywordText || question.content.includes(keywordText) || question.knowledgePoints.some(point => point.includes(keywordText)))
      .slice(0, 8)
  }, [activeDifficulty, activeScene, activeType, keyword])

  const selectedIds = useMemo(() => new Set(selectedOrder), [selectedOrder])
  const selectedQuestions = useMemo(
    () => selectedOrder.map(id => questionBankMock.find(question => question.id === id)).filter(Boolean),
    [selectedOrder],
  )

  const toggleQuestion = (questionId) => {
    setSelectedOrder(current => {
      if (current.includes(questionId)) return current.filter(id => id !== questionId)
      return [...current, questionId]
    })
  }

  const removeQuestion = (questionId) => {
    setSelectedOrder(current => current.filter(id => id !== questionId))
  }

  const moveQuestion = (questionId, direction) => {
    const index = selectedOrder.indexOf(questionId)
    const targetIndex = index + direction
    if (index < 0 || targetIndex < 0 || targetIndex >= selectedOrder.length) return
    const nextIds = [...selectedOrder]
    const [item] = nextIds.splice(index, 1)
    nextIds.splice(targetIndex, 0, item)
    setSelectedOrder(nextIds)
  }

  const clearSelected = () => setSelectedOrder([])
  const selectAllVisible = () => setSelectedOrder(current => [...current, ...questions.map(question => question.id).filter(id => !current.includes(id))])

  return (
    <div className="h-full bg-[#f5f8fc] overflow-hidden relative">
      <div className="h-full p-6 pb-14 flex flex-col gap-5">
        <section className="flex items-center">
          <h1 className="text-2xl font-bold text-slate-900">{homeworkName}</h1>
          <button className="ml-2 text-slate-400 hover:text-brand-600"><Edit3 className="w-4 h-4" /></button>
          <StepBar />
        </section>

        <section className="grid grid-cols-[320px_minmax(0,1fr)_310px] gap-4 min-h-0 flex-1">
          <CatalogPanel />
          <main className="min-w-0 min-h-0 flex flex-col gap-3">
            <FilterPanel
              activeScene={activeScene}
              activeType={activeType}
              activeDifficulty={activeDifficulty}
              keyword={keyword}
              onScene={setActiveScene}
              onType={setActiveType}
              onDifficulty={setActiveDifficulty}
              onKeyword={setKeyword}
            />

            <div className="card min-h-0 flex-1 overflow-hidden flex flex-col">
              <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-8 text-sm">
                  <button className="font-semibold text-slate-900">综合</button>
                  <button className="font-semibold text-brand-600">最新</button>
                  <span className="text-slate-500">题量 <b className="text-slate-700">128</b> 道</span>
                </div>
                <button className="text-brand-600 text-sm font-semibold">✦ 智能推荐</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {questions.map((question, index) => (
                  <QuestionRow
                    key={question.id}
                    question={question}
                    number={index + 1}
                    selected={selectedIds.has(question.id)}
                    onToggle={() => toggleQuestion(question.id)}
                  />
                ))}
              </div>
            </div>
          </main>

          <BasketSummary
            selectedQuestions={selectedQuestions}
            onOpen={() => setDrawerOpen(true)}
            onClear={clearSelected}
            onLayout={() => navigate('/homework/layout')}
          />
        </section>
      </div>

      <div className="absolute left-0 right-0 bottom-0 h-10 bg-blue-50 border-t border-blue-100 text-brand-600 flex items-center gap-3 px-7 text-sm">
        <Info className="w-4 h-4" />
        <span>已选 {selectedQuestions.length} 题，可继续添加或进入排版</span>
      </div>

      {drawerOpen && (
        <QuestionDrawer
          selectedQuestions={selectedQuestions}
          onClose={() => setDrawerOpen(false)}
          onRemove={removeQuestion}
          onMove={moveQuestion}
          onClear={clearSelected}
          onSelectAll={selectAllVisible}
          onLayout={() => navigate('/homework/layout')}
        />
      )}
    </div>
  )
}

function StepBar() {
  const steps = ['选题', '排版', '发布/保存']
  return (
    <div className="ml-auto flex items-center gap-8 pr-16">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${index === 0 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {index + 1}
          </div>
          <span className={`text-sm font-medium ${index === 0 ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
          {index < steps.length - 1 && <span className="w-20 border-t border-slate-200" />}
        </div>
      ))}
    </div>
  )
}

function CatalogPanel() {
  return (
    <aside className="card p-5 overflow-y-auto">
      <div className="flex items-center gap-5 text-sm font-semibold text-brand-600 mb-4">
        <span>人教版（2012）</span>
        <span>五年级上册</span>
      </div>
      <div className="space-y-2 text-sm text-slate-700">
        {mathGrade5Catalog.map(chapter => (
          <div key={chapter.id}>
            <div className={`h-8 flex items-center gap-2 ${chapter.number === 3 ? 'text-slate-900 font-semibold' : ''}`}>
              <span className="w-4 text-slate-400">{chapter.number === 3 ? '−' : '›'}</span>
              <span>{chapter.number} {chapter.title}</span>
            </div>
            {chapter.number === 3 && (
              <div className="ml-5 border-l border-slate-200 pl-4 space-y-1">
                <div className="h-8 text-slate-500 flex items-center gap-2">› 除数是整数的小数除法</div>
                <div className="h-8 text-slate-700 flex items-center gap-2">− 一个数除以小数</div>
                <div className="ml-4 space-y-1 text-xs">
                  {['除数是小数的小数除法', '除数是小数的小数除法的应用', '被除数和商的大小关系（小数除法）', '小数的连除运算', '小数乘、除法混合运算', '小数的四则运算及法则', '小数除法相关的简便计算'].map((point, index) => (
                    <div key={point} className={`h-8 px-3 rounded-md flex items-center ${index === 0 ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-slate-500'}`}>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

function FilterPanel({ activeScene, activeType, activeDifficulty, keyword, onScene, onType, onDifficulty, onKeyword }) {
  return (
    <section className="card p-5 space-y-4">
      <div className="grid grid-cols-[1fr_220px] gap-4">
        <div className="space-y-4">
          <FilterRow label="场景：" options={sceneOptions} active={activeScene} onChange={onScene} />
          <FilterRow label="题型：" options={typeOptions} active={activeType} onChange={onType} />
          <FilterRow label="难度：" options={difficultyOptions} active={activeDifficulty} onChange={onDifficulty} />
          <FilterRow label="来源：" options={sourceOptions} active="只看新题" />
        </div>
        <div className="relative self-start">
          <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={keyword}
            onChange={event => onKeyword(event.target.value)}
            className="input w-full h-10 pr-10"
            placeholder="在结果中搜索"
          />
        </div>
      </div>
    </section>
  )
}

function FilterRow({ label, options, active, onChange = () => {} }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-14 text-slate-500">{label}</span>
      {options.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`h-8 px-4 rounded-md ${active === option ? 'bg-brand-600 text-white font-semibold shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}
        >
          {option}
        </button>
      ))}
      {label === '来源：' && <span className="inline-flex items-center gap-1 text-slate-400"><span className="w-4 h-4 rounded border border-slate-300" /> <Info className="w-4 h-4" /></span>}
    </div>
  )
}

function QuestionRow({ question, number, selected, onToggle }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="grid grid-cols-[28px_minmax(0,1fr)_130px] gap-4 items-start">
        <button
          onClick={onToggle}
          className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${selected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300 bg-white'}`}
        >
          {selected && <Check className="w-4 h-4" />}
        </button>
        <div className="min-w-0">
          <p className="text-sm leading-7 text-slate-800">
            <span className="mr-2 font-semibold">{number}.</span>{question.content}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <Tag>小数除法</Tag>
            <Tag>{toDisplayType(question.type)}</Tag>
            <Tag>{toDisplayDifficulty(question.difficulty)}</Tag>
            <span className="inline-flex items-center gap-1 text-slate-500"><Clock3 className="w-4 h-4" /> {question.estimatedMinutes || 5} 分钟</span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`h-11 rounded-lg border text-sm font-semibold ${selected ? 'border-brand-200 text-brand-600 bg-white' : 'border-brand-500 text-brand-600 bg-white hover:bg-brand-50'}`}
        >
          {selected ? '已加入' : '加入试题栏'}
        </button>
      </div>
    </article>
  )
}

function BasketSummary({ selectedQuestions, onOpen, onClear, onLayout }) {
  const computeCount = selectedQuestions.filter(question => question.type === '计算题').length
  const solutionCount = selectedQuestions.length - computeCount
  const estimatedMinutes = selectedQuestions.reduce((sum, question) => sum + (question.estimatedMinutes || 5), 0)

  return (
    <aside className="card p-6 self-start">
      <button data-testid="basket-summary-open" onClick={onOpen} className="w-full text-left">
        <h2 className="text-lg font-semibold text-slate-900">试题栏</h2>
      </button>
      <div className="mt-8 space-y-4 text-sm text-slate-600">
        <div className="flex items-center gap-3"><Clock3 className="w-5 h-5 text-brand-600" /> 已选 {selectedQuestions.length} 题</div>
        <div className="flex items-center gap-3"><Clock3 className="w-5 h-5 text-brand-600" /> 预计 {Math.max(15, estimatedMinutes)} 分钟</div>
      </div>
      <div className="mt-7 text-sm text-slate-500">题型分布</div>
      <div className="mt-3 space-y-3">
        <DistRow label="计算题" value={`${computeCount}/2`} />
        <DistRow label="解答题" value={`${solutionCount}/1`} />
      </div>
      <button onClick={onLayout} className="btn-primary w-full h-12 mt-7 text-base">去排版</button>
      <button onClick={onClear} className="w-full mt-4 text-brand-600 text-sm">清空</button>
    </aside>
  )
}

function QuestionDrawer({ selectedQuestions, onClose, onRemove, onMove, onClear, onSelectAll, onLayout }) {
  const computeQuestions = selectedQuestions.filter(question => question.type === '计算题')
  const solutionQuestions = selectedQuestions.filter(question => question.type !== '计算题')

  return (
    <div className="absolute inset-0 z-20 flex">
      <div className="w-[48%] bg-slate-900/45" />
      <aside className="ml-auto h-full w-[52%] bg-white shadow-2xl flex flex-col">
        <div className="h-20 px-8 flex items-center border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">试题栏</h2>
          <span className="ml-6 text-slate-500">共{selectedQuestions.length}题</span>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>
        <div className="px-8 py-4 flex items-center gap-4 text-sm">
          <TabPill label="计算题" value={`${computeQuestions.length}/2`} />
          <TabPill label="解决问题" value={`${solutionQuestions.length}/1`} />
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-7">
          <QuestionGroup title="一、计算题" questions={computeQuestions} offset={0} onRemove={onRemove} onMove={onMove} />
          <QuestionGroup title="二、解决问题" questions={solutionQuestions} offset={computeQuestions.length} onRemove={onRemove} onMove={onMove} />
        </div>
        <div className="h-20 border-t border-slate-100 px-8 flex items-center gap-8">
          <button onClick={onSelectAll} className="flex items-center gap-2 text-slate-700"><span className="w-5 h-5 rounded bg-brand-600 text-white flex items-center justify-center"><Check className="w-4 h-4" /></span> 全选</button>
          <span className="text-slate-600">已选 {selectedQuestions.length} 题</span>
          <button className="ml-auto text-slate-600 flex items-center gap-2"><Trash2 className="w-4 h-4" /> 删除</button>
          <button onClick={onClear} className="text-slate-600 flex items-center gap-2"><Trash2 className="w-4 h-4" /> 清空</button>
          <button onClick={onLayout} className="btn-primary h-12 px-16 text-base">去排版</button>
        </div>
      </aside>
    </div>
  )
}

function QuestionGroup({ title, questions, offset, onRemove, onMove }) {
  return (
    <section>
      <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="grid grid-cols-[26px_18px_minmax(0,1fr)_130px] gap-3">
              <span className="w-5 h-5 rounded bg-brand-600 text-white flex items-center justify-center"><Check className="w-4 h-4" /></span>
              <GripVertical className="w-4 h-4 text-slate-300 mt-1" />
              <p className="text-sm leading-8 text-slate-800"><span className="font-semibold mr-2">{offset + index + 1}.</span>{question.content}</p>
              <div className="flex items-start gap-4 text-sm text-brand-600">
                <button onClick={() => onRemove(question.id)}>删除</button>
                <span>|</span>
                <button onClick={() => onMove(question.id, -1)}>↑</button>
                <button onClick={() => onMove(question.id, 1)}>↓</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TabPill({ label, value }) {
  return (
    <button className="h-10 px-4 rounded-lg bg-slate-50 text-slate-700 flex items-center gap-5">
      <span>{label}</span>
      <span className="text-brand-600 font-semibold">{value}</span>
      <span className="w-4 h-4 rounded-full bg-slate-300 text-white text-xs flex items-center justify-center">×</span>
    </button>
  )
}

function DistRow({ label, value }) {
  return (
    <div className="h-12 rounded-lg bg-slate-50 px-4 flex items-center">
      <span className="text-slate-600">{label}</span>
      <span className="ml-auto text-brand-600 font-semibold">{value}</span>
    </div>
  )
}

function Tag({ children }) {
  return <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-500">{children}</span>
}

function toDisplayType(type) {
  if (type === '应用题') return '解答题'
  return type
}

function toDisplayDifficulty(difficulty) {
  if (difficulty === '适中') return '中等'
  return difficulty
}

function toDataDifficulty(difficulty) {
  if (difficulty === '中等') return '适中'
  return difficulty
}
