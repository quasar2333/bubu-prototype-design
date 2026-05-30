import { NavLink } from 'react-router-dom'
import {
  Home, BookOpen, ClipboardList, Database,
  BarChart3, Archive, Settings, BookMarked
} from 'lucide-react'

const items = [
  { to: '/home', icon: Home, label: '首页' },
  { to: '/courseware', icon: BookOpen, label: '我的课件' },
  { to: '/homework', icon: ClipboardList, label: '作业' },
  { to: '/question-bank', icon: Database, label: '智能题库' },
  { to: '/analytics', icon: BarChart3, label: '学情查看' },
  { to: '/school-resource', icon: Archive, label: '校本资源' }
]

export default function Sidebar() {
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
            className={({ isActive }) => [
              'menu-item',
              isActive ? 'menu-item-active' : ''
            ].join(' ')}
          >
            <Icon className="w-[18px] h-[18px]" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 py-3 px-3">
        <div className="menu-item">
          <Settings className="w-[18px] h-[18px]" />
          <span>设置中心</span>
        </div>
      </div>
    </aside>
  )
}
