// 教师端作业数据层 v2（规范化实体模型）
// 实体：作业本体(homeworks) × 班级发布实例(publications) × 花名册(students) × 学生作答(submissions)
// 三个 tab 由对 publications 的 stage 过滤/聚合派生，状态建在「班级实例」层而非「作业」层。
import { questions, TEXTBOOK } from './questionBank.js'

const STORAGE_KEY = 'bubu.teacher.homework.v2'
const LEGACY_KEY = 'bubu.teacher.homework.v1'

// ---------- 班级花名册（人数的单一来源，终结 45 / 42 不一致）----------
export const CLASSES = [
  { id: 'c1', name: '五 (1) 班', studentCount: 45 },
  { id: 'c2', name: '五 (2) 班', studentCount: 43 },
  { id: 'c3', name: '五 (3) 班', studentCount: 44 }
]
export const CLASS_NAMES = CLASSES.map(c => c.name)
const classById = (id) => CLASSES.find(c => c.id === id)
const classByName = (name) => CLASSES.find(c => c.name === name)

// 错因标签池（小数除法主题，用于错因聚类）
export const ERROR_TAGS = [
  '商的小数点定位错误', '小数点对齐错误', '试商不准确', '余数处理错误',
  '单位换算遗漏', '简便运算误用', '审题不清', '计算粗心'
]

const SURNAMES = '李王张刘陈杨黄赵周吴徐孙马朱胡郭何高林郑谢罗梁宋唐许韩冯邓曹彭曾'
const GIVEN = ['浩然', '子涵', '宇航', '梓萱', '欣怡', '思琪', '俊杰', '雨萱', '明轩', '佳怡',
  '梓豪', '语桐', '一诺', '若曦', '子墨', '诗涵', '梦琪', '皓宇', '可昕', '天佑',
  '嘉怡', '伊然', '泽宇', '雅静', '博文', '欣妍', '子睿', '紫萱', '志远', '梓晴']

// ---------- 工具 ----------
const canUseStorage = () => typeof window !== 'undefined' && window.localStorage
const pad = (n) => String(n).padStart(2, '0')

const nowMinute = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const fmtDeadline = (value) => (value ? String(value).replace('T', ' ') : '未设置')

// 确定性随机：同一种子每次结果一致，使 mock 看起来像真数据
const hashStr = (s) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
const mulberry32 = (seed) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)]

// ---------- 题目 -> 作业题项 ----------
const toType = (t) => (t === '解答题' ? '解决问题' : t)

export function normalizeHomeworkItems(items = []) {
  return items.map((item) => {
    const score = Number(item.score)
    const type = toType(item.type)
    return {
      ...item,
      type,
      group: item.group || type || '未分组',
      lines: Array.isArray(item.lines) ? item.lines : [],
      score: Number.isFinite(score) && score >= 0 ? score : 0
    }
  })
}
const itemsFromIds = (ids) => normalizeHomeworkItems(ids.map(id => questions.find(q => q.id === id)).filter(Boolean))

export function idsFromItems(items = []) {
  return items.map((item) => item.id).filter(Boolean)
}

// ---------- 学生 / 作答的确定性生成 ----------
const buildStudents = (cls) => {
  const rnd = mulberry32(hashStr('stu-' + cls.id))
  return Array.from({ length: cls.studentCount }, (_, i) => ({
    id: `${cls.id}-${1001 + i}`,
    no: 1001 + i,
    name: pick(rnd, SURNAMES.split('')) + pick(rnd, GIVEN),
    classId: cls.id,
    tier: i % 5 === 0 ? 'C' : i % 2 === 0 ? 'A' : 'B'
  }))
}

const gradedQuotaForStage = (stage, submittedCount) => {
  if (stage === 'collecting') return 0
  if (stage === 'grading') return Math.round(submittedCount * 0.4)
  return submittedCount // graded / lectured
}

const buildSubmissions = (pub, homework, students) => {
  const rnd = mulberry32(hashStr('sub-' + pub.id))
  const submittedCount = Math.max(1, Math.round(students.length * (0.82 + rnd() * 0.16)))
  const submitted = students.slice(0, submittedCount)
  const gradeUntil = gradedQuotaForStage(pub.stage, submitted.length)

  const map = {}
  submitted.forEach((stu, idx) => {
    const isGraded = idx < gradeUntil
    let earned = 0
    const answers = homework.items.map((item) => {
      const wrongBias = stu.tier === 'C' ? 0.5 : stu.tier === 'B' ? 0.28 : 0.12
      const correct = rnd() > wrongBias
      const score = correct ? item.score : (rnd() > 0.5 ? Math.round(item.score * 0.5) : 0)
      earned += score
      return {
        qid: item.id,
        correct,
        score,
        graded: isGraded,
        tags: correct ? [] : [pick(rnd, ERROR_TAGS)]
      }
    })
    map[stu.id] = {
      studentId: stu.id,
      submittedAt: `2026-05-${pad(20 + (idx % 9))} ${pad(8 + (idx % 11))}:${pad(5 + (idx % 53))}`,
      status: isGraded ? '已批' : '待批',
      score: isGraded ? earned : null,
      answers
    }
  })
  return map
}

