import { Check } from 'lucide-react'

// 作业流程步骤指示器：选题 → 排版 → 发布/保存
export default function StepBar({ current = 1, steps = ['选题', '排版', '发布/保存'] }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold transition ${
                  active
                    ? 'bg-brand-600 text-white'
                    : done
                    ? 'bg-brand-100 text-brand-600'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : n}
              </span>
              <span
                className={`text-sm ${
                  active ? 'text-slate-800 font-medium' : done ? 'text-brand-600' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={`w-10 h-px ${done ? 'bg-brand-300' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
