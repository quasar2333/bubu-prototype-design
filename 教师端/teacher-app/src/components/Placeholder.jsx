import { Construction } from 'lucide-react'

export default function Placeholder({ title }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center h-full text-slate-400">
      <Construction className="w-16 h-16 mb-4 text-slate-300" />
      <h2 className="text-xl font-medium text-slate-500">{title}</h2>
      <p className="text-sm mt-2">该页面正在搭建中…</p>
    </div>
  )
}
