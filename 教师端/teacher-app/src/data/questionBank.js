// 共享题库 mock 数据（作业特化题库 / 智能题库 / 排版 共用）
// 主题：人教版（2012）五年级上册 · 小数除法

export const TEXTBOOK = { press: '人教版（2012）', grade: '五年级上册', subject: '数学' }

// 左侧章节目录树
export const chapterTree = [
  { id: 'c1', label: '1 小数乘法' },
  { id: 'c2', label: '2 位置' },
  {
    id: 'c3', label: '3 小数除法', defaultOpen: true, children: [
      { id: 'c3-1', label: '除数是整数的小数除法' },
      {
        id: 'c3-2', label: '一个数除以小数', defaultOpen: true, children: [
          { id: 'c3-2-1', label: '除数是小数的小数除法', selected: true },
          { id: 'c3-2-2', label: '除数是小数的小数除法的应用' },
          { id: 'c3-2-3', label: '被除数和商的大小关系（小数除法）' },
          { id: 'c3-2-4', label: '小数的连除运算' },
          { id: 'c3-2-5', label: '小数除、乘混合运算' },
          { id: 'c3-2-6', label: '小数的四则运算及法则' },
          { id: 'c3-2-7', label: '小数除法相关的简便运算' }
        ]
      },
      { id: 'c3-3', label: '商的近似数' },
      { id: 'c3-4', label: '循环小数' },
      { id: 'c3-5', label: '用计算器探索规律' }
    ]
  },
  { id: 'c4', label: '4 可能性' },
  { id: 'c5', label: '5 简易方程' },
  { id: 'c6', label: '6 多边形的面积' },
  { id: 'c7', label: '7 数学广角—植树问题' },
  { id: 'c8', label: '8 总复习' }
]

export const diffStyle = {
  容易: 'bg-emerald-50 text-emerald-600',
  适中: 'bg-amber-50 text-amber-600',
  困难: 'bg-rose-50 text-rose-600'
}

// 题目库（多行公式用数组渲染）
export const questions = [
  {
    id: 1, no: 1, type: '计算题', diff: '适中', minutes: 5, kp: '小数除法',
    stem: '脱式计算，能用简便方法的用简便方法计算。',
    lines: ['1.6×9.8 + 1.6×0.2          12.5×13×8', '(14.6 − 2) ÷ 0.28          20.9 + 10.5 ÷ (5.5 − 4.8)'],
    source: '2024-2025学年湖南省益阳市期中试卷', score: 8
  },
  {
    id: 2, no: 2, type: '计算题', diff: '适中', minutes: 5, kp: '小数除法',
    stem: '直接写出得数。',
    lines: ['1.25×8 =      0.15×60 =      20.5÷5 =      3.6÷4 =', '0.36 + 1.54 =      0÷1.9 =      0.02×0.5 =      0.72÷0.3 ='],
    source: '本学期 · 单元测', score: 8
  },
  {
    id: 3, no: 3, type: '解答题', diff: '适中', minutes: 5, kp: '小数除法',
    stem: '青青草原上，大灰狼把小羊关在狼堡的密室里，快来破解狼堡入口的密码和密室的密码救小羊出去吧！',
    lines: [
      '(1) 进入狼堡的密码是按下面流程图计算后的结果。',
      '开始 → 2.4 → 乘 2 → 加 3.6 → 除以 1.4 → 结果，密码是多少？',
      '(2) 进入密室的密码是这道题的正确答案。大灰狼在计算 (75 + □) × 5 时，',
      '错算成 75 + □ × 5，结果是 1725，正确密码应该是多少？'
    ],
    source: '2023-2024学年江苏省苏州市单元测', score: 10
  },
  {
    id: 4, no: 4, type: '解答题', diff: '适中', minutes: 4, kp: '小数除法的应用',
    stem: '超市促销活动，某商品原价 48.6 元，现打八折出售，现价是多少元？',
    lines: [], source: '校本题库', score: 6
  },
  {
    id: 5, no: 5, type: '解答题', diff: '困难', minutes: 6, kp: '小数除法的应用',
    stem: '工程队修一条长 3.25 千米的道路，已经修了 1.75 千米，剩下的要 5 天修完，平均每天修多少千米？',
    lines: [], source: '近三年真题', score: 8
  },
  {
    id: 6, no: 6, type: '填空题', diff: '容易', minutes: 2, kp: '循环小数',
    stem: '3.6 ÷ 4.5 的商用循环小数简便记法表示是（  ）。',
    lines: [], source: '2023-2024学年苏州市期末', score: 3
  },
  {
    id: 7, no: 7, type: '选择题', diff: '容易', minutes: 2, kp: '被除数和商的大小关系',
    stem: '一个数（0 除外）除以小于 1 的数，所得的商（  ）。 A. 比原数大　B. 比原数小　C. 与原数相等　D. 无法确定',
    lines: [], source: '校本题库', score: 3
  },
  {
    id: 8, no: 8, type: '判断题', diff: '容易', minutes: 1, kp: '小数除法',
    stem: '在小数除法中，商一定小于被除数。（  ）',
    lines: [], source: '本学期 · 随堂练', score: 2
  }
]

// 排版页面默认装入的题目（作业里已选的 3 道）
export const layoutGroups = [
  {
    type: '计算题',
    items: [questions[0], questions[1]]
  },
  {
    type: '解决问题',
    items: [{ ...questions[2], type: '解决问题' }]
  }
]
