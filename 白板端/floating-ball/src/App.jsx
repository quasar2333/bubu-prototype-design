import { useState } from 'react'
import {
  BarChart3,
  Brush,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Code2,
  Cloud,
  Clock,
  Expand,
  FileText,
  Highlighter,
  Crosshair,
  Maximize2,
  Mic,
  Minimize2,
  MousePointer2,
  PanelRight,
  Play,
  Radio,
  Shuffle,
  Search,
  Send,
  Sparkles,
  StickyNote,
  TabletSmartphone,
  UserRoundCheck,
  XCircle,
  ZoomIn
} from 'lucide-react'
import {
  defaultFloatingActions,
  FloatingStrip,
} from './components/FloatingStrip.jsx'

const stripLayoutStorageKey = 'bubu-whiteboard-floating-strip-layout'

const courseSlides = [
  { page: 1, title: '一元一次不等式复习', type: '封面' },
  { page: 2, title: '概念与解法回顾', type: '讲解' },
  { page: 3, title: '数轴表示规范', type: '批注' },
  { page: 4, title: '典型错题讲评', type: '互动' },
  { page: 5, title: '随堂练推送', type: '练习' }
]

const whiteboardTools = [
  { label: '选择', icon: MousePointer2 },
  { label: '批注', icon: Brush, active: true },
  { label: '荧光笔', icon: Highlighter },
  { label: '激光笔', icon: Crosshair },
  { label: '放大镜', icon: ZoomIn },
  { label: '全屏', icon: Maximize2 },
  { label: '缩略图', icon: PanelRight }
]

const answerDots = Array.from({ length: 45 }, (_, index) => {
  if (index < 26) return { id: index + 1, status: 'correct' }
  if (index < 34) return { id: index + 1, status: 'wrong' }
  if (index < 39) return { id: index + 1, status: 'partial' }
  return { id: index + 1, status: 'pending' }
})

const optionStats = [
  { label: 'A', value: 8, kind: 'normal' },
  { label: 'B', value: 26, kind: 'correct' },
  { label: 'C', value: 7, kind: 'normal' },
  { label: 'D', value: 4, kind: 'wrong' }
]

const drawSequence = ['王若瑜', '陈思远', '赵一诺', '林梓涵']

const voiceActions = [
  'draw_shape',
  'generate_question',
  'next_page',
  'prev_page',
  'clear_board',
  'start_timer',
  'show_answer',
  'push_exercise',
  'random_student',
  'open_toc'
]

