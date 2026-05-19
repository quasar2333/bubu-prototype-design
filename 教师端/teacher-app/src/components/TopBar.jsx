import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Search, HelpCircle } from 'lucide-react'

const titleMap = {
  '/home': { code: 'T01', name: '教师工作台首页' },
  '/courseware': { code: 'T02', name: '课件列表' },
  '/courseware/import': { code: 'T03', name: '课件导入' },
  '/dictation': { code: 'T06', name: '听写配置' },
  '/quiz': { code: 'T07', name: '随堂练配置' },
  '/homework': { code: 'T09', name: '作业布置' },
  '/homework/layered': { code: 'T10', name: '分层发布确认' },
  '/question-bank': { code: 'T11', name: '智能题库' },
  '/review': { code: 'T12', name: '作业批阅' },
  '/error-analysis': { code: 'T13', name: '错因分析' },
  '/lecture-gen': { code: 'T14', name: '讲评材料生成' },
  '/analytics': { code: 'T15', name: '学情看板' },
  '/school-resource': { code: 'T16', name: '校本资源' }
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const info = titleMap[location.pathname] || { code: '', name: '' }

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 shrink-0 relative">
      <div className="flex items-center gap-2">
        <div className="text-[15px] font-semibold text-slate-800">
          <span className="text-brand-500 mr-2">{info.code}</span>
          {info.name}
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[420px] px-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full h-9 pl-9 pr-3 rounded-full border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 outline-none focus:bg-white focus:border-brand-400"
            placeholder="搜索课件、试题、学生"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button className="text-slate-500 hover:text-brand-600 text-sm flex items-center gap-1">
          <HelpCircle className="w-4 h-4" /> 使用帮助
        </button>
        <button className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">12</span>
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-white text-sm font-semibold">
            张
          </div>
          <span className="text-sm text-slate-700">张老师</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  )
}
