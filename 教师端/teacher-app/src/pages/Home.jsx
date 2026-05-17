import { Link } from 'react-router-dom'
import {
  FilePlus, Upload, Send, Calendar, ListTodo, ChevronRight,
  ClipboardCheck, FileEdit, AlertCircle, BookOpen, BarChart3,
  AlertTriangle, UserX, TrendingDown
} from 'lucide-react'

export default function Home() {
  return (
    <div className="p-6 space-y-6">
      {/* 三个快捷入口卡片 */}
      <div className="grid grid-cols-3 gap-5">
        <Link
          to="/courseware"
          className="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white p-6 flex items-center gap-4 shadow-soft hover:shadow-lg transition"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-semibold">新建课件</div>
            <div className="text-sm text-white/85 mt-0.5">创建空白课件或使用模板</div>
          </div>
        </Link>

        <Link
          to="/courseware/import"
          className="rounded-2xl bg-white border border-slate-100 p-6 flex items-center gap-4 shadow-card hover:shadow-soft transition"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Upload className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-800">导入课件</div>
            <div className="text-sm text-slate-500 mt-0.5">从本地或资源库导入课件</div>
          </div>
        </Link>

        <Link
          to="/homework"
          className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 flex items-center gap-4 shadow-soft hover:shadow-lg transition"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-semibold">发布作业</div>
            <div className="text-sm text-white/85 mt-0.5">布置课后作业或课堂练习</div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* 今日课程 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Calendar className="w-[18px] h-[18px] text-brand-600" /> 今日课程
            </div>
            <Link to="/courseware" className="text-xs text-brand-600 hover:underline">查看课表</Link>
          </div>

          <div className="flex items-center gap-2 mb-3 text-sm">
            <span className="text-slate-600">初二(3)班</span>
            <span className="text-slate-600">数学</span>
            <span className="pill bg-brand-50 text-brand-600">第2节</span>
          </div>

          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-base font-medium text-slate-800">10:10 - 10:55</span>
              <span className="text-slate-600">8.2 一元一次不等式（第1课时）</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-ghost">
                <BookOpen className="w-4 h-4" /> 进入备课
              </button>
              <Link to="/editor" className="btn-primary">
                <Send className="w-4 h-4" /> 发送到白板
              </Link>
            </div>
          </div>
        </div>

        {/* 待办事项 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <ListTodo className="w-[18px] h-[18px] text-brand-600" /> 待办事项
            </div>
            <a className="text-xs text-brand-600 hover:underline cursor-pointer">全部待办 ›</a>
          </div>

          <TodoRow
            icon={<ClipboardCheck className="w-5 h-5 text-orange-500" />}
            title="待批作业"
            sub="2个班级 · 32份作业待批"
            value="32 份"
            color="text-orange-600"
          />
          <TodoRow
            icon={<FileEdit className="w-5 h-5 text-brand-500" />}
            title="待发布作业"
            sub="1个作业草稿待发布"
            value=""
          />
          <TodoRow
            icon={<AlertCircle className="w-5 h-5 text-emerald-500" />}
            title="未开始互动"
            sub="1个课堂互动未开始"
            value=""
            last
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* 最近课件 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <BookOpen className="w-[18px] h-[18px] text-brand-600" /> 最近课件
            </div>
            <Link to="/courseware" className="text-xs text-brand-600 hover:underline">全部课件 ›</Link>
          </div>
          {[
            ['8.2 一元一次不等式（第1课时）', '数学 · 初二下册', '03-27'],
            ['7.3 平面直角坐标系', '数学 · 初二下册', '03-26'],
            ['7.2 一次函数的图像', '数学 · 初二下册', '03-25']
          ].map(([t, s, d], i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-t border-slate-50 first:border-t-0">
              <div className="w-12 h-9 rounded bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] text-white">
                PPT
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-800 truncate">{t}</div>
                <div className="text-xs text-slate-400">{s}</div>
              </div>
              <span className="text-xs text-slate-400">{d}</span>
            </div>
          ))}
          <Link to="/courseware" className="text-xs text-brand-600 hover:underline mt-3 inline-block">查看全部课件 ›</Link>
        </div>

        {/* 学情提醒 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <BarChart3 className="w-[18px] h-[18px] text-brand-600" /> 学情提醒
            </div>
            <Link to="/analytics" className="text-xs text-brand-600 hover:underline">查看学情详情 ›</Link>
          </div>
          <TodoRow
            icon={<TrendingDown className="w-5 h-5 text-red-500" />}
            title="本周薄弱知识点"
            sub="一元一次不等式、概念掌握薄弱"
            value="6.3% ↓"
            color="text-red-500"
          />
          <TodoRow
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
            title="高错题"
            sub="2道题目错误率超过60%"
            value="2 题"
          />
          <TodoRow
            icon={<UserX className="w-5 h-5 text-slate-400" />}
            title="未提交学生"
            sub="15 名学生未按时提交作业"
            value="15 人"
            last
          />
        </div>
      </div>
    </div>
  )
}

function TodoRow({ icon, title, sub, value, color = 'text-slate-700', last }) {
  return (
    <div className={'flex items-center gap-3 py-3 ' + (last ? '' : 'border-b border-slate-50')}>
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800">{title}</div>
        <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
      </div>
      {value && <span className={`text-sm font-semibold ${color}`}>{value}</span>}
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  )
}
