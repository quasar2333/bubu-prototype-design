import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Minus, Square, X, Undo2, Redo2, Play, Send, Plus,
  Type, Image as ImageIcon, Shapes, Sigma, BarChart3, Table, Sparkles, Music,
  Video, GitBranch, MoreHorizontal, CheckCircle2, Cloud, Maximize2, FileText,
  GripVertical, Clock3, Layers3, Users, FlaskConical, CircleDot,
  Shuffle, Trash2, Copy, MousePointer2, Ruler,
  DraftingCompass, Calculator, Move, PanelRight, Save
} from 'lucide-react'

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
const cx = (...classes) => classes.filter(Boolean).join(' ')

const INTERACTIONS = {
  listen: {
    label: '听写',
    icon: Music,
    tone: 'blue',
    desc: '乱序下发，OCR 自动判错，错词入复习',
    trigger: '翻到此页自动触发',
    collect: '实时统计',
    track: '错词分布 / 耗时 / 修改次数',
    layerBody: '词语、短句或概念解释下发到学生平板，提交后自动回收。'
  },
  quiz: {
    label: '随堂练',
    icon: FileText,
    tone: 'emerald',
    desc: '选择 / 填空 / 手写混合，支持分层推送',
    trigger: '翻页触发或教师手动',
    collect: '客观题秒批，主观题保留步骤',
    track: '正确率 / 错误选项 / 步骤卡点',
    layerBody: '本页题目下发到学生端，白板同步显示作答进度和统计结果。'
  },
  pick: {
    label: '抽人回答',
    icon: Shuffle,
    tone: 'amber',
    desc: '随机单人 / 多人，名单高亮，平板进入回答态',
    trigger: '教师手动点击',
    collect: '抽中记录与回答结果回收',
    track: '抽中分布 / 应答正确率',
    layerBody: '抽中后学生平板进入回答态，其他学生端保持旁听。'
  },
  discuss: {
    label: '分组讨论',
    icon: Users,
    tone: 'violet',
    desc: '共享画板，小组结论，白板分屏展示',
    trigger: '翻页触发或教师手动',
    collect: '小组成果自动归档',
    track: '组内贡献 / 讨论热度',
    layerBody: '各组在共享画板提交结论，白板端可分屏展示。'
  },
  lab: {
    label: '实验',
    icon: FlaskConical,
    tone: 'sky',
    desc: '虚拟仪器或真实数据录入，全班数据成图',
    trigger: '教师启动',
    collect: '实验数据自动汇总',
    track: '数据质量 / 结论表达',
    layerBody: '学生端按步骤记录实验数据，提交后自动生成全班汇总图。'
  },
  circle: {
    label: '圈选提问',
    icon: CircleDot,
    tone: 'rose',
    desc: '圈选课件区域，AI 即时讲解或生成追问',
    trigger: '教师圈选课件内容',
    collect: '圈选内容沉淀为讲评素材',
    track: '追问质量 / 应答情况',
    layerBody: '教师圈选本页任意区域，AI 生成追问并可推送给全班。'
  }
}

const CONFIG_FIELDS = {
  listen: {
    basic: [
      { key: 'trigger', label: '触发时机', kind: 'single', options: ['翻到此页自动触发', '教师手动点击'], default: '翻到此页自动触发' },
      { key: 'content', label: '听写内容', kind: 'text', default: '不等式、解集、移项、系数化为 1' },
      { key: 'mode', label: '听写模式', kind: 'single', options: ['概念解释', '原文听写', '口算播报'], default: '概念解释' }
    ],
    advanced: [
      { key: 'antiCheat', label: '防作弊', kind: 'multi', options: ['每台平板乱序', '全屏锁定', '禁止截图'], default: ['每台平板乱序', '全屏锁定'] },
      { key: 'collect', label: '回收方式', kind: 'multi', options: ['实时统计', '错词入复习', '推送订正'], default: ['实时统计', '错词入复习'] }
    ]
  },
  quiz: {
    basic: [
      { key: 'source', label: '题目来源', kind: 'single', options: ['当前课件题目', '智能题库', 'AI 变式', '手动录入'], default: '当前课件题目' },
      { key: 'questionTypes', label: '题型组合', kind: 'multi', options: ['选择题', '填空题', '手写题', '判断题'], default: ['选择题', '填空题'] },
      { key: 'count', label: '题目数量', kind: 'text', default: '3 题 · 预计 5 分钟' }
    ],
    advanced: [
      { key: 'delivery', label: '分层下发', kind: 'single', options: ['全班同题', '按学情分 3 档', '只发需关注学生'], default: '全班同题' },
      { key: 'afterSubmit', label: '提交后', kind: 'multi', options: ['公布统计', '允许看解析', '收集学情'], default: ['公布统计', '收集学情'] }
    ]
  },
  pick: {
    basic: [
      { key: 'range', label: '抽取范围', kind: 'single', options: ['全班', '未发言学生', '需关注学生', '自定义名单'], default: '全班' },
      { key: 'count', label: '抽取人数', kind: 'text', default: '1 人，可追加 1 名同伴补充' }
    ],
    advanced: [
      { key: 'push', label: '题目推送', kind: 'multi', options: ['白板显示题目', '抽中学生平板进入回答态', '全班可见'], default: ['白板显示题目', '抽中学生平板进入回答态'] },
      { key: 'protect', label: '保护机制', kind: 'multi', options: ['允许求助同桌', '跳过一次', '老师确认后公布'], default: ['允许求助同桌'] }
    ]
  },
  discuss: {
    basic: [
      { key: 'grouping', label: '分组方式', kind: 'single', options: ['沿用课堂小组', '按学情混合', '随机分组'], default: '沿用课堂小组' },
      { key: 'topic', label: '讨论主题', kind: 'text', default: '不等式两边同乘负数时，符号为什么要改变？' }
    ],
    advanced: [
      { key: 'output', label: '成果形式', kind: 'multi', options: ['小组画板', '一句话结论', '拍照上传'], default: ['小组画板', '一句话结论'] },
      { key: 'display', label: '白板展示', kind: 'single', options: ['四组分屏', '只展示已提交', '老师推荐 1 组分享'], default: '四组分屏' }
    ]
  },
  lab: {
    basic: [
      { key: 'type', label: '实验类型', kind: 'single', options: ['虚拟仪器', '真实数据录入', '拍照记录'], default: '虚拟仪器' },
      { key: 'fields', label: '数据字段', kind: 'text', default: '次数、测量值、观察现象、结论' }
    ],
    advanced: [
      { key: 'safety', label: '安全设置', kind: 'multi', options: ['只允许教师启动', '学生端步骤锁定', '异常数据提醒'], default: ['只允许教师启动', '学生端步骤锁定'] },
      { key: 'summary', label: '汇总方式', kind: 'single', options: ['全班数据自动成图', '导出表格', '生成实验结论页'], default: '全班数据自动成图' }
    ]
  },
  circle: {
    basic: [
      { key: 'target', label: '圈选对象', kind: 'single', options: ['课件任意区域', '题干', '图片', '学生答案'], default: '课件任意区域' },
      { key: 'aiAction', label: 'AI 动作', kind: 'multi', options: ['生成追问', '即时讲解', '生成同类题'], default: ['生成追问', '即时讲解'] }
    ],
    advanced: [
      { key: 'audience', label: '下发范围', kind: 'single', options: ['白板展示', '推给全班', '只推给错答学生'], default: '白板展示' },
      { key: 'saveTo', label: '保存去向', kind: 'multi', options: ['加入课件页', '沉淀为讲评素材', '入校本资源'], default: ['加入课件页', '沉淀为讲评素材'] }
    ]
  }
}

