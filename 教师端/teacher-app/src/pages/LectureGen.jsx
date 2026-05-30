import { Link } from 'react-router-dom'
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  HelpCircle,
  Menu,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Upload,
  Wand2
} from 'lucide-react'

const sourceMaterials = [
  { title: '本次作业错因分析', desc: '基于班级整体批阅数据生成的错因分析', meta: '错因数：15', thumb: 'chart' },
  { title: '典型错答', desc: '包含具有代表性的学生错误作答', meta: '例题数：12', thumb: 'answer' },
  { title: '高频错题与变式题', desc: '错误率较高的题目及配套变式训练', meta: '题目数：8', thumb: 'list' },
  { title: '优质答案', desc: '优秀学生的规范解答与解题思路', meta: '题目数：6', thumb: 'paper' }
]

const outlineSections = [
  { no: '一', icon: Target, title: '讲评目标', lines: ['复习一元一次不等式的概念、解法及数轴表示；', '能正确解一元一次不等式并在数轴上表示；', '能识别并纠正常见错误，提高规范解题能力。'] },
  { no: '二', icon: HelpCircle, title: '高频错因', lines: ['移项时变号错误（占比 36%）', '不等号方向理解错误（占比 24%）', '解集在数轴上表示不规范（占比 18%）', '合并同类项计算错误（占比 12%）'] },
  { no: '三', icon: FileText, title: '典型例题', lines: ['精选典型错题 4 道，展示学生错误作答，分析错误原因，给出规范解法。'] },
  { no: '四', icon: Wand2, title: '变式练习', lines: ['针对典型题进行变式训练，逐步提升难度，巩固解题方法。'] },
  { no: '五', icon: BookOpen, title: '板书建议', lines: ['提供板书结构建议与关键步骤提示，便于课堂讲解与学生记录。'] },
  { no: '六', icon: HelpCircle, title: '课堂追问', lines: ['设置 3-5 个思考问题，检验学生理解，促进深度思考与交流。'] }
]

const previewPages = ['讲评页 1', '讲评页 2', '讲评页 3', '讲评页 4', '讲评页 5']