export default function App() {
  const [actions, setActions] = useState(() => defaultFloatingActions.map((item) => ({ ...item })))
  const [activeId, setActiveId] = useState('open-cloud')
  const [lastAction, setLastAction] = useState(defaultFloatingActions[0])
  const [currentPage, setCurrentPage] = useState(3)
  const [fullscreen, setFullscreen] = useState(false)
  const [thumbnailOpen, setThumbnailOpen] = useState(true)
  const [practiceRunning, setPracticeRunning] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('待抽取')
  const [drawingStudent, setDrawingStudent] = useState(false)
  const [voiceListening, setVoiceListening] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('等待语音指令')
  const [voiceCommand, setVoiceCommand] = useState({ type: 'idle', payload: {} })
  const [voiceResult, setVoiceResult] = useState('执行结果反馈：等待动作指令')
  const [voiceShape, setVoiceShape] = useState(false)
  const [voiceQuestion, setVoiceQuestion] = useState('')
  const [voiceTimer, setVoiceTimer] = useState('')
  const [voiceAnswerVisible, setVoiceAnswerVisible] = useState(false)
  const [boardCleared, setBoardCleared] = useState(false)

  const currentSlide = courseSlides[currentPage - 1]

  function goPage(step) {
    setCurrentPage((page) => Math.min(courseSlides.length, Math.max(1, page + step)))
  }

  function handleStripAction(item) {
    setLastAction(item)
    if (item.id === 'prev-page') goPage(-1)
    if (item.id === 'next-page') goPage(1)
    if (item.id === 'fullscreen') setFullscreen((value) => !value)
    if (item.id === 'thumbnails') setThumbnailOpen((value) => !value)
  }

  function drawStudent() {
    setDrawingStudent(true)
    setSelectedStudent('抽名动画进行中')
    setLastAction({ label: '抽名动画进行中' })
    drawSequence.forEach((name, index) => {
      window.setTimeout(() => {
        setSelectedStudent(name)
        if (index === drawSequence.length - 1) {
          setDrawingStudent(false)
          setLastAction({ label: `抽中${name}回答` })
        }
      }, 500 * (index + 1))
    })
  }

  function executeVoiceCommand(command) {
    setVoiceCommand(command)
    setBoardCleared(false)
    if (command.type === 'draw_shape') {
      setVoiceShape(true)
      setVoiceResult('执行结果反馈：已在白板中心绘制正方形')
    }
    if (command.type === 'generate_question') {
      setVoiceQuestion('生成题：若 2x + 1 > 7，求 x 的取值范围')
      setVoiceResult('执行结果反馈：已生成一道相关题')
    }
    if (command.type === 'next_page') {
      goPage(1)
      setVoiceResult('执行结果反馈：课件已翻到下一页')
    }
    if (command.type === 'prev_page') {
      goPage(-1)
      setVoiceResult('执行结果反馈：课件已翻到上一页')
    }
    if (command.type === 'clear_board') {
      setVoiceShape(false)
      setVoiceQuestion('')
      setVoiceAnswerVisible(false)
      setBoardCleared(true)
      setVoiceResult('执行结果反馈：白板笔迹已清屏')
    }
    if (command.type === 'start_timer') {
      setVoiceTimer('05:00')
      setVoiceResult('执行结果反馈：倒计时 05:00 已开始')
    }
    if (command.type === 'show_answer') {
      setVoiceAnswerVisible(true)
      setVoiceResult('执行结果反馈：已显示当前题目答案')
    }
    if (command.type === 'push_exercise') {
      setPracticeRunning(true)
      setVoiceResult('执行结果反馈：当前练习已推送到学生平板')
    }
    if (command.type === 'random_student') {
      drawStudent()
      setVoiceResult('执行结果反馈：已触发抽人动画')
    }
    if (command.type === 'open_toc') {
      setThumbnailOpen(true)
      setVoiceResult('执行结果反馈：目录面板已展开')
    }
  }

  function runVoiceAction(type) {
    const command = { type, payload: type === 'next_page' ? { step: 1 } : {} }
    setVoiceTranscript(`模拟语音：${type}`)
    executeVoiceCommand(command)
    setLastAction({ label: `语音执行：${type}` })
  }

  function runVoiceAgent() {
    setVoiceListening(true)
    setVoiceTranscript('正在识别：下一页')
    setVoiceCommand({ type: 'next_page', payload: { step: 1 } })
    setVoiceResult('执行结果反馈：动作解析中')
    window.setTimeout(() => {
      executeVoiceCommand({ type: 'next_page', payload: { step: 1 } })
      setVoiceListening(false)
      setLastAction({ label: '语音执行：下一页' })
    }, 1800)
  }

  return (
    <main className={`whiteboard-player ${fullscreen ? 'is-fullscreen' : ''}`}>
      <aside className="wb-left-toolbar" aria-label="白板端深色工具栏">
        <div className="wb-brand">
          <span className="wb-brand-mark">步</span>
          <div>
            <strong>步步白板</strong>
            <small>云端授课中</small>
          </div>
        </div>
        <div className="wb-tool-stack">
          {whiteboardTools.map((tool) => {
            const Icon = tool.icon
            return (
              <button key={tool.label} className={`wb-tool ${tool.active ? 'is-active' : ''}`} type="button">
                <Icon aria-hidden="true" />
                <span>{tool.label}</span>
              </button>
            )
          })}
        </div>
        <div className="wb-sync-card">
          <Cloud aria-hidden="true" />
          <span>云端课件</span>
          <strong>已同步</strong>
        </div>
      </aside>

      <section className="wb-stage" aria-label="云端课件播放">
        <header className="wb-topbar">
          <div>
            <div className="wb-breadcrumb">云端课件播放 / 初二数学 / 8.2 一元一次不等式</div>
            <h1>W1 云端课件播放</h1>
          </div>
          <div className="wb-top-actions">
            <button type="button"><Cloud aria-hidden="true" /> 从云端打开课件</button>
            <button type="button"><StickyNote aria-hidden="true" /> 保存批注</button>
            <button type="button" data-testid="wb-fullscreen" onClick={() => setFullscreen((value) => !value)}>
              {fullscreen ? <Minimize2 aria-hidden="true" /> : <Expand aria-hidden="true" />}
              {fullscreen ? '退出全屏' : '全屏授课'}
            </button>
          </div>
        </header>

        <section className={`wb-voice-agent ${voiceListening ? 'is-listening' : ''}`} aria-label="语音白板 Agent">
          <button className="wb-mic-button" data-testid="wb-voice-agent" type="button" onClick={runVoiceAgent}>
            <Mic aria-hidden="true" />
          </button>
          <div className="wb-voice-body">
            <span><Radio aria-hidden="true" /> W9 语音白板 Agent</span>
            <strong>{voiceListening ? '录音状态动画中' : '麦克风按钮'}</strong>
            <p>{voiceTranscript}</p>
            <code><Code2 aria-hidden="true" /> 指令 JSON：{JSON.stringify(voiceCommand)}</code>
            <em>{voiceResult}</em>
            <small>语音识别 + NLP 映射由后端；前端只做 UI + 固定动作执行</small>
          </div>
          <div className="wb-voice-actions" aria-label="固定动作表">
            {voiceActions.map((action) => (
              <button key={action} type="button" data-testid={`voice-action-${action}`} onClick={() => runVoiceAction(action)}>
                {action}
              </button>
            ))}
          </div>
        </section>

        <div className="wb-content">
          <div className="wb-slide-shell">
            <div className="wb-slide-card">
              <div className="wb-slide-meta">
                <span>{currentSlide.type}</span>
                <span>{currentPage} / {courseSlides.length}</span>
              </div>
              <div className="wb-slide-paper">
                <span className="wb-slide-kicker">课堂讲解</span>
                <h2>{currentSlide.title}</h2>
                <p>请观察不等式两边同时乘除负数时，不等号方向为什么需要改变。</p>
                <div className="wb-formula">3x - 5 &lt; 7 → x &lt; 4</div>
                <div className="wb-axis">
                  <span className="wb-axis-line" />
                  <span className="wb-axis-dot" />
                  <span className="wb-axis-arrow" />
                  <small>数轴表示区</small>
                </div>
                {!boardCleared && <div className="wb-annotation wb-annotation-a">批注：注意变号规则</div>}
                {!boardCleared && <div className="wb-annotation wb-annotation-b">激光笔定位</div>}
                {voiceShape && <div className="wb-voice-shape">□</div>}
                {voiceQuestion && <div className="wb-voice-question">{voiceQuestion}</div>}
                {voiceTimer && <div className="wb-voice-timer">{voiceTimer}</div>}
                {voiceAnswerVisible && <div className="wb-voice-answer">答案：x &lt; 4</div>}
                {boardCleared && <div className="wb-board-cleared">清屏完成</div>}
              </div>
            </div>

            <div className="wb-page-control">
              <button type="button" data-testid="wb-prev-page" onClick={() => goPage(-1)}><ChevronLeft aria-hidden="true" /> 上一页</button>
              <span>{currentPage} / {courseSlides.length}</span>
              <button type="button" data-testid="wb-next-page" onClick={() => goPage(1)}>下一页 <ChevronRight aria-hidden="true" /></button>
            </div>
          </div>

          {thumbnailOpen && (
            <aside className="wb-thumbnail-panel" aria-label="课件缩略图工具">
              <div className="wb-panel-title">
                <span>缩略图工具</span>
                <button type="button" data-testid="wb-hide-thumbnails" onClick={() => setThumbnailOpen(false)}>收起</button>
              </div>
              <div className="wb-thumbnail-list">
                {courseSlides.map((slide) => (
                  <button
                    key={slide.page}
                    className={`wb-thumb ${slide.page === currentPage ? 'is-current' : ''}`}
                    type="button"
                    onClick={() => setCurrentPage(slide.page)}
                  >
                    <span>{slide.page}</span>
                    <strong>{slide.title}</strong>
                    <small>{slide.type}</small>
                  </button>
                ))}
              </div>
            </aside>
          )}
        </div>

        <div className="wb-interaction-bar" aria-label="课件页互动按钮">
          <div>
            <strong>W2 课件页互动按钮</strong>
            <span>悬浮在课件页下方，先做推送与开始练习，不展开复杂子菜单</span>
          </div>
          <button
            className="wb-push-btn"
            data-testid="wb-push"
            type="button"
            onClick={() => setLastAction({ label: '已推送到学生平板' })}
          >
            <Send aria-hidden="true" /> 推送
          </button>
          <button
            className="wb-practice-btn"
            data-testid="wb-start-practice"
            type="button"
            onClick={() => {
              setPracticeRunning(true)
              setLastAction({ label: '随堂练进行中' })
            }}
          >
            <Play aria-hidden="true" /> 开始练习
          </button>
        </div>

        <section className={`wb-practice-dock ${practiceRunning ? 'is-running' : ''}`} aria-label="随堂练推送与即时快速批阅">
          <div className="wb-practice-summary">
            <span className="wb-stage-tag">W3 随堂练推送</span>
            <h2>一元一次不等式随堂练</h2>
            <p><TabletSmartphone aria-hidden="true" /> 已推送到学生平板</p>
            <div className="wb-practice-metrics">
              <strong><Clock aria-hidden="true" /> 计时 04:36</strong>
              <strong>提交进度 34/45</strong>
            </div>
          </div>

          <div className="wb-answer-matrix">
            <div className="wb-matrix-head">
              <span>学生答案彩色圆点阵列</span>
              <em>对 / 错 / 半对 / 未交</em>
            </div>
            <div className="wb-answer-grid" role="list" aria-label="45名学生答案状态">
              {answerDots.map((answer) => (
                <button
                  key={answer.id}
                  className={`wb-answer-dot is-${answer.status}`}
                  type="button"
                  aria-label={`${answer.id}号学生 ${answer.status}`}
                >
                  {answer.id}
                </button>
              ))}
            </div>
          </div>

          <div className="wb-quick-review">
            <span className="wb-stage-tag">W4 即时快速批阅</span>
            <h3>快速批改面板</h3>
            <div className="wb-review-buttons">
              <button type="button"><CheckCircle2 aria-hidden="true" /> 判对</button>
              <button type="button"><XCircle aria-hidden="true" /> 判错</button>
              <button type="button"><Circle aria-hidden="true" /> 未交</button>
            </div>
            <p>OCR/时间戳/步骤批改暂不启用</p>
          </div>
        </section>

        <FloatingStrip
          items={actions}
          onItemsChange={setActions}
          activeId={activeId}
          onActiveChange={setActiveId}
          onAction={handleStripAction}
          initialLayout={{ x: 96, y: 210, scale: 0.78 }}
          storageKey={stripLayoutStorageKey}
        />
      </section>

      <aside className="wb-right-inspector" aria-label="播放状态">
        <div className="wb-status-card">
          <span>当前触发</span>
          <strong>{lastAction?.label}</strong>
          <small>条形悬浮组件已接入白板播放页</small>
        </div>
        <div className="wb-status-card wb-learning-card">
          <span><BarChart3 aria-hidden="true" /> W5 即时学情反馈</span>
          <strong>正确率 71%</strong>
          <small>提交人数 34/45，选项分布柱状图，典型错误：移项后符号未变</small>
          <div className="wb-option-bars" aria-label="选项分布柱状图">
            {optionStats.map((option) => (
              <div key={option.label} className={`wb-option-bar is-${option.kind}`}>
                <em>{option.label}</em>
                <i style={{ height: `${Math.max(22, option.value * 3)}px` }} />
                <b>{option.value}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="wb-status-card wb-case-card">
          <span><UserRoundCheck aria-hidden="true" /> W6 学生案例展示</span>
          <strong>放大某学生手写作答</strong>
          <div className="wb-student-paper" aria-label="学生手写作答案例">
            <p>3x - 5 &lt; 7</p>
            <p>3x &lt; 12</p>
            <p>x &lt; 4</p>
            <mark>批注：步骤完整，可讲评</mark>
          </div>
          <div className="wb-case-actions">
            <button type="button">批注</button>
            <button type="button">对比</button>
            <button type="button">讲评</button>
          </div>
        </div>
        <div className={`wb-status-card wb-random-card ${drawingStudent ? 'is-drawing' : ''}`}>
          <span><Shuffle aria-hidden="true" /> W7 抽人回答</span>
          <strong>{selectedStudent}</strong>
          <small>{drawingStudent ? '抽名动画进行中' : '随机抽名动画 + 选中学生信息展示'}</small>
          <button type="button" data-testid="wb-random-student" onClick={drawStudent}>开始抽人</button>
          <p>初二(3)班 · 第 4 组 · 最近提交：已完成</p>
        </div>
        <div className="wb-status-card">
          <span>课中边界</span>
          <strong>深度错因分析暂缓</strong>
          <small>不展开学生端作答页细节；只做大屏学情、案例讲评和抽人</small>
        </div>
      </aside>
    </main>
  )
}
