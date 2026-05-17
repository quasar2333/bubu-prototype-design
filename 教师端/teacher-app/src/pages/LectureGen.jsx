import { Link } from 'react-router-dom'
import {
  ChevronRight, Sparkles, RefreshCw, Save, Download, Send, Plus, Search,
  FileText, Layers, AlertCircle, BookOpen, ChevronDown, Edit3
} from 'lucide-react'

const sections = [
  { idx: '1', title: '错因分析概述', sub: '基于错因聚类的教学要点', active: true },
  { idx: '2', title: '典型错答展示', sub: '4 道典型错题、含解析' },
  { idx: '3', title: '专项讲解', sub: '不等式两边乘除负数' },
  { idx: '4', title: '巩固练习', sub: '10 道分层练习' },
  { idx: '5', title: '课后小结', sub: '关键概念回顾' }
]

const slides = [
  { n: 1, title: '错因分析概述' },
  { n: 2, title: '典型错答 (1)' },
  { n: 3, title: '典型错答 (2)' },
  { n: 4, title: '专项讲解' },
  { n: 5, title: '巩固练习' },
  { n: 6, title: '课后小结' }
]

const errorPills = [
  { name: '概念混淆', n: 23, color: 'rose' },
  { name: '计算错误', n: 18, color: 'amber' },
  { name: '解集表示错误', n: 15, color: 'amber' },
  { name: '移项方向错误', n: 9, color: 'sky' },
  { name: '审题遗漏', n: 7, color: 'slate' }
]

