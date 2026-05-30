import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Info, LayoutTemplate } from 'lucide-react'

export default function HomeworkLayoutPending() {
  const navigate = useNavigate()

  return (
    <div className="h-full bg-[#f5f8fc] p-6">
      <div className="h-full card p-8 flex flex-col">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Link to="/homework" className="hover:text-brand-600">作业</Link>
          <span>/</span>
          <Link to="/homework/select" className="hover:text-brand-600">选题</Link>
          <span>/</span>
          <span className="text-slate-700">排版页暂缓</span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-10 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
              <LayoutTemplate className="w-8 h-8" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-slate-900">排版页暂缓实现</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              当前已完成作业首页、智能题库、作业选题和试题栏展开态。组卷排版页需要补充学科网排版交互截图后再按 Stage 4 单独实现。
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 text-left">
              <StatusCard title="已选题" value="可保留" />
              <StatusCard title="下一阶段" value="Stage 4" />
              <StatusCard title="当前状态" value="安全暂缓" />
            </div>

            <div className="mt-8 rounded-xl bg-white/80 border border-blue-100 p-4 flex items-start gap-3 text-left">
              <Info className="w-5 h-5 text-brand-600 mt-0.5" />
              <div className="text-sm text-slate-600 leading-6">
                这不是 Stage 4 完成页，只是防止「去排版」按钮跳转白屏。正式排版页仍以 `Plan/Plan_2/H4_排版页.png` 和后续补充截图为准。
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button onClick={() => navigate('/homework/select')} className="btn-ghost">
                <ArrowLeft className="w-4 h-4" /> 返回选题
              </button>
              <button onClick={() => navigate('/homework')} className="btn-primary">
                <FileText className="w-4 h-4" /> 回作业首页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusCard({ title, value }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-2 text-base font-semibold text-slate-900">{value}</div>
    </div>
  )
}
