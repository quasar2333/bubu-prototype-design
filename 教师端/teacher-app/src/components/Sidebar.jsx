import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, BookOpen, Layers, ClipboardList, Database,
  CheckSquare, BarChart3, Archive, Settings, ChevronLeft, BookMarked,
  ChevronDown, ChevronRight, Grid3x3, Filter, Network
} from 'lucide-react'

const items = [
  { to: '/home', icon: Home, label: '首页' },
  { to: '/courseware', icon: BookOpen, label: '我的课件' },
  { to: '/quiz', icon: Layers, label: '课堂互动设计' },
  { to: '/homework', icon: ClipboardList, label: '作业' },
  // B1 智能题库独立入口：按 Plan_2 决定暂不作为独立页面（作业流程内 H3 照做）。保留注释以便甲方反馈后恢复。
  // { to: '/question-bank', icon: Database, label: '智能题库' },
  { to: '/review', icon: CheckSquare, label: '作业批阅' },
  { to: '/analytics', icon: BarChart3, label: '学情查看' },
  { to: '/knowledge-graph', icon: Network, label: '知识图谱' }
  // B7 校本资源：按 Plan_2 决定当前不做。保留注释以便后续恢复。
  // { to: '/school-resource', icon: Archive, label: '校本资源' }
]

const allPages = [
  { code: 'T01', to: '/home', label: '教师工作台首页' },
  { code: 'T02', to: '/courseware', label: '我的课件' },
  { code: 'T03', to: '/courseware/import', label: '课件导入' },
  { code: 'T04', to: '/editor', label: '课件编辑器（全屏）' },
  // A1 听/默写：MVP 正式主路径不出现。保留旧原型索引注释，便于回溯。
  // { code: 'T06', to: '/dictation', label: '听写配置' },
  { code: 'T07', to: '/quiz', label: '随堂练配置' },
  { code: 'T08', to: '/static-interactive', label: '静态题互动化（全屏）' },
  { code: 'T09', to: '/homework', label: '作业布置' },
  { code: 'T10', to: '/homework/layered', label: '分层发布确认' },
  { code: 'T11', to: '/question-bank', label: '智能题库' },
  { code: 'T12', to: '/review', label: '作业批阅' },
  { code: 'T13', to: '/error-analysis', label: '错因分析' },
  { code: 'T14', to: '/lecture-gen', label: '讲评材料生成' },
  { code: 'T15', to: '/analytics', label: '学情看板' },
  { code: 'T16', to: '/school-resource', label: '校本资源' },
  { code: 'X1', to: '/knowledge-graph', label: '知识图谱（开发中）' }
]

export default function Sidebar() {
  const location = useLocation()
  const [allOpen, setAllOpen] = useState(false)
  // 互动设计相关页面也高亮课堂互动设计
  const isInteractionActive =
    location.pathname.startsWith('/quiz') ||
    location.pathname.startsWith('/dictation')

  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-slate-100 flex flex-col">
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white">
          <BookMarked className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[15px] font-semibold text-slate-800">智慧课堂</div>
          <div className="text-[11px] text-slate-400 -mt-0.5">教师端</div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => {
              const forceActive = label === '课堂互动设计' && isInteractionActive
              return [
                'menu-item',
                (isActive || forceActive) ? 'menu-item-active' : ''
              ].join(' ')
            }}
          >
            <Icon className="w-[18px] h-[18px]" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 原型预览索引 */}
      <div className="border-t border-slate-100 px-3 py-2">
        <button
          onClick={() => setAllOpen(o => !o)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
        >
          <Grid3x3 className="w-[18px] h-[18px]" />
          <span className="flex-1 text-left">全部原型 (16)</span>
          {allOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>
        {allOpen && (
          <div className="mt-1 max-h-[280px] overflow-y-auto space-y-0.5">
            {allPages.map(p => (
              <NavLink
                key={p.code}
                to={p.to}
                className={({ isActive }) => [
                  'flex items-center gap-2 px-3 py-1.5 rounded text-xs',
                  isActive ? 'bg-brand-50 text-brand-600 font-medium' : 'text-slate-500 hover:bg-slate-50'
                ].join(' ')}
              >
                <span className="font-mono text-[10px] text-slate-400 w-7 flex-shrink-0">{p.code}</span>
                <span className="truncate">{p.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 py-3 px-3">
        <div className="menu-item">
          <Settings className="w-[18px] h-[18px]" />
          <span>设置中心</span>
        </div>
      </div>

      <div className="h-10 border-t border-slate-100 px-4 flex items-center gap-2 text-xs text-slate-500">
        <span className="flex-1">控制台日志</span>
        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">0</span>
        <Filter className="w-3.5 h-3.5 text-slate-400" />
      </div>
    </aside>
  )
}