export default function LectureGen() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link to="/error-analysis" className="hover:text-brand-600">错因分析</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700">讲评材料生成</span>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost h-8"><Save className="w-3 h-3" /> 保存草稿</button>
          <button className="btn-ghost h-8"><Download className="w-3 h-3" /> 导出 PPTX</button>
          <button className="btn-primary h-8"><Send className="w-3 h-3" /> 发送至课堂</button>
        </div>
      </div>

      <div className="grid grid-cols-[260px_1fr_320px] gap-4">
        {/* 左侧 大纲 */}
        <div className="card p-3 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800">大纲结构</span>
            <button className="btn-ghost h-7 text-xs"><RefreshCw className="w-3 h-3" /> 重新生成</button>
          </div>
          <div className="space-y-2">
            {sections.map(s => (
              <div key={s.idx} className={`p-2 rounded-md cursor-pointer flex items-start gap-2 ${s.active ? 'bg-brand-50 border border-brand-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                <span className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-bold ${s.active ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{s.idx}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${s.active ? 'text-brand-700 font-medium' : 'text-slate-700'}`}>{s.title}</div>
                  <div className="text-[10px] text-slate-400">{s.sub}</div>
                </div>
                {s.active && <Edit3 className="w-3 h-3 text-brand-500 mt-1" />}
              </div>
            ))}
          </div>
          <button className="mt-3 h-9 border border-dashed border-brand-300 text-brand-600 rounded text-sm flex items-center justify-center gap-1 hover:bg-brand-50">
            <Plus className="w-3.5 h-3.5" /> 添加章节
          </button>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="text-xs text-slate-500 mb-2">数据源 (4)</div>
            <SourceTag icon="📊" label="错因分析报告" sub="·数据·" />
            <SourceTag icon="📋" label="本次作业题目" sub="·题库·" />
            <SourceTag icon="📚" label="校本资源 - 不等式" sub="·课件·" />
            <SourceTag icon="📝" label="教研组共享 - 讲解" sub="·素材·" />
          </div>
        </div>

        {/* 中间 编辑器 */}
        <div className="card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="font-semibold text-slate-800">第 1 节：错因分析概述</span>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button className="hover:text-brand-600">B</button>
              <button className="hover:text-brand-600 italic">I</button>
              <button className="hover:text-brand-600 underline">U</button>
              <button className="hover:text-brand-600">∑</button>
              <button className="hover:text-brand-600">🖼</button>
              <button className="hover:text-brand-600">≡</button>
              <button className="hover:text-brand-600">↺</button>
              <button className="hover:text-brand-600">↻</button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg border border-slate-100 p-6 flex-1 overflow-y-auto">
            <div className="bg-white rounded-md shadow-soft p-6 max-w-[640px] mx-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-3">错因分析概述</h2>
              <p className="text-sm text-slate-700 mb-3">本次作业班级正确率为 <strong className="text-brand-600">62%</strong>，主要错因如下：</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {errorPills.map((p, i) => (
                  <span key={i} className={`pill ${p.color === 'rose' ? 'bg-rose-50 text-rose-600' : p.color === 'amber' ? 'bg-amber-50 text-amber-700' : p.color === 'sky' ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                    {p.name} ({p.n}人)
                  </span>
                ))}
              </div>

              <h3 className="text-base font-semibold text-slate-800 mt-4 mb-2">关键问题点</h3>
              <ol className="text-sm text-slate-700 space-y-1.5 list-decimal pl-5">
                <li>对不等式两边同时除以负数变号问题理解不到位 (51%)</li>
                <li>解集表示规范化不够 (33%)</li>
                <li>计算粗心，移项符号错误 (40%)</li>
              </ol>

              <h3 className="text-base font-semibold text-slate-800 mt-4 mb-2">本节讲评目标</h3>
              <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
                <li>明晰不等式两边变号原则</li>
                <li>规范解集表达方式</li>
                <li>培养计算检验习惯</li>
              </ul>

              <div className="mt-5 border-t border-slate-100 pt-3">
                <span className="pill bg-violet-50 text-violet-600">AI 建议</span>
                <span className="text-xs text-slate-500 ml-2">建议在此处插入数轴动画，帮助学生直观理解...</span>
              </div>
            </div>
          </div>

          {/* 缩略图 */}
          <div className="mt-3 grid grid-cols-6 gap-2">
            {slides.map(sl => (
              <div key={sl.n} className={`relative ${sl.n === 1 ? 'ring-2 ring-brand-500' : 'border border-slate-200'} rounded bg-white aspect-[16/9] flex items-center justify-center text-[10px] text-slate-400 overflow-hidden`}>
                <span className="absolute top-0.5 left-1 text-[9px] text-slate-400">{sl.n}</span>
                <span className="px-2 text-center">{sl.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧 配置 */}
        <div className="card p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <div className="text-sm font-semibold text-slate-800 mb-2">讲评内容设置</div>
            <Field label="模板" value="错因讲评（图文 + 重点突出）" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Field label="时长" value="20 分钟" mini />
              <Field label="语言" value="中文" mini />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800 mb-2">内容控制</div>
            <Toggle label="自动插入解题步骤" sub="提取标准解题步骤" on />
            <Toggle label="包含分层讲评" sub="按 A/B/C 层匹配讲评内容" on />
            <Toggle label="生成微课视频脚本" sub="可一键生成视频脚本" />
            <Toggle label="自动配套巩固练习" sub="生成 10 题课后练" on />
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800 mb-2 flex items-center justify-between">
              针对错因 <button className="text-xs text-brand-600 hover:underline flex items-center gap-1"><Search className="w-3 h-3" /> 关联错因卡</button>
            </div>
            <div className="space-y-1.5 text-xs">
              {errorPills.map((p, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 3} className="accent-brand-600" />
                  <span className="text-slate-700 flex-1">{p.name}</span>
                  <span className="text-slate-400">{p.n}人</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800 mb-2">教研协同</div>
            <Toggle label="共享至教研组" sub="教研组成员可查看与编辑" />
            <Toggle label="加入校本资源库" sub="加入学校共享资源库" />
          </div>

          <button className="btn-primary mt-auto"><Sparkles className="w-3.5 h-3.5" /> 重新生成讲评</button>
          <div className="text-xs text-emerald-600 text-center -mt-2">✓ 已保存</div>
        </div>
      </div>
    </div>
  )
}

function SourceTag({ icon, label, sub }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs">
      <span>{icon}</span>
      <span className="flex-1 text-slate-700">{label}</span>
      <span className="text-slate-400 text-[10px]">{sub}</span>
    </div>
  )
}

function Field({ label, value, mini }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <button className={`w-full ${mini ? 'h-8' : 'h-9'} px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 flex items-center justify-between`}>
        <span className="truncate">{value}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>
    </div>
  )
}

function Toggle({ label, sub, on }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <div className="flex-1">
        <div className="text-sm text-slate-700">{label}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
      </div>
      <div className={`relative w-9 h-5 rounded-full transition mt-0.5 ${on ? 'bg-brand-500' : 'bg-slate-300'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </div>
    </div>
  )
}