// ---------- 种子数据 ----------
const SEED_DEFS = {
  drafts: [
    { id: 'hw-d1', name: '五年级小数除法巩固练习', qids: [1, 2, 3, 4, 6, 7, 8], created: '2026-05-30 15:30' },
    { id: 'hw-d2', name: '分数加减法基础练习', qids: [2, 6, 8], created: '2026-05-29 10:12' },
    { id: 'hw-d3', name: '多边形面积单元预习', qids: [4, 5], created: '2026-05-28 09:40' }
  ],
  published: [
    { id: 'hw-p1', name: '小数乘法每日一练', qids: [1, 2, 7, 8], created: '2026-05-26 08:00', pubs: [{ classId: 'c1', stage: 'grading', deadline: '2026-05-28 23:59' }] },
    { id: 'hw-p2', name: '位置与方向课后练', qids: [6, 7, 8], created: '2026-05-25 08:00', pubs: [{ classId: 'c2', stage: 'collecting', deadline: '2026-05-27 23:59' }] },
    { id: 'hw-p3', name: '小数除法随堂检测', qids: [1, 2, 3, 4], created: '2026-05-24 08:00', pubs: [{ classId: 'c1', stage: 'grading', deadline: '2026-05-26 23:59' }] },
    { id: 'hw-m1', name: '小数除法单元过关', qids: [1, 2, 3, 4, 6, 7], created: '2026-05-23 08:00', pubs: [{ classId: 'c1', stage: 'graded', deadline: '2026-05-29 23:59' }, { classId: 'c2', stage: 'grading', deadline: '2026-05-29 23:59' }] },
    { id: 'hw-r1', name: '期中复习卷', qids: [1, 2, 3, 4, 5, 6, 7, 8], created: '2026-05-19 08:00', pubs: [{ classId: 'c1', stage: 'graded', deadline: '2026-05-20 已截止' }] },
    { id: 'hw-r2', name: '小数乘法单元测', qids: [1, 2, 3], created: '2026-05-17 08:00', pubs: [{ classId: 'c2', stage: 'graded', deadline: '2026-05-18 已截止' }] }
  ]
}

const meta = () => ({ press: TEXTBOOK.press, grade: TEXTBOOK.grade, subject: TEXTBOOK.subject })

function createSeedStore() {
  const store = { schemaVersion: 2, students: {}, homeworks: {}, publications: {}, submissions: {} }
  CLASSES.forEach(cls => { store.students[cls.id] = buildStudents(cls) })

  SEED_DEFS.drafts.forEach(def => {
    store.homeworks[def.id] = {
      id: def.id, name: def.name, ...meta(),
      items: itemsFromIds(def.qids), status: 'draft',
      createdAt: def.created, updatedAt: def.created
    }
  })

  SEED_DEFS.published.forEach(def => {
    const hw = {
      id: def.id, name: def.name, ...meta(),
      items: itemsFromIds(def.qids), status: 'published',
      createdAt: def.created, updatedAt: def.created
    }
    store.homeworks[def.id] = hw
    def.pubs.forEach((p, i) => {
      const pubId = `pub-${def.id}-${p.classId}`
      const pub = {
        id: pubId, homeworkId: def.id, classId: p.classId,
        deadline: p.deadline, publishedAt: def.created, stage: p.stage
      }
      store.publications[pubId] = pub
      store.submissions[pubId] = buildSubmissions(pub, hw, store.students[p.classId])
    })
  })
  return store
}

// ---------- v1 -> v2 迁移（保住用户自建草稿）----------
function migrateLegacy() {
  if (!canUseStorage()) return null
  let legacy
  try { legacy = JSON.parse(window.localStorage.getItem(LEGACY_KEY) || 'null') } catch { legacy = null }
  if (!legacy) return null

  const store = createSeedStore()
  const drafts = Array.isArray(legacy.未发布) ? legacy.未发布 : []
  drafts.forEach(row => {
    const id = row.id || createId('hw')
    const items = Array.isArray(row.items) && row.items.length
      ? normalizeHomeworkItems(row.items)
      : itemsFromIds(Array.isArray(row.selectedIds) ? row.selectedIds : [])
    store.homeworks[id] = {
      id, name: row.name || '未命名作业', ...meta(),
      items, status: 'draft',
      createdAt: row.created || nowMinute(), updatedAt: nowMinute()
    }
  })
  return store
}

