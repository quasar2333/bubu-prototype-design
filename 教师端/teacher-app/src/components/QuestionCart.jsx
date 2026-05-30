import { useEffect, useState } from 'react'
import { ClipboardList, X, Trash2, GripVertical, CheckSquare, Square } from 'lucide-react'

const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

// 可展开的试题栏「悬浮球 + 抽屉」
// groups: [{ type, items: [{ id, no, stem, lines, score }] }]
export default function QuestionCart({
  open,
  onOpenChange,
  groups = [],
  onRemove,        // (ids: number[]) => void
  onClear,         // () => void
  summary,         // 可选：顶部摘要节点（题型分布 / 预计时长等）
  footer,          // 可选：底部主操作（去排版 / 组卷等）
  title = '试题栏'
}) {
  const allItems = groups.flatMap(g => g.items)
  const count = allItems.length
  const availableKey = allItems.map(item => item.id).join('|')
  const [checked, setChecked] = useState(() => new Set())

  useEffect(() => {
    const available = new Set(allItems.map(item => item.id))
    setChecked(prev => {
      const next = new Set([...prev].filter(id => available.has(id)))
      if (next.size === prev.size && [...next].every(id => prev.has(id))) return prev
      return next
    })
  }, [availableKey])

  const toggle = (id) =>
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const allChecked = count > 0 && allItems.every(i => checked.has(i.id))
  const toggleAll = () =>
    setChecked(allChecked ? new Set() : new Set(allItems.map(i => i.id)))
  const removeChecked = () => {
    if (checked.size === 0) return
    onRemove?.([...checked])
    setChecked(new Set())
  }

  return (
    <>
      {/* 悬浮球（收起态） */}
      {!open && (
        <button
          onClick={() => onOpenChange(true)}
          className="fixed right-6 bottom-8 z-40 group flex items-center gap-2 pl-3.5 pr-4 h-12 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 transition"
        >
          <span className="relative">
            <ClipboardList className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[11px] font-semibold flex items-center justify-center border-2 border-white">
              {count}
            </span>
          </span>
          <span className="text-sm font-medium">{title}</span>
        </button>
      )}

      {/* 抽屉（展开态） */}
      {open && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 z-40" onClick={() => onOpenChange(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[440px] max-w-[90vw] bg-white z-50 shadow-2xl flex flex-col animate-[slideIn_.2s_ease-out]">
            {/* 头部 */}
            <div className="h-14 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-brand-600" />
                <span className="font-semibold text-slate-800">{title}</span>
                <span className="text-sm text-slate-400">共 {count} 题</span>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 题型分布 chips */}
            {count > 0 && (
              <div className="px-5 pt-3 flex flex-wrap gap-2 shrink-0">
                {groups.map(g => (
                  <span
                    key={g.type}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs"
                  >
                    {g.type} {g.items.length} 题
                    <button
                      onClick={() => onRemove?.(g.items.map(i => i.id))}
                      className="w-4 h-4 rounded-full hover:bg-brand-100 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {summary && <div className="px-5 pt-3 shrink-0">{summary}</div>}

            {/* 题目列表（按题型分组） */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {count === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16">
                  <ClipboardList className="w-10 h-10 mb-3 text-slate-300" />
                  <div className="text-sm">试题栏还是空的</div>
                  <div className="text-xs mt-1">在左侧勾选「加入试题栏」开始组题</div>
                </div>
              )}
              {groups.map((g, gi) => (
                <div key={g.type}>
                  <div className="text-sm font-semibold text-slate-700 mb-2">
                    {CN_NUM[gi] || gi + 1}、{g.type}
                  </div>
                  <div className="space-y-2">
                    {g.items.map((q, qi) => (
                      <div
                        key={q.id}
                        className="group flex gap-2 rounded-lg border border-slate-100 hover:border-brand-200 p-2.5"
                      >
                        <button onClick={() => toggle(q.id)} className="mt-0.5 text-brand-600 shrink-0">
                          {checked.has(q.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                        </button>
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0 cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-slate-700 leading-snug">
                            <span className="font-medium text-slate-500 mr-1">{qi + 1}.</span>
                            {q.stem}
                          </div>
                          {q.lines?.map((l, i) => (
                            <div key={i} className="text-xs text-slate-500 mt-1 font-mono whitespace-pre-wrap">{l}</div>
                          ))}
                        </div>
                        <button
                          onClick={() => onRemove?.([q.id])}
                          className="shrink-0 w-6 h-6 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 底部操作 */}
            <div className="border-t border-slate-100 shrink-0">
              <div className="px-5 py-2.5 flex items-center gap-3 text-sm">
                <button onClick={toggleAll} className="flex items-center gap-1.5 text-slate-500 hover:text-brand-600">
                  {allChecked ? <CheckSquare className="w-4 h-4 text-brand-600" /> : <Square className="w-4 h-4" />}
                  全选
                </button>
                <span className="text-slate-400 text-xs">已选 {checked.size} 题</span>
                <div className="ml-auto flex items-center gap-3 text-slate-500">
                  <button onClick={removeChecked} disabled={checked.size === 0} className="flex items-center gap-1 hover:text-rose-500 disabled:opacity-40">
                    <Trash2 className="w-3.5 h-3.5" /> 删除
                  </button>
                  <button onClick={onClear} disabled={count === 0} className="hover:text-rose-500 disabled:opacity-40">清空</button>
                </div>
              </div>
              {footer && <div className="px-5 pb-4">{footer}</div>}
            </div>
          </div>
        </>
      )}
    </>
  )
}