const makeInitialConfig = () => Object.fromEntries(
  Object.entries(CONFIG_FIELDS).map(([type, sections]) => {
    const fields = [...sections.basic, ...sections.advanced]
    return [type, Object.fromEntries(fields.map((field) => [field.key, field.default]))]
  })
)

const tagTone = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  slate: 'bg-slate-100 text-slate-700 border-slate-200'
}

const interactionTone = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  sky: 'bg-sky-50 text-sky-700 border-sky-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100'
}

const layerDefaults = {
  text: { x: 54, y: 96, w: 240 },
  shape: { x: 322, y: 116, w: 160, h: 94 },
  media: { x: 512, y: 92, w: 190, h: 118 },
  formula: { x: 78, y: 302, w: 260 },
  question: { x: 56, y: 286, w: 640 },
  interaction: { x: 56, y: 292, w: 640 },
  mind: { x: 262, y: 82, w: 260 }
}

const initialSlides = [
  {
    id: 'slide-intro',
    name: '情境导入',
    time: 3,
    tag: '导入',
    tagTone: 'blue',
    title: '8.2 一元一次不等式',
    subtitle: '从优惠券是否够用，进入“不等关系”的表达。',
    bullets: ['比较 2x + 3 与 7 的大小关系', '把生活问题转成不等式语言'],
    formula: '2x + 3 > 7',
    cards: [
      ['问题', '一张优惠券最多抵 7 元'],
      ['表达', '未知数 x 参与比较'],
      ['目标', '找出满足条件的 x']
    ],
    caption: '本页用于建立真实情境，后续页面可直接绑定随堂练或抽人回答。'
  },
  {
    id: 'slide-review',
    name: '等式性质回顾',
    time: 4,
    tag: '复习',
    tagTone: 'slate',
    title: '等式两边同时变化',
    subtitle: '先回顾等式性质，再迁移到不等式。',
    bullets: ['等式两边同时加减同一个数，等式仍成立', '等式两边同时乘除同一个正数，等式仍成立'],
    formula: 'a = b  =>  a + c = b + c',
    caption: '复习环节建议保留白板书写空间，教师可现场补充例子。'
  },
  {
    id: 'slide-property',
    name: '不等式性质',
    time: 6,
    tag: '核心概念',
    tagTone: 'rose',
    title: '不等式的三个基本性质',
    subtitle: '重点处理“同乘负数，方向改变”。',
    bullets: ['两边同时加减同一个数，不等号方向不变', '两边同时乘除同一个正数，不等号方向不变', '两边同时乘除同一个负数，不等号方向改变'],
    formula: '若 a > b，则 -2a < -2b',
    cards: [
      ['加减', '方向不变'],
      ['乘正数', '方向不变'],
      ['乘负数', '方向改变']
    ],
    caption: '本页是高风险概念页，适合插入圈选提问或随堂练。'
  },
  {
    id: 'slide-example',
    name: '例题精讲',
    time: 7,
    tag: '例题',
    tagTone: 'emerald',
    title: '解不等式：2x + 3 > 7',
    subtitle: '请写出解集，并说明每一步依据。',
    bullets: ['移项：2x > 4', '系数化为 1：x > 2', '在数轴上表示解集'],
    formula: 'x > 2',
    numberLine: true,
    caption: '例题页可以拖入“随堂练”到当前页，形成题目与作答入口同页。'
  },
  {
    id: 'slide-quiz',
    name: '随堂练',
    time: 5,
    tag: '随堂互动',
    tagTone: 'emerald',
    title: '判断解集是否正确',
    subtitle: '解不等式：-3x < 6',
    bullets: ['学生独立完成', '提交后显示正确率和错误步骤', '重点观察是否忘记改变方向'],
    formula: 'x > -2',
    bind: { type: 'quiz', label: '随堂练' },
    layers: [
      {
        id: 'layer-quiz-existing',
        kind: 'interaction',
        type: 'quiz',
        title: '第 5 页互动：随堂练已绑定',
        body: '题目下发到学生端，提交后白板显示进度、选项分布和正确率。',
        x: 56,
        y: 292,
        w: 640
      }
    ],
    caption: '本页绑定随堂练。授课端翻到本页时，学生端自动收到同一互动。'
  },
  {
    id: 'slide-axis',
    name: '数轴表示',
    time: 5,
    tag: '板书',
    tagTone: 'blue',
    title: '在数轴上表示解集',
    subtitle: '开闭圆点与方向箭头要和不等号一致。',
    bullets: ['x > 2：空心圆点，向右', 'x ≥ 2：实心圆点，向右'],
    numberLine: true,
    caption: '板书页不默认绑定互动，便于教师现场圈画。'
  },
  {
    id: 'slide-pick',
    name: '抽人验收',
    time: 3,
    tag: '课堂调度',
    tagTone: 'amber',
    title: '说出这一步的依据',
    subtitle: '从 -3x < 6 到 x > -2，为什么不等号方向改变？',
    bullets: ['随机抽取 1 名学生回答', '可追加 1 名同伴补充', '教师确认后记录回答结果'],
    bind: { type: 'pick', label: '抽人回答' },
    layers: [
      {
        id: 'layer-pick-existing',
        kind: 'interaction',
        type: 'pick',
        title: '第 7 页互动：抽人回答已绑定',
        body: '抽中后，学生平板进入回答态，白板显示学生姓名和倒计时。',
        x: 56,
        y: 292,
        w: 640
      }
    ],
    caption: '抽人回答用于课堂验收，抽取范围和保护机制可在右侧配置。'
  },
  {
    id: 'slide-summary',
    name: '课堂小结',
    time: 4,
    tag: '收束',
    tagTone: 'violet',
    title: '一元一次不等式解题流程',
    subtitle: '读题、变形、方向、数轴、检验。',
    bullets: ['先判断每一步是否保持同解', '遇到负数乘除先提醒方向', '用数轴检查答案区间'],
    formula: '变形时始终关注不等号方向',
    caption: '小结页可从校本资源插入错因卡或讲评提纲。'
  }
]

const canvasTools = [
  { key: 'select', icon: MousePointer2, label: '选择' },
  { key: 'text', icon: Type, label: '文本' },
  { key: 'image', icon: ImageIcon, label: '图片' },
  { key: 'shape', icon: Shapes, label: '形状' },
  { key: 'formula', icon: Sigma, label: '公式' },
  { key: 'chart', icon: BarChart3, label: '图表' },
  { key: 'table', icon: Table, label: '表格' },
  { key: 'interaction', icon: Sparkles, label: '互动' },
  { key: 'audio', icon: Music, label: '音频' },
  { key: 'video', icon: Video, label: '视频' },
  { key: 'mind', icon: GitBranch, label: '思维导图' },
  { key: 'more', icon: MoreHorizontal, label: '更多' }
]