// ---------- 读写 ----------
export function readStore() {
  if (!canUseStorage()) return createSeedStore()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.schemaVersion === 2) return parsed
    }
    const migrated = migrateLegacy() || createSeedStore()
    writeStore(migrated)
    return migrated
  } catch {
    const fresh = createSeedStore()
    writeStore(fresh)
    return fresh
  }
}

export function writeStore(store) {
  if (canUseStorage()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  return store
}

export function resetStore() {
  const fresh = createSeedStore()
  return writeStore(fresh)
}

// ---------- 派生 / 进度 ----------
const progressOf = (store, pubId) => {
  const subs = store.submissions[pubId] || {}
  const list = Object.values(subs)
  return {
    submit: list.length,
    graded: list.filter(s => s.status === '已批').length
  }
}

const targetFromPub = (store, pub) => {
  const { submit, graded } = progressOf(store, pub.id)
  const cls = classById(pub.classId)
  const stageState = pub.stage === 'graded' || pub.stage === 'lectured'
    ? '待讲评'
    : pub.stage === 'grading' ? '批阅中' : '待批阅'
  return {
    name: cls?.name || pub.classId,
    classId: pub.classId,
    pubId: pub.id,
    stage: pub.stage,
    state: stageState,
    submit,
    graded,
    total: cls?.studentCount || 0,
    deadline: pub.deadline
  }
}

const aggregateByHomework = (store, pubs) => {
  const byHw = {}
  pubs.forEach(pub => { (byHw[pub.homeworkId] = byHw[pub.homeworkId] || []).push(pub) })
  return Object.entries(byHw).map(([hwId, list]) => {
    const hw = store.homeworks[hwId]
    const classTargets = list.map(p => targetFromPub(store, p))
    const totals = classTargets.reduce((acc, t) => ({
      submit: acc.submit + t.submit, total: acc.total + t.total, graded: acc.graded + t.graded
    }), { submit: 0, total: 0, graded: 0 })
    return {
      id: hwId,
      name: hw?.name || '未命名作业',
      count: hw?.items.length || 0,
      klass: classTargets.map(t => t.name).join('、'),
      deadline: classTargets[0]?.deadline || '未设置',
      created: hw?.createdAt,
      classTargets,
      submit: totals.submit,
      total: totals.total,
      graded: totals.graded
    }
  })
}

const draftRow = (hw) => ({
  id: hw.id,
  name: hw.name,
  klass: '待选班级',
  count: hw.items.length,
  deadline: '未设置',
  created: hw.createdAt,
  items: hw.items,
  selectedIds: idsFromItems(hw.items)
})

// 列表三 tab：由 publications 的 stage 派生
export function getHomeworkListData() {
  const store = readStore()
  const drafts = Object.values(store.homeworks)
    .filter(hw => hw.status === 'draft')
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  const pubs = Object.values(store.publications)
  const reviewPubs = pubs.filter(p => p.stage === 'collecting' || p.stage === 'grading')
  const lecturePubs = pubs.filter(p => p.stage === 'graded')

  const sortByCreated = (rows) => rows.sort((a, b) => String(b.created).localeCompare(String(a.created)))
  return {
    未发布: drafts.map(draftRow),
    待批阅: sortByCreated(aggregateByHomework(store, reviewPubs)),
    待讲评: sortByCreated(aggregateByHomework(store, lecturePubs))
  }
}

export function getHomeworkItems(homeworkId) {
  const store = readStore()
  return store.homeworks[homeworkId]?.items || []
}

// ---------- 批阅 / 讲评 / 错因 的统一上下文（pubId 驱动）----------
export function getReviewContext(pubId) {
  const store = readStore()
  const pub = store.publications[pubId]
  if (!pub) return null
  const hw = store.homeworks[pub.homeworkId]
  const cls = classById(pub.classId)
  const subs = store.submissions[pubId] || {}
  const students = (store.students[pub.classId] || []).map(s => {
    const sub = subs[s.id]
    return {
      ...s,
      submitted: !!sub,
      status: sub ? sub.status : '未提交',
      score: sub ? sub.score : null,
      submittedAt: sub?.submittedAt || null,
      answers: sub?.answers || []
    }
  })
  const { submit, graded } = progressOf(store, pubId)
  return {
    pubId, homeworkId: pub.homeworkId, homework: hw,
    name: hw?.name || '未命名作业',
    className: cls?.name || pub.classId,
    deadline: pub.deadline, stage: pub.stage,
    items: hw?.items || [],
    students, roster: cls?.studentCount || students.length,
    submit, graded,
    maxScore: (hw?.items || []).reduce((s, it) => s + (it.score || 0), 0)
  }
}

export function getErrorAnalysis(pubId) {
  const store = readStore()
  const pub = store.publications[pubId]
  if (!pub) return null
  const hw = store.homeworks[pub.homeworkId]
  const cls = classById(pub.classId)
  const subs = Object.values(store.submissions[pubId] || {})

  const tagCount = {}
  let totalAnswers = 0
  let correctAnswers = 0
  const perQuestion = (hw?.items || []).map(it => ({ id: it.id, no: it.no, type: it.type, kp: it.kp, stem: it.stem, wrong: 0, total: 0 }))
  const qIndex = Object.fromEntries(perQuestion.map((q, i) => [q.id, i]))

  subs.forEach(sub => {
    sub.answers.forEach(ans => {
      totalAnswers++
      if (ans.correct) correctAnswers++
      const q = perQuestion[qIndex[ans.qid]]
      if (q) { q.total++; if (!ans.correct) q.wrong++ }
      ans.tags.forEach(tag => { tagCount[tag] = (tagCount[tag] || 0) + 1 })
    })
  })

  const submitted = subs.length
  const causes = Object.entries(tagCount)
    .map(([name, n]) => ({ name, n, pct: submitted ? Math.round((n / submitted) * 100) : 0 }))
    .sort((a, b) => b.n - a.n)
  const correctRate = totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : 0

  return {
    pubId, name: hw?.name || '未命名作业', className: cls?.name || pub.classId,
    roster: cls?.studentCount || 0, submitted,
    correctRate,
    causes,
    byQuestion: perQuestion.map(q => ({
      ...q, accuracy: q.total ? Math.round(((q.total - q.wrong) / q.total) * 100) : 0
    })),
    highRisk: subs.filter(s => {
      const tot = s.answers.length
      const right = s.answers.filter(a => a.correct).length
      return tot && right / tot < 0.4
    }).length
  }
}

// ---------- 写：批阅回写 + 阶段流转 ----------
export function gradeSubmission(pubId, studentId, score) {
  const store = readStore()
  const sub = store.submissions[pubId]?.[studentId]
  if (!sub) return getReviewContext(pubId)
  sub.status = '已批'
  sub.score = Number(score)
  sub.answers.forEach(a => { a.graded = true })

  const pub = store.publications[pubId]
  const { submit, graded } = progressOf(store, pubId)
  if (pub) {
    if (submit > 0 && graded >= submit) pub.stage = 'graded'
    else if (graded > 0) pub.stage = 'grading'
  }
  writeStore(store)
  return getReviewContext(pubId)
}

export function markPublicationLectured(pubId) {
  const store = readStore()
  const pub = store.publications[pubId]
  if (pub) { pub.stage = 'lectured'; writeStore(store) }
  return store
}

// ---------- 写：草稿 / 发布 ----------
export function saveDraftToStore({ id, name, items }) {
  const store = readStore()
  const hwId = id || createId('hw')
  const existing = store.homeworks[hwId]
  const hw = {
    id: hwId, name: (name || '未命名作业').trim(), ...meta(),
    items: normalizeHomeworkItems(items),
    status: existing && existing.status === 'published' ? 'published' : 'draft',
    createdAt: existing?.createdAt || nowMinute(),
    updatedAt: nowMinute()
  }
  store.homeworks[hwId] = hw
  writeStore(store)
  return { id: hwId, homework: hw }
}

export function publishHomeworkToStore({ id, name, items, classes = [], deadline }) {
  const store = readStore()
  const classList = classes.map(c => String(c).trim()).filter(Boolean)
  if (classList.length === 0) throw new Error('请选择发布班级')

  const hwId = id || createId('hw')
  const existing = store.homeworks[hwId]
  const hw = {
    id: hwId, name: (name || '未命名作业').trim(), ...meta(),
    items: normalizeHomeworkItems(items),
    status: 'published',
    createdAt: existing?.createdAt || nowMinute(),
    updatedAt: nowMinute()
  }
  store.homeworks[hwId] = hw

  const created = []
  classList.forEach(cn => {
    const cls = classByName(cn)
    if (!cls) return
    const pubId = `pub-${hwId}-${cls.id}-${Math.random().toString(36).slice(2, 5)}`
    const pub = {
      id: pubId, homeworkId: hwId, classId: cls.id,
      deadline: fmtDeadline(deadline), publishedAt: nowMinute(), stage: 'collecting'
    }
    store.publications[pubId] = pub
    store.submissions[pubId] = buildSubmissions(pub, hw, store.students[cls.id])
    created.push(pubId)
  })
  writeStore(store)
  return { id: hwId, publications: created }
}

export function deleteDraftFromStore(id) {
  const store = readStore()
  const hw = store.homeworks[id]
  if (hw && hw.status === 'draft') delete store.homeworks[id]
  writeStore(store)
  return getHomeworkListData()
}

export function publishDraftFromStore(row, classes = [], deadline = '') {
  const items = getHomeworkItems(row.id)
  publishHomeworkToStore({ id: row.id, name: row.name, items, classes, deadline })
  return getHomeworkListData()
}