export default function LectureGen() {
  return (
    <div className="min-h-full bg-[#f7faff] px-5 py-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button className="rounded-lg p-2 text-slate-700 hover:bg-slate-100">
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <div className="text-[24px] font-bold tracking-tight text-slate-950">T14 讲评材料生成</div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Link to="/review" className="hover:text-brand-600">作业批阅</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-700">讲评材料生成</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-[300px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-400">
            <Search className="h-4 w-4" />
            搜索课件、试题、学生
          </div>
          <button className="btn-ghost h-9"><HelpCircle className="h-4 w-4" /> 使用帮助</button>
          <button className="btn-ghost h-9"><FileText className="h-4 w-4" /> 生成记录</button>
        </div>
      </div>

      <div className="grid grid-cols-[390px_minmax(620px,1fr)_360px] gap-4">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              来源选择
              <HelpCircle className="h-4 w-4 text-slate-400" />
            </div>
          </div>
          <div className="mb-4 text-sm text-slate-600">已选择 4 项（可多选）</div>

          <div className="space-y-3">
            {sourceMaterials.map((item) => (
              <SourceCard key={item.title} item={item} />
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <div className="mb-3 font-semibold text-slate-900">作业信息</div>
            <InfoLine label="作业名称：" value="8.2 一元一次不等式（第1课时）" />
            <InfoLine label="布置班级：" value="初二（3）班" />
            <InfoLine label="提交人数：" value="45/45" />
            <InfoLine label="批阅时间：" value="2026-05-15 10:30" />
          </div>
        </aside>

        <main className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-900">生成的讲评提纲（预览）</div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="h-4 w-4 text-brand-500" />
              内容由 AI 生成，仅供参考
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-7 py-4">
            <h1 className="mb-4 text-center text-[26px] font-bold text-brand-700">一元一次不等式讲评提纲</h1>
            <div className="space-y-0">
              {outlineSections.map((section) => (
                <OutlineSection key={section.no} section={section} />
              ))}
            </div>
            <div className="mt-2 text-right text-sm text-slate-500">1 / 5</div>
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-5 py-2">
            <div className="flex items-center gap-3">
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="grid flex-1 grid-cols-5 gap-4">
                {previewPages.map((page, index) => (
                  <div key={page} className="text-center">
                    <div className={`mx-auto mb-2 aspect-[4/3] w-full max-w-[112px] rounded-lg border bg-white p-2 ${index === 0 ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'}`}>
                      <div className="mb-1 h-2 w-12 rounded bg-brand-100" />
                      <div className="space-y-1">
                        <div className="h-1.5 rounded bg-slate-100" />
                        <div className="h-1.5 rounded bg-slate-100" />
                        <div className="h-1.5 w-2/3 rounded bg-slate-100" />
                      </div>
                    </div>
                    <span className="text-sm text-slate-700">{page}</span>
                  </div>
                ))}
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 text-lg font-semibold text-slate-900">生成设置</div>
            <SelectLine label="讲评时长" value="20 分钟" />
            <div className="mt-4">
              <div className="mb-2 text-sm text-slate-700">难度侧重</div>
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-slate-200 text-sm">
                <button className="bg-brand-50 py-2 font-medium text-brand-600">基础为主</button>
                <button className="border-l border-slate-200 py-2 text-slate-500">均衡</button>
                <button className="border-l border-slate-200 py-2 text-slate-500">提升为主</button>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 text-sm text-slate-700">分层讲评（按学生水平）</div>
              <CheckLine label="A 层（学优）" />
              <CheckLine label="B 层（中等）" />
              <CheckLine label="C 层（待提升）" />
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <SwitchLine label="是否生成变式题" />
              <SwitchLine label="是否加入校本资源" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-lg font-semibold text-slate-900">AI 质量检查</div>
            <CheckLine label="覆盖知识点完整" hint />
            <CheckLine label="引用学生案例（已隐去姓名）" hint />
            <CheckLine label="隐去学生姓名与班级信息" hint />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <button className="btn-primary h-12 w-full text-base">
              <Sparkles className="h-5 w-5" /> 一键生成讲评提纲
            </button>
            <button className="mt-3 h-10 w-full rounded-xl border border-slate-200 bg-white text-slate-700">
              <RefreshCw className="mr-2 inline h-4 w-4" /> 重新生成
            </button>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="h-20 rounded-xl border border-slate-200 bg-white text-brand-600">
                <Upload className="mx-auto mb-2 h-6 w-6" />
                导出课件
              </button>
              <button className="h-20 rounded-xl border border-slate-200 bg-white text-brand-600">
                <Folder className="mx-auto mb-2 h-6 w-6" />
                保存到校本资源
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SourceCard({ item }) {
  return (
    <div className="grid grid-cols-[28px_100px_1fr] gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="pt-1">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-600 text-white">
          <Check className="h-4 w-4" />
        </span>
      </div>
      <div className="h-[72px] rounded-lg border border-slate-200 bg-slate-50 p-2">
        <SourceThumb type={item.thumb} />
      </div>
      <div className="min-w-0 py-1">
        <div className="font-semibold text-slate-900">{item.title}</div>
        <div className="mt-1 text-sm leading-5 text-slate-600">{item.desc}</div>
        <div className="mt-1 text-sm text-slate-600">{item.meta}</div>
      </div>
    </div>
  )
}

function SourceThumb({ type }) {
  if (type === 'chart') {
    return (
      <div className="flex h-full items-end justify-center gap-2">
        <span className="h-8 w-5 rounded bg-brand-500" />
        <span className="h-12 w-5 rounded bg-rose-400" />
        <span className="h-6 w-5 rounded bg-amber-400" />
      </div>
    )
  }
  if (type === 'answer') {
    return (
      <div className="space-y-2 text-[10px] text-slate-400">
        <div className="h-2 w-16 rounded bg-slate-200" />
        <div className="h-2 w-20 rounded bg-slate-200" />
        <div className="h-2 w-14 rounded bg-rose-200" />
        <div className="h-2 w-24 rounded bg-slate-200" />
      </div>
    )
  }
  if (type === 'list') {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm bg-brand-400" />
            <span className="h-2 flex-1 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <div className="h-2 w-16 rounded bg-slate-200" />
      <div className="h-2 w-20 rounded bg-slate-200" />
      <div className="h-2 w-12 rounded bg-slate-200" />
      <div className="mt-3 h-2 w-24 rounded bg-slate-200" />
    </div>
  )
}

function OutlineSection({ section }) {
  const Icon = section.icon
  return (
    <div className="grid grid-cols-[34px_1fr] gap-3 border-b border-dashed border-slate-200 py-2.5 last:border-b-0">
      <div className="flex h-7 w-7 items-center justify-center rounded-full text-brand-600">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="mb-1.5 text-base font-bold text-brand-700">{section.no}、{section.title}</div>
        <ul className="space-y-1 text-sm leading-5 text-slate-800">
          {section.lines.map((line) => (
            <li key={line} className={section.lines.length > 1 ? 'list-decimal ml-5' : ''}>
              {section.lines.length > 1 ? `${line}` : line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function InfoLine({ label, value }) {
  return (
    <div className="mb-2 flex text-sm last:mb-0">
      <span className="w-20 text-slate-500">{label}</span>
      <span className="flex-1 text-slate-800">{value}</span>
    </div>
  )
}

function SelectLine({ label, value }) {
  return (
    <label className="grid grid-cols-[82px_1fr] items-center gap-3 text-sm">
      <span className="text-slate-700">{label}</span>
      <button className="flex h-10 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-slate-700">
        {value}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
    </label>
  )
}

function CheckLine({ label, hint }) {
  return (
    <label className="mb-2.5 flex items-center gap-2 text-sm text-slate-700 last:mb-0">
      <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-600 text-white">
        <Check className="h-3.5 w-3.5" />
      </span>
      <span>{label}</span>
      {hint && <HelpCircle className="h-3.5 w-3.5 text-slate-400" />}
    </label>
  )
}

function SwitchLine({ label }) {
  return (
    <div className="mb-3 flex items-center justify-between text-sm text-slate-700 last:mb-0">
      <span>{label}</span>
      <span className="relative h-7 w-12 rounded-full bg-brand-600">
        <span className="absolute right-1 top-1 h-5 w-5 rounded-full bg-white" />
      </span>
    </div>
  )
}