const subjectTools = [
  { name: '几何画板', icon: DraftingCompass, subject: '数学', ops: ['绘制点线面', '动态测量边长与角度', '下发学生同步操作'] },
  { name: '直尺 / 量角器', icon: Ruler, subject: '数学', ops: ['白板测量', '角度标注', '过程留痕'] },
  { name: '数轴工具', icon: GitBranch, subject: '数学', ops: ['拖动端点', '开闭圆点', '区间高亮'] },
  { name: '函数画板', icon: BarChart3, subject: '数学', ops: ['输入解析式', '自动绘图', '观察交点'] },
  { name: '口算器', icon: Calculator, subject: '数学', ops: ['随机出题', '限时作答', '即时统计'] },
  { name: '随机骰子', icon: Shuffle, subject: '数学', ops: ['概率演示', '随机抽样', '课堂热身'] }
]

const questionCards = [
  { text: '解不等式 4x - 5 ≤ 11，并在数轴上表示解集。', diff: '基础', kp: '一元一次不等式', source: '校本题库', accuracy: '86%' },
  { text: '若 -2x > 8，则 x 的取值范围是什么？说明不等号方向变化原因。', diff: '中档', kp: '不等式性质', source: '智能题库', accuracy: '61%' },
  { text: '某商品原价 x 元，满减后不超过 50 元，请列出不等式。', diff: '中档', kp: '实际应用', source: 'AI 变式', accuracy: '72%' },
  { text: '比较 x > 2 与 x ≥ 2 在数轴表示上的差异。', diff: '提高', kp: '数轴表示', source: '校本题库', accuracy: '68%' }
]

const resourceRows = [
  { title: '错因卡：同乘负数忘记变号', author: '王老师', uses: 18, related: '不等式性质', preview: '把“除以 -3”步骤拆成方向提醒与检验两步。' },
  { title: '讲评提纲：一元一次不等式', author: '教研组', uses: 42, related: '第 8 章', preview: '按概念、性质、例题、易错点组织 12 分钟讲评。' },
  { title: '题包：数轴表示专项 6 题', author: '校本资源库', uses: 36, related: '数轴表示', preview: '覆盖开闭圆点、方向箭头和区间描述。' },
  { title: '技能包：追问不等号方向', author: 'AI 学伴', uses: 21, related: '课堂提问', preview: '三层追问：现象、依据、反例验证。' }
]

