import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  FileEdit,
  FilePlus,
  ListTodo,
  MonitorUp,
  Send,
  TrendingDown,
  Upload,
  UserX,
} from 'lucide-react'

const todayCourse = {
  className: '初二(3)班',
  subject: '数学',
  period: '第2节',
  time: '10:10-10:55',
  title: '8.2 一元一次不等式（第1课时）',
}

const recentCourseware = [
  ['8.2 一元一次不等式（第1课时）', '数学 · 初二下册', '03-27'],
  ['7.3 平面直角坐标系', '数学 · 初二下册', '03-26'],
  ['7.2 一次函数的图像', '数学 · 初二下册', '03-25'],
]

export default function Home() {
  return (
    <div className="p-6 bg-[#f5f8fc] min-h-full space-y-6">
      <section className="grid grid-cols-3 gap-6">
        <QuickAction
          to="/editor"
          variant="blue"
          icon={<FilePlus className="w-8 h-8" />}
          title="新建课件"
          desc="创建空白课件或使用模板"
        />
        <QuickAction
          to="/courseware/import"
          variant="white"
          icon={<Upload className="w-8 h-8" />}
          title="导入课件"
          desc="从本地或资源库导入课件"
        />
        <QuickAction
          to="/homework"
          variant="green"
          icon={<Send className="w-8 h-8" />}
          title="发布作业"
          desc="布置课后作业或课堂练习"
        />
      </section>

      <section className="grid grid-cols-2 gap-6">
        <CardHeaderBox title="今日课程" icon={<Calendar className="w-5 h-5 text-brand-600" />} action="查看课表">
          <div className="flex items-center gap-5 text-base font-semibold text-slate-800 mb-5">
            <span>{todayCourse.className}</span>
            <span>{todayCourse.subject}</span>
            <span className="pill bg-brand-50 text-brand-600">{todayCourse.period}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex items-center gap-5 pb-5 border-b border-slate-200">
              <span className="text-2xl font-semibold text-slate-900">{todayCourse.time}</span>
              <span className="text-xl font-bold text-slate-900">{todayCourse.title}</span>
            </div>
            <div className="grid grid-cols-2 gap-5 mt-5">
              <Link to="/editor" className="btn-ghost h-12 text-brand-600 border-brand-200">
                <BookOpen className="w-5 h-5" /> 进入备课
              </Link>
              <button className="btn-primary h-12">
                <MonitorUp className="w-5 h-5" /> 发送到白板
              </button>
            </div>
          </div>
        </CardHeaderBox>

        <CardHeaderBox title="待办事项" icon={<ListTodo className="w-5 h-5 text-brand-600" />} action="全部待办">
          <TodoRow
            icon={<ClipboardCheck className="w-6 h-6 text-orange-500" />}
            iconBg="bg-orange-50"
            title="待批作业"
            sub="2个班级 · 32份作业待批"
            value="32"
            unit="份"
            valueColor="text-red-500"
          />
          <TodoRow
            icon={<FileEdit className="w-6 h-6 text-brand-500" />}
            iconBg="bg-blue-50"
            title="待发布作业"
            sub="1个作业草稿待发布"
          />
          <TodoRow
            icon={<ClipboardCheck className="w-6 h-6 text-emerald-500" />}
            iconBg="bg-emerald-50"
            title="未开始互动"
            sub="1个课堂互动未开始"
            last
          />
        </CardHeaderBox>
      </section>

      <section className="grid grid-cols-2 gap-6">
        <CardHeaderBox title="最近课件" icon={<BookOpen className="w-5 h-5 text-brand-600" />} action="全部课件">
          <div className="space-y-2">
            {recentCourseware.map(([title, desc, date], index) => (
              <div key={title} className="grid grid-cols-[112px_minmax(0,1fr)_56px] gap-4 items-center py-2 border-b border-slate-100 last:border-b-0">
                <div className="h-14 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 overflow-hidden relative">
                  <div className="absolute inset-x-3 top-2 h-3 bg-brand-600 rounded-sm" />
                  <div className="absolute left-3 right-3 top-7 h-1.5 bg-slate-300 rounded" />
                  <div className="absolute left-3 right-8 top-10 h-1.5 bg-slate-300 rounded" />
                  <span className="absolute right-2 bottom-1 text-[10px] text-slate-400">PPT</span>
                </div>
                <div className="min-w-0">
                  <div className="text-base font-medium text-slate-900 truncate">{title}</div>
                  <div className="text-sm text-slate-500 mt-1">{desc}</div>
                </div>
                <span className="text-sm text-slate-500">{date}</span>
              </div>
            ))}
          </div>
          <Link to="/courseware" className="inline-flex items-center gap-1 mt-4 text-brand-600 text-sm font-semibold">
            查看全部课件 <ChevronRight className="w-4 h-4" />
          </Link>
        </CardHeaderBox>

        <CardHeaderBox title="学情提醒" icon={<BarChart3 className="w-5 h-5 text-brand-600" />} action="查看学情详情">
          <TodoRow
            icon={<TrendingDown className="w-6 h-6 text-violet-500" />}
            iconBg="bg-violet-50"
            title="本周薄弱知识点"
            sub="一元一次不等式 · 概念掌握薄弱"
            value="6.3%"
            unit="↓"
            valueColor="text-orange-500"
          />
          <TodoRow
            icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
            iconBg="bg-red-50"
            title="高错题"
            sub="2道题目错误率超过 60%"
            value="2"
            unit="题"
            valueColor="text-red-500"
          />
          <TodoRow
            icon={<UserX className="w-6 h-6 text-orange-500" />}
            iconBg="bg-orange-50"
            title="未提交学生"
            sub="15 名学生未按时提交作业"
            value="15"
            unit="人"
            valueColor="text-red-500"
            last
          />
        </CardHeaderBox>
      </section>
    </div>
  )
}

function QuickAction({ to, variant, icon, title, desc }) {
  const styles = {
    blue: 'bg-brand-600 text-white shadow-lg shadow-brand-500/20',
    green: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    white: 'bg-white text-slate-900 border border-slate-200 shadow-sm',
  }
  const iconStyles = {
    blue: 'bg-white/20 text-white',
    green: 'bg-white/20 text-white',
    white: 'bg-blue-50 text-brand-600',
  }

  return (
    <Link to={to} className={`h-28 rounded-xl p-6 flex items-center justify-center gap-5 transition hover:-translate-y-0.5 ${styles[variant]}`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconStyles[variant]}`}>{icon}</div>
      <div>
        <div className="text-xl font-bold">{title}</div>
        <div className={`text-sm mt-1 ${variant === 'white' ? 'text-slate-500' : 'text-white/85'}`}>{desc}</div>
      </div>
    </Link>
  )
}

function CardHeaderBox({ title, icon, action, children }) {
  return (
    <section className="card p-7">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3 text-xl font-bold text-slate-900">
          {icon}
          {title}
        </div>
        <button className="text-sm text-brand-600 font-medium flex items-center gap-1">
          {action} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {children}
    </section>
  )
}

function TodoRow({ icon, iconBg, title, sub, value, unit, valueColor = 'text-slate-900', last }) {
  return (
    <div className={`flex items-center gap-5 py-4 ${last ? '' : 'border-b border-slate-100'}`}>
      <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500 mt-1">{sub}</div>
      </div>
      {value && (
        <div className={`text-xl font-bold ${valueColor}`}>
          {value} <span className="text-sm font-medium">{unit}</span>
        </div>
      )}
      <ChevronRight className="w-5 h-5 text-slate-400" />
    </div>
  )
}