export default function CoursewareEditor() {
  const [slides, setSlides] = useState(initialSlides)
  const [activeSlideId, setActiveSlideId] = useState(initialSlides[0].id)
  const [activeTool, setActiveTool] = useState('select')
  const [rightTab, setRightTab] = useState('interact')
  const [configTab, setConfigTab] = useState('basic')
  const [selectedLayerId, setSelectedLayerId] = useState(null)
  const [interactionConfigs, setInteractionConfigs] = useState(makeInitialConfig)
  const [configDialog, setConfigDialog] = useState(null)
  const [thumbnailDropId, setThumbnailDropId] = useState(null)
  const [saveState, setSaveState] = useState('已保存')
  const [toast, setToast] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const canvasRef = useRef(null)
  const interactionDragRef = useRef(null)
  const saveTimer = useRef(null)
  const toastTimer = useRef(null)

  const activeIndex = slides.findIndex((slide) => slide.id === activeSlideId)
  const activeSlide = slides[activeIndex] || slides[0]
  const selectedLayer = activeSlide?.layers?.find((layer) => layer.id === selectedLayerId)
  const configSlide = configDialog ? slides.find((slide) => slide.id === configDialog.slideId) : null
  const configLayer = configSlide?.layers?.find((layer) => layer.id === configDialog.layerId)

  const stats = useMemo(() => {
    const minutes = slides.reduce((sum, slide) => sum + Number(slide.time || 0), 0)
    const binds = slides.reduce((sum, slide) => sum + slideBindLabels(slide).length, 0)
    return { minutes, binds }
  }, [slides])

  useEffect(() => {
    return () => {
      clearTimeout(saveTimer.current)
      clearTimeout(toastTimer.current)
    }
  }, [])

  const markChanged = () => {
    setSaveState('保存中')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setSaveState('已保存'), 650)
  }

  const showToast = (message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  const commitSlides = (updater) => {
    setSlides((prev) => updater(prev))
    markChanged()
  }

  const replaceActiveSlide = (patcher) => {
    commitSlides((prev) => prev.map((slide) => (
      slide.id === activeSlideId ? patcher(slide) : slide
    )))
  }

  const selectSlide = (id) => {
    setActiveSlideId(id)
    setSelectedLayerId(null)
  }

  const insertSlideAfterCurrent = (config, toastText, afterSlideId = activeSlideId) => {
    const slide = {
      id: uid('slide'),
      time: 4,
      tag: '新页面',
      tagTone: 'blue',
      bullets: [],
      cards: [],
      layers: [],
      caption: '新页面已加入当前课件，可继续编辑内容和互动。',
      ...config
    }
    setSlides((prev) => {
      const targetIndex = prev.findIndex((item) => item.id === afterSlideId)
      const index = targetIndex >= 0 ? targetIndex : Math.max(activeIndex, 0)
      return [...prev.slice(0, index + 1), slide, ...prev.slice(index + 1)]
    })
    setActiveSlideId(slide.id)
    setSelectedLayerId(null)
    const type = slide.bind?.type || slide.binds?.[0]?.type || slide.layers?.find((layer) => layer.kind === 'interaction')?.type
    if (type) {
      setConfigTab('basic')
    }
    markChanged()
    showToast(toastText || `"${slide.name}" 已加入课件`)
    return slide
  }

  const addBlankSlide = () => {
    insertSlideAfterCurrent({
      name: '新建环节',
      title: '新建教学环节',
      subtitle: '补充讲解、练习或课堂活动。',
      bullets: ['在这里写入本环节目标', '可从右侧加入互动、题目或校本资源'],
      formula: '新内容',
      caption: '新增环节会同步出现在左侧流程和底部缩略图。'
    }, '已新增教学环节')
  }

  const makeInteractionLayer = (type, point = {}) => {
    const detail = INTERACTIONS[type] || INTERACTIONS.quiz
    const d = layerDefaults.interaction
    return {
      id: uid(`layer-${type}`),
      kind: 'interaction',
      type,
      title: `${detail.label} 已加入当前页`,
      body: detail.layerBody,
      x: Math.max(8, Math.min(point.x ?? d.x, 660)),
      y: Math.max(8, Math.min(point.y ?? d.y, 350)),
      w: d.w
    }
  }

  const makeInteractionSlide = (type, source = '互动卡片') => {
    const detail = INTERACTIONS[type] || INTERACTIONS.quiz
    return {
      name: detail.label,
      time: type === 'pick' ? 3 : 5,
      tag: '课堂互动',
      tagTone: detail.tone === 'rose' ? 'rose' : detail.tone === 'amber' ? 'amber' : 'emerald',
      title: detail.label,
      subtitle: `${source} · ${detail.desc}`,
      bullets: [`触发：${detail.trigger}`, `回收：${detail.collect}`, `学情：${detail.track}`],
      cards: [
        ['触发', detail.trigger],
        ['回收', detail.collect],
        ['学情', detail.track]
      ],
      bind: { type, label: detail.label },
      layers: [makeInteractionLayer(type)],
      caption: `${detail.label} 已作为可编辑互动页加入课件，可在右侧继续配置规则。`
    }
  }

  const addInteractionAsPage = (type, afterSlideId = activeSlideId) => {
    insertSlideAfterCurrent(makeInteractionSlide(type), `${INTERACTIONS[type]?.label || '互动'} 已新建为互动页`, afterSlideId)
  }

  const addInteractionToCurrentPage = (type, point) => {
    const detail = INTERACTIONS[type] || INTERACTIONS.quiz
    const layer = makeInteractionLayer(type, point)
    replaceActiveSlide((slide) => {
      const binds = slide.binds || []
      const hasSameBind = slide.bind?.type === type || binds.some((bind) => bind.type === type)
      return {
        ...slide,
        layers: [...(slide.layers || []), layer],
        binds: hasSameBind ? binds : [...binds, { type, label: detail.label }]
      }
    })
    setSelectedLayerId(layer.id)
    setConfigTab('basic')
    showToast(`${detail.label} 已插入当前页`)
  }

  const addToolLayer = (kind) => {
    const d = layerDefaults[kind] || layerDefaults.text
    const layerMap = {
      text: { kind: 'text', title: '重点提示', body: '输入课堂讲解要点。' },
      image: { kind: 'media', title: '图片占位', body: '插入题图或教材截图。' },
      shape: { kind: 'shape', title: '重点框', body: '' },
      formula: { kind: 'formula', title: '公式', body: '2x + 3 > 7' },
      chart: { kind: 'media', title: '图表占位', body: '作答统计或函数图像。' },
      table: { kind: 'media', title: '表格占位', body: '步骤、结论或分层名单。' },
      audio: { kind: 'media', title: '音频占位', body: '听力、口令或朗读材料。' },
      video: { kind: 'media', title: '视频占位', body: '情境导入或实验视频。' },
      mind: { kind: 'mind', title: '知识结构', body: '不等式|性质|解集|数轴' }
    }
    const base = layerMap[kind]
    if (!base) return
    const layer = { id: uid(`layer-${kind}`), ...base, x: d.x, y: d.y, w: d.w, h: d.h }
    replaceActiveSlide((slide) => ({ ...slide, layers: [...(slide.layers || []), layer] }))
    setSelectedLayerId(layer.id)
    showToast(`${base.title} 已插入当前页`)
  }

  const handleToolClick = (tool) => {
    setActiveTool(tool.key)
    if (tool.key === 'select') return
    if (tool.key === 'interaction') {
      setRightTab('interact')
      showToast('选择或拖拽右侧互动卡片')
      return
    }
    if (tool.key === 'more') {
      showToast('更多工具已收起到右侧资源区')
      return
    }
    addToolLayer(tool.key)
  }

  const addQuestionPage = (info) => {
    insertSlideAfterCurrent({
      name: `题目：${info.text.slice(0, 10)}`,
      time: 5,
      tag: `随堂练 · ${info.diff}`,
      tagTone: info.diff === '提高' ? 'rose' : 'amber',
      title: info.text,
      subtitle: `${info.kp} · 来源：${info.source} · 正确率 ${info.accuracy}`,
      bullets: ['题目已转为互动页', '学生作答后回收步骤与正确率', '可在右侧调整题型和分层规则'],
      cards: [
        ['知识点', info.kp],
        ['来源', info.source],
        ['正确率', info.accuracy]
      ],
      bind: { type: 'quiz', label: '随堂练' },
      layers: [makeInteractionLayer('quiz')],
      caption: '题库题目已加入课件，并自动绑定随堂练。'
    }, '题目已新建为随堂练页面')
  }

  const addResourcePage = (info) => {
    insertSlideAfterCurrent({
      name: info.title.slice(0, 14),
      time: 4,
      tag: '校本资源',
      tagTone: 'violet',
      title: info.title,
      subtitle: `${info.author} · 使用 ${info.uses} 次 · 关联 ${info.related}`,
      bullets: ['资源已插入为课件页', '可继续编辑成讲评页、题目页或互动页', info.preview],
      cards: [
        ['来源', info.author],
        ['使用', `${info.uses} 次`],
        ['关联', info.related]
      ],
      formula: info.preview,
      caption: '校本资源已加入当前课件，后续可复用到讲评或作业。'
    }, '校本资源已新建为课件页')
  }

  const addSubjectToolPage = (tool) => {
    insertSlideAfterCurrent({
      name: tool.name,
      time: 4,
      tag: `学科工具 · ${tool.subject}`,
      tagTone: 'blue',
      title: tool.name,
      subtitle: '可投白板，也可下发到学生平板。',
      bullets: tool.ops,
      cards: tool.ops.slice(0, 3).map((op, index) => [`0${index + 1}`, op]),
      caption: `${tool.name} 已作为工具页加入课件。`
    }, `${tool.name} 已新建为工具页`)
  }

  const applyAISuggestion = () => {
    insertSlideAfterCurrent({
      name: '变号专项练习',
      time: 5,
      tag: 'AI 变式题',
      tagTone: 'amber',
      title: '若 -2x > 8，则 x 的取值范围是什么？',
      subtitle: '针对“同乘负数忘记变号”的薄弱点。',
      bullets: ['先判断两边同时除以 -2', '再说明不等号方向改变', '最后用代入法检验'],
      formula: 'x < -4',
      bind: { type: 'quiz', label: '随堂练' },
      layers: [makeInteractionLayer('quiz')],
      caption: 'AI 变式题已插入课件，默认绑定随堂练并回收错因。'
    }, 'AI 变式题已加入课件')
  }

  const updateLayer = (layerId, patch) => {
    replaceActiveSlide((slide) => ({
      ...slide,
      layers: (slide.layers || []).map((layer) => (
        layer.id === layerId ? { ...layer, ...patch } : layer
      ))
    }))
  }

  const updateLayerInSlide = (slideId, layerId, patch) => {
    commitSlides((prev) => prev.map((slide) => (
      slide.id === slideId
        ? {
            ...slide,
            layers: (slide.layers || []).map((layer) => (
              layer.id === layerId ? { ...layer, ...patch } : layer
            ))
          }
        : slide
    )))
  }

  const openInteractionConfig = (layer, slideId = activeSlideId) => {
    if (!layer || layer.kind !== 'interaction') return
    setSelectedLayerId(layer.id)
    setConfigTab('basic')
    setConfigDialog({ type: layer.type, layerId: layer.id, slideId })
  }

  const deleteSelectedLayer = () => {
    if (!selectedLayerId) return
    replaceActiveSlide((slide) => {
      const nextLayers = (slide.layers || []).filter((layer) => layer.id !== selectedLayerId)
      const nextBinds = (slide.binds || []).filter((bind) => (
        nextLayers.some((layer) => layer.kind === 'interaction' && layer.type === bind.type)
      ))
      const keepPrimaryBind = !slide.bind || nextLayers.some((layer) => layer.kind === 'interaction' && layer.type === slide.bind.type)
      return { ...slide, layers: nextLayers, binds: nextBinds, bind: keepPrimaryBind ? slide.bind : undefined }
    })
    setSelectedLayerId(null)
    showToast('已删除选中元素')
  }

  const copySelectedLayer = () => {
    if (!selectedLayer) return
    const copy = { ...selectedLayer, id: uid('layer-copy'), x: (selectedLayer.x || 0) + 18, y: (selectedLayer.y || 0) + 18 }
    replaceActiveSlide((slide) => ({ ...slide, layers: [...(slide.layers || []), copy] }))
    setSelectedLayerId(copy.id)
    showToast('已复制选中元素')
  }

  const startLayerDrag = (event, layer) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedLayerId(layer.id)
    const canvas = canvasRef.current
    const node = event.currentTarget.closest('[data-layer-id]')
    if (!canvas || !node) return
    const canvasRect = canvas.getBoundingClientRect()
    const nodeRect = node.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startLeft = nodeRect.left - canvasRect.left
    const startTop = nodeRect.top - canvasRect.top
    const maxLeft = canvas.clientWidth - node.offsetWidth - 6
    const maxTop = canvas.clientHeight - node.offsetHeight - 6
    let nextLeft = startLeft
    let nextTop = startTop

    const move = (moveEvent) => {
      nextLeft = Math.max(6, Math.min(maxLeft, startLeft + moveEvent.clientX - startX))
      nextTop = Math.max(6, Math.min(maxTop, startTop + moveEvent.clientY - startY))
      node.style.left = `${Math.round(nextLeft)}px`
      node.style.top = `${Math.round(nextTop)}px`
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      updateLayer(layer.id, { x: Math.round(nextLeft), y: Math.round(nextTop) })
      showToast('已移动元素')
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up, { once: true })
  }

  const handleDrop = (event) => {
    event.preventDefault()
    try {
      const payload = JSON.parse(event.dataTransfer.getData('application/json'))
      const rect = event.currentTarget.getBoundingClientRect()
      const point = {
        x: Math.round(event.clientX - rect.left - 90),
        y: Math.round(event.clientY - rect.top - 32)
      }
      if (payload.kind === 'interaction') addInteractionToCurrentPage(payload.type, point)
      if (payload.kind === 'question') addQuestionPage(payload.info)
      if (payload.kind === 'resource') addResourcePage(payload.info)
      if (payload.kind === 'subject') addSubjectToolPage(payload.tool)
    } catch {
      showToast('请拖入右侧卡片')
    }
  }

  const handleThumbnailDrop = (event, slideId) => {
    event.preventDefault()
    event.stopPropagation()
    setThumbnailDropId(null)
    try {
      const payload = JSON.parse(event.dataTransfer.getData('application/json'))
      if (payload.kind === 'interaction') {
        addInteractionAsPage(payload.type, slideId)
        return
      }
      showToast('缩略图只接收互动卡片')
    } catch {
      showToast('请拖入右侧互动卡片')
    }
  }

  const setDragPayload = (event, payload) => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/json', JSON.stringify(payload))
  }

  const startInteractionCardDrag = (event, type) => {
    if (event.button !== 0) return
    const origin = { x: event.clientX, y: event.clientY }
    interactionDragRef.current = { type, origin, moved: false }

    const move = (moveEvent) => {
      const drag = interactionDragRef.current
      if (!drag) return
      const moved = Math.abs(moveEvent.clientX - origin.x) > 6 || Math.abs(moveEvent.clientY - origin.y) > 6
      if (moved) {
        drag.moved = true
        document.body.style.cursor = 'grabbing'
      }
    }

    const up = (upEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.cursor = ''

      const drag = interactionDragRef.current
      interactionDragRef.current = null
      if (!drag?.moved) return

      const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)
      const thumbs = [...document.querySelectorAll('[data-slide-thumb-id]')]
      const thumb = target?.closest?.('[data-slide-thumb-id]') || thumbs.find((node) => {
        const rect = node.getBoundingClientRect()
        return upEvent.clientX >= rect.left && upEvent.clientX <= rect.right && upEvent.clientY >= rect.top - 12 && upEvent.clientY <= rect.bottom + 12
      })
      if (thumb) {
        addInteractionAsPage(drag.type, thumb.dataset.slideThumbId)
        return
      }

      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect && upEvent.clientX >= rect.left && upEvent.clientX <= rect.right && upEvent.clientY >= rect.top && upEvent.clientY <= rect.bottom) {
        addInteractionToCurrentPage(drag.type, {
          x: Math.round(upEvent.clientX - rect.left - 90),
          y: Math.round(upEvent.clientY - rect.top - 32)
        })
      }
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up, { once: true })
  }

  const updateConfigField = (type, field, value) => {
    setInteractionConfigs((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field.key]: value }
    }))
    markChanged()
  }

  const handleChipField = (type, field, option) => {
    const current = interactionConfigs[type]?.[field.key]
    if (field.kind === 'single') {
      updateConfigField(type, field, option)
      return
    }
    const list = Array.isArray(current) ? current : []
    const next = list.includes(option) ? list.filter((item) => item !== option) : [...list, option]
    updateConfigField(type, field, next)
  }

  const openPreview = () => {
    setPreviewOpen(true)
    showToast('已打开课件预览')
  }

  const sendToBoard = () => {
    try {
      localStorage.setItem('bubu-teacher-courseware-preview', JSON.stringify({
        slide: activeIndex + 1,
        title: activeSlide.title,
        binds: slideBindLabels(activeSlide),
        updatedAt: Date.now()
      }))
    } catch {}
    showToast('已发送到白板')
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-800">
      <div className="h-10 bg-white border-b border-slate-200 flex items-center px-3 gap-2">
        <BookOpen className="w-4 h-4 text-brand-600" />
        <span className="text-sm font-semibold">T04 课件编辑器</span>
        <span className="text-xs text-slate-400">8.2 一元一次不等式</span>
        <div className="ml-auto flex items-center gap-1">
          <Link to="/courseware" className="w-8 h-8 hover:bg-slate-100 flex items-center justify-center" title="最小化">
            <Minus className="w-4 h-4 text-slate-500" />
          </Link>
          <button className="w-8 h-8 hover:bg-slate-100 flex items-center justify-center" title="最大化">
            <Square className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <Link to="/courseware" className="w-8 h-8 hover:bg-red-100 flex items-center justify-center" title="关闭">
            <X className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      </div>

      <div className="h-11 bg-white border-b border-slate-100 flex items-center px-4 gap-5 text-sm">
        <button className="text-slate-700 hover:text-brand-600">文件</button>
        <button className="text-slate-700 hover:text-brand-600">插入</button>
        <button className="text-slate-700 hover:text-brand-600" onClick={() => setRightTab('interact')}>互动</button>
        <button className="text-slate-700 hover:text-brand-600" onClick={() => setRightTab('subject')}>学科工具</button>
        <button className="w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center" onClick={() => showToast('已撤销上一步')}>
          <Undo2 className="w-4 h-4 text-slate-500" />
        </button>
        <button className="w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center" onClick={() => showToast('已重做上一步')}>
          <Redo2 className="w-4 h-4 text-slate-500" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={openPreview} className="btn-ghost h-8 px-3">
            <Play className="w-3.5 h-3.5 text-brand-500" /> 预览
          </button>
          <button onClick={sendToBoard} className="btn-primary h-8 px-3">
            <Send className="w-3.5 h-3.5" /> 保存并上传
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center gap-2">
        {canvasTools.map((tool, index) => {
          const Icon = tool.icon
          const active = activeTool === tool.key
          return (
            <button
              key={tool.key}
              title={tool.label}
              onClick={() => handleToolClick(tool)}
              className={cx(
                'w-14 h-12 rounded-md text-[11px] transition flex flex-col items-center justify-center gap-1',
                active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50',
                index === 1 && 'ml-2'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tool.label}</span>
            </button>
          )
        })}
        {selectedLayer && (
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs">
            <Move className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600">已选中：{layerLabel(selectedLayer)}</span>
            <button onClick={copySelectedLayer} className="w-7 h-7 rounded hover:bg-white flex items-center justify-center" title="复制">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={deleteSelectedLayer} className="w-7 h-7 rounded hover:bg-red-50 text-red-500 flex items-center justify-center" title="删除">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-[240px_minmax(640px,1fr)_330px] min-h-0">
        <aside className="bg-white border-r border-slate-100 flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">课堂流程</div>
              <span className="text-[11px] text-slate-500">{slides.length} 页 · {stats.minutes} 分钟</span>
            </div>
            <button onClick={addBlankSlide} className="mt-3 w-full h-8 rounded-md border border-dashed border-brand-300 text-brand-600 text-xs flex items-center justify-center gap-1 hover:bg-brand-50">
              <Plus className="w-3.5 h-3.5" /> 新增环节
            </button>
          </div>

          <div className="flex-1 overflow-auto p-3">
            <div className="relative pl-3">
              <div className="absolute left-[18px] top-2 bottom-3 w-px bg-slate-200" />
              {slides.map((slide, index) => {
                const binds = slideBindLabels(slide)
                const active = slide.id === activeSlideId
                return (
                  <button
                    key={slide.id}
                    onClick={() => selectSlide(slide.id)}
                    className={cx(
                      'relative z-10 w-full text-left rounded-md px-3 py-2.5 pl-8 mb-1 transition',
                      active ? 'bg-brand-50 text-slate-900' : 'hover:bg-slate-50 text-slate-600'
                    )}
                  >
                    <span className={cx(
                      'absolute left-2 top-4 w-3 h-3 rounded-full border-2 bg-white',
                      active ? 'border-brand-500 bg-brand-500 shadow-[0_0_0_3px_#dbeafe]' : index < activeIndex ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
                    )} />
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{index + 1}. {slide.name}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{slide.title}</div>
                      </div>
                      <span className="text-[11px] text-slate-400">{slide.time}'</span>
                    </div>
                    {binds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {binds.map((label) => (
                          <span key={label} className="inline-flex items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                            <Sparkles className="w-2.5 h-2.5" /> {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 p-3 text-xs text-slate-500 flex justify-between">
            <span>互动绑定</span>
            <strong className="text-slate-700">{stats.binds} 个</strong>
          </div>
        </aside>

        <main className="min-w-0 flex flex-col bg-slate-100">
          <div className="h-10 bg-white border-b border-slate-100 flex items-center px-4 text-xs">
            <Layers3 className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <span className="font-semibold text-slate-700">第 {activeIndex + 1} 页 · {activeSlide.name}</span>
            <span className="ml-3 text-slate-400">{activeSlide.caption}</span>
            {selectedLayer?.kind === 'interaction' && (
              <button className="ml-auto text-brand-600 hover:underline" onClick={() => openInteractionConfig(selectedLayer)}>
                配置互动
              </button>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-auto p-6 flex flex-col items-center">
            <div
              ref={canvasRef}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="relative w-full max-w-[800px] aspect-video bg-white border border-slate-200 rounded-lg shadow-soft overflow-hidden"
              onPointerDown={() => setSelectedLayerId(null)}
            >
              <SlideBase slide={activeSlide} pageNumber={activeIndex + 1} />
              {(activeSlide.layers || []).map((layer) => (
                <Layer
                  key={layer.id}
                  layer={layer}
                  selected={selectedLayerId === layer.id}
                  onSelect={() => {
                    setSelectedLayerId(layer.id)
                  }}
                  onDragStart={startLayerDrag}
                  onChange={updateLayer}
                  onConfig={() => openInteractionConfig(layer)}
                />
              ))}
            </div>

            <div className="mt-3 w-full max-w-[800px] rounded-lg border border-slate-200 bg-white p-3 flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center flex-none">
                <PanelRight className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-700">备课说明</div>
                <div className="text-slate-500 mt-0.5">{activeSlide.caption}</div>
              </div>
            </div>
          </div>

          <div className="h-20 bg-white border-t border-slate-100 flex items-center gap-2 px-4 overflow-x-auto">
            <span className="text-[11px] text-slate-400 font-semibold border-r border-slate-200 pr-3">缩略图</span>
            {slides.map((slide, index) => {
              const active = slide.id === activeSlideId
              const binds = slideBindLabels(slide)
              return (
                <button
                  key={slide.id}
                  data-slide-thumb-id={slide.id}
                  onClick={() => selectSlide(slide.id)}
                  onDragOver={(event) => {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'copy'
                  }}
                  onDragEnter={() => setThumbnailDropId(slide.id)}
                  onDragLeave={() => setThumbnailDropId((current) => (current === slide.id ? null : current))}
                  onDrop={(event) => handleThumbnailDrop(event, slide.id)}
                  className={cx(
                    'w-20 h-14 rounded-md border p-1 text-left flex-none transition',
                    thumbnailDropId === slide.id ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100' : active ? 'border-brand-500 bg-brand-50' : binds.length ? 'border-emerald-200 bg-white hover:border-brand-300' : 'border-slate-200 bg-white hover:border-brand-300'
                  )}
                >
                  <div className="text-[10px] font-semibold text-slate-600">P{index + 1}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{slide.name}</div>
                  {binds[0] && <div className="text-[9px] text-emerald-600 mt-0.5 truncate">{binds[0]}</div>}
                </button>
              )
            })}
          </div>
        </main>

        <aside className="bg-white border-l border-slate-100 flex flex-col min-h-0">
          <div className="p-3 border-b border-slate-100 flex-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">互动与学科工具</div>
                <div className="mt-1 text-[11px] text-slate-500">画布放模块，缩略图放整页</div>
              </div>
              <Sparkles className="w-4 h-4 text-brand-500" />
            </div>
          </div>

          <div className="border-b border-slate-100 bg-slate-50 px-3 pt-2 flex">
            {[
              ['interact', '互动卡片'],
              ['subject', '学科工具']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRightTab(key)}
                className={cx(
                  'px-3 pb-2 text-xs font-medium border-b-2 transition',
                  rightTab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-auto p-3">
            {rightTab === 'interact' && (
              <div className="space-y-2">
                {Object.entries(INTERACTIONS).map(([type, item]) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={type}
                      onPointerDown={(event) => startInteractionCardDrag(event, type)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 hover:border-brand-300 hover:bg-brand-50/40 transition cursor-grab active:cursor-grabbing flex items-start gap-2"
                    >
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-start gap-3">
                          <div className={cx('w-9 h-9 rounded-lg border flex items-center justify-center flex-none', interactionTone[item.tone])}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                              {(type === 'quiz' || type === 'listen') && <span className="pill bg-emerald-100 text-emerald-700">高频</span>}
                            </div>
                            <div className="text-xs text-slate-500 leading-5 mt-0.5">{item.desc}</div>
                          </div>
                        </div>
                      </div>
                      <button
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation()
                          addInteractionToCurrentPage(type)
                        }}
                        className="mt-1 w-7 h-7 rounded-md text-brand-500 hover:bg-white hover:text-brand-700 flex items-center justify-center"
                        title="插入当前页"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {rightTab === 'subject' && (
              <div className="grid grid-cols-2 gap-2">
                {subjectTools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <button
                      key={tool.name}
                      draggable
                      onDragStart={(event) => setDragPayload(event, { kind: 'subject', tool })}
                      onClick={() => addSubjectToolPage(tool)}
                      className="rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-brand-300 hover:bg-brand-50/40 cursor-grab active:cursor-grabbing"
                    >
                      <Icon className="w-5 h-5 text-brand-600" />
                      <div className="mt-2 text-sm font-semibold text-slate-800">{tool.name}</div>
                      <div className="mt-1 text-[11px] text-slate-500">{tool.subject}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="h-10 bg-white border-t border-slate-100 flex items-center px-4 text-xs text-slate-500">
        <span>第 {activeIndex + 1} / {slides.length} 页</span>
        <Clock3 className="w-3.5 h-3.5 text-slate-400 ml-4" />
        <span className="ml-1">预计 {stats.minutes} 分钟</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-4" />
        <span className="ml-1">{saveState}</span>
        <Cloud className="w-3.5 h-3.5 text-emerald-500 ml-4" />
        <span className="ml-1 text-emerald-600">云端同步成功</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex border border-slate-200 rounded overflow-hidden">
            <button className="px-2 py-0.5 bg-slate-100">|</button>
            <button className="px-2 py-0.5">||</button>
          </div>
          <span>92%</span>
          <button>−</button>
          <button>+</button>
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 flex items-center justify-center p-8" onMouseDown={(event) => event.target === event.currentTarget && setPreviewOpen(false)}>
          <div className="w-[920px] max-w-full rounded-lg bg-white shadow-2xl overflow-hidden">
            <div className="h-12 border-b border-slate-100 px-4 flex items-center">
              <div className="font-semibold text-sm">课件预览 · 第 {activeIndex + 1} 页</div>
              <span className="ml-3 text-xs text-slate-500">{slideBindLabels(activeSlide).join(' / ') || '无互动绑定'}</span>
              <button onClick={() => setPreviewOpen(false)} className="ml-auto w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 bg-slate-100">
              <div className="relative mx-auto max-w-[820px] aspect-video bg-white rounded-lg border border-slate-200 overflow-hidden">
                <SlideBase slide={activeSlide} pageNumber={activeIndex + 1} />
                {(activeSlide.layers || []).map((layer) => <Layer key={layer.id} layer={layer} preview />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {configDialog && configLayer && (
        <InteractionConfigDialog
          type={configDialog.type}
          layer={configLayer}
          configTab={configTab}
          setConfigTab={setConfigTab}
          configs={interactionConfigs[configDialog.type]}
          onChip={handleChipField}
          onText={updateConfigField}
          onLayerChange={(patch) => updateLayerInSlide(configDialog.slideId, configDialog.layerId, patch)}
          onClose={() => setConfigDialog(null)}
          onSave={() => {
            showToast(`${INTERACTIONS[configDialog.type].label} 配置已保存`)
            setConfigDialog(null)
          }}
        />
      )}
    </div>
  )
}

function SlideBase({ slide, pageNumber }) {
  return (
    <div className="absolute inset-0 p-9">
      <div className="absolute right-4 top-4 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        云端课件 v14
      </div>
      <div className={cx('inline-flex rounded-full border px-3 py-1 text-xs font-semibold', tagTone[slide.tagTone] || tagTone.blue)}>
        {slide.tag}
      </div>
      <h1 className="mt-4 text-[30px] leading-tight font-bold text-slate-900">{slide.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{slide.subtitle}</p>

      {slide.cards?.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {slide.cards.slice(0, 3).map(([title, body]) => (
            <div key={`${title}-${body}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-base font-bold text-brand-700">{title}</div>
              <div className="mt-1 text-xs leading-5 text-slate-600">{body}</div>
            </div>
          ))}
        </div>
      )}

      {slide.bullets?.length > 0 && (
        <div className="mt-5 space-y-2">
          {slide.bullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500 flex-none" />
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      )}

      {slide.formula && (
        <div className="mt-5 inline-flex max-w-full rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-lg font-bold text-blue-700">
          {slide.formula}
        </div>
      )}

      {slide.numberLine && (
        <div className="absolute left-12 right-12 bottom-12">
          <div className="relative h-px bg-slate-400">
            <div className="absolute -right-1 -top-1 h-2 w-2 rotate-45 border-r border-t border-slate-400" />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-slate-500">
            {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((num) => (
              <span key={num} className="relative w-8 text-center before:absolute before:left-1/2 before:-top-2 before:h-2 before:w-px before:bg-slate-400">{num}</span>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-5 text-[44px] font-black leading-none text-brand-50">{String(pageNumber).padStart(2, '0')}</div>
    </div>
  )
}

function Layer({ layer, selected, onSelect, onDragStart, onChange, onConfig, preview }) {
  const style = {
    left: layer.x,
    top: layer.y,
    width: layer.w,
    height: layer.h
  }
  const common = cx(
    'absolute z-10 rounded-lg border shadow-[0_8px_22px_rgba(15,23,42,0.12)]',
    selected && !preview ? 'ring-2 ring-brand-300 ring-offset-2' : ''
  )

  const stop = (event) => {
    event.stopPropagation()
    if (!preview) onSelect?.()
  }

  if (layer.kind === 'shape') {
    return (
      <div data-layer-id={layer.id} style={style} onPointerDown={stop} className={cx(common, 'border-2 border-brand-500 bg-brand-50/40')}>
        {!preview && <DragHandle layer={layer} onDragStart={onDragStart} />}
      </div>
    )
  }

  if (layer.kind === 'media') {
    return (
      <div data-layer-id={layer.id} style={style} onPointerDown={stop} className={cx(common, 'border-slate-300 bg-slate-50 p-3 text-center text-xs text-slate-500 grid place-items-center')}>
        {!preview && <DragHandle layer={layer} onDragStart={onDragStart} />}
        <div>
          <ImageIcon className="mx-auto mb-2 h-6 w-6 text-slate-400" />
          <div className="font-semibold text-slate-700">{layer.title}</div>
          <div className="mt-1">{layer.body}</div>
        </div>
      </div>
    )
  }

  if (layer.kind === 'formula') {
    return (
      <div data-layer-id={layer.id} style={style} onPointerDown={stop} className={cx(common, 'border-blue-100 bg-blue-50 px-4 py-3 text-blue-700')}>
        {!preview && <DragHandle layer={layer} onDragStart={onDragStart} />}
        <div className="text-xs font-semibold text-blue-500">{layer.title}</div>
        <EditableText preview={preview} className="mt-1 text-lg font-bold" value={layer.body} onBlur={(value) => onChange(layer.id, { body: value })} />
      </div>
    )
  }

  if (layer.kind === 'mind') {
    const nodes = String(layer.body || '').split('|').filter(Boolean)
    return (
      <div data-layer-id={layer.id} style={style} onPointerDown={stop} className={cx(common, 'border-violet-100 bg-white p-3')}>
        {!preview && <DragHandle layer={layer} onDragStart={onDragStart} />}
        <div className="text-xs font-semibold text-violet-700">{layer.title}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {nodes.map((node) => <span key={node} className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">{node}</span>)}
        </div>
      </div>
    )
  }

  if (layer.kind === 'interaction') {
    const detail = INTERACTIONS[layer.type] || INTERACTIONS.quiz
    const Icon = detail.icon
    return (
      <div data-layer-id={layer.id} style={style} onPointerDown={stop} onDoubleClick={() => !preview && onConfig(layer.type)} className={cx(common, 'border-emerald-300 bg-emerald-50/70 p-4 text-emerald-900')}>
        {!preview && <DragHandle layer={layer} onDragStart={onDragStart} />}
        {!preview && (
          <button
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onConfig(layer.type)}
            className="absolute right-2 top-[-14px] rounded-full border border-emerald-400 bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-700 shadow-sm hover:bg-emerald-500 hover:text-white"
          >
            配置
          </button>
        )}
        <div className="flex items-center gap-2 font-bold">
          <Icon className="h-4 w-4" />
          <EditableText preview={preview} className="min-w-0" value={layer.title} onBlur={(value) => onChange(layer.id, { title: value })} />
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] text-white">同步</span>
        </div>
        <EditableText preview={preview} className="mt-2 text-xs leading-5 text-emerald-800" value={layer.body} onBlur={(value) => onChange(layer.id, { body: value })} />
      </div>
    )
  }

  return (
    <div data-layer-id={layer.id} style={style} onPointerDown={stop} className={cx(common, 'border-slate-200 bg-white p-3')}>
      {!preview && <DragHandle layer={layer} onDragStart={onDragStart} />}
      <EditableText preview={preview} className="text-base font-bold text-brand-700" value={layer.title} onBlur={(value) => onChange(layer.id, { title: value })} />
      <EditableText preview={preview} className="mt-1 text-xs leading-5 text-slate-600" value={layer.body} onBlur={(value) => onChange(layer.id, { body: value })} />
    </div>
  )
}

function DragHandle({ layer, onDragStart }) {
  return (
    <button
      onPointerDown={(event) => onDragStart(event, layer)}
      className="absolute -left-2.5 -top-2.5 h-6 w-6 rounded-md bg-brand-600 text-white shadow-md grid place-items-center cursor-move"
      title="拖动"
    >
      <GripVertical className="h-3.5 w-3.5" />
    </button>
  )
}

function EditableText({ value, onBlur, className, preview }) {
  if (preview) return <div className={className}>{value}</div>
  return (
    <div
      className={cx(className, 'outline-none rounded focus:bg-white focus:ring-2 focus:ring-brand-100')}
      contentEditable
      suppressContentEditableWarning
      onPointerDown={(event) => event.stopPropagation()}
      onBlur={(event) => onBlur(event.currentTarget.textContent)}
    >
      {value}
    </div>
  )
}

function InteractionConfigDialog({ type, layer, configTab, setConfigTab, configs, onChip, onText, onLayerChange, onClose, onSave }) {
  const detail = INTERACTIONS[type] || INTERACTIONS.quiz
  const Icon = detail.icon
  const fields = CONFIG_FIELDS[type]?.[configTab] || []
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-[560px] max-w-full rounded-lg bg-white shadow-2xl">
        <div className="h-14 border-b border-slate-100 px-4 flex items-center gap-3">
          <div className={cx('w-9 h-9 rounded-lg border flex items-center justify-center', interactionTone[detail.tone])}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800">配置 {detail.label}</div>
            <div className="text-[11px] text-slate-500 truncate">{detail.desc}</div>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <label className="block">
            <span className="text-xs text-slate-500">互动名称</span>
            <input
              className="input mt-1 w-full"
              value={layer.title || ''}
              onChange={(event) => onLayerChange({ title: event.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">{type === 'quiz' ? '题目内容' : '任务说明'}</span>
            <textarea
              className="input mt-1 min-h-[92px] w-full resize-none py-2"
              value={layer.body || ''}
              onChange={(event) => onLayerChange({ body: event.target.value })}
            />
          </label>

          <div className="rounded-lg border border-slate-200">
            <div className="px-3 pt-2 flex border-b border-slate-100">
              <button
                onClick={() => setConfigTab('basic')}
                className={cx('flex-1 pb-2 text-xs font-medium border-b-2', configTab === 'basic' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500')}
              >
                基础设置
              </button>
              <button
                onClick={() => setConfigTab('advanced')}
                className={cx('flex-1 pb-2 text-xs font-medium border-b-2', configTab === 'advanced' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500')}
              >
                高级设置
              </button>
            </div>
            <div className="p-3 space-y-3">
              {fields.map((field) => (
                <ConfigField
                  key={field.key}
                  type={type}
                  field={field}
                  value={configs?.[field.key]}
                  onChip={onChip}
                  onText={onText}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="h-14 border-t border-slate-100 px-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="btn-ghost h-8 px-3 text-xs">取消</button>
          <button onClick={onSave} className="btn-primary h-8 px-3 text-xs">
            <Save className="w-3.5 h-3.5" /> 保存
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfigField({ type, field, value, onChip, onText }) {
  if (field.kind === 'text') {
    return (
      <label className="block">
        <span className="text-xs text-slate-500">{field.label}</span>
        <input
          className="input mt-1 w-full"
          value={value || ''}
          onChange={(event) => onText(type, field, event.target.value)}
        />
      </label>
    )
  }
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1.5">{field.label}</div>
      <div className="flex flex-wrap gap-1.5">
        {field.options.map((option) => {
          const active = Array.isArray(value) ? value.includes(option) : value === option
          return (
            <button
              key={option}
              onClick={() => onChip(type, field, option)}
              className={cx(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
                active ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-500 hover:border-brand-200'
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function slideBindLabels(slide) {
  const labels = []
  if (slide?.bind?.label) labels.push(slide.bind.label)
  ;(slide?.binds || []).forEach((bind) => labels.push(bind.label))
  return [...new Set(labels)]
}

function layerLabel(layer) {
  if (layer.kind === 'interaction') return INTERACTIONS[layer.type]?.label || '互动'
  if (layer.kind === 'media') return layer.title || '媒体'
  if (layer.kind === 'mind') return '思维导图'
  if (layer.kind === 'shape') return '形状'
  if (layer.kind === 'formula') return '公式'
  return '文本'
}
