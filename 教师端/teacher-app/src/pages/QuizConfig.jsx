import { useState } from 'react'
import {
  ChevronRight, ChevronDown, Database, Upload, FileText, Bot, Edit3,
  Image as ImageIcon, X, Plus, Save, Send, Eye
} from 'lucide-react'

const layers = [
  { tag: 'A', color: 'red', name: '层（优）', diff: '困难', n: 25, qn: 10 },
  { tag: 'B', color: 'emerald', name: '层（中）', diff: '中等', n: 18, qn: 10 },
  { tag: 'C', color: 'amber', name: '层（待提升）', diff: '简单', n: 12, qn: 10 }
]
const layerColors = {
  red: 'bg-red-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500'
}

export default function QuizConfig() {
  const [source, setSource] = useState('题库')
  const [types, setTypes] = useState({ '单选题': true, '多选题': true, '判断题': false, '填空题': false, '手写题': false, '主观题': false })
  const [options, setOptions] = useState(['x ≥ 5', 'x ≥ 4', 'x < 5', 'x ≤ 5'])
  const [answer, setAnswer] = useState(0)
  const [layered, setLayered] = useState(true)
  const [collect, setCollect] = useState({ '实时回收进度': true, '典型答案展示（匿名）': true, '正确率统计': true, '课后进入作业池': true, '错误选项分布': true })
  const [feedback, setFeedback] = useState('结果 + 解析反馈')

  const toggleType = (k) => setTypes({ ...types, [k]: !types[k] })
  const toggleCollect = (k) => setCollect({ ...collect, [k]: !collect[k] })
  const updateOption = (i, v) => setOptions(options.map((o, idx) => idx === i ? v : o))
  const addOption = () => options.length < 8 && setOptions([...options, ''])
  const removeOption = (i) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, idx) => idx !== i))
    if (answer === i) setAnswer(0)
    else if (answer > i) setAnswer(answer - 1)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        课堂互动设计 <ChevronRight className="w-3 h-3" /> <span className="text-slate-700">随堂练配置</span>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4">
          {/* 基础信息 */}
          <Section title="基础信息">
            <div className="grid grid-cols-2 gap-3">
              <FormItem label="练习名称" required value="一元一次不等式（第1课时）随堂练" />
              <FormItem label="关联课件页" required value="8.2 一元一次不等式（第1课时）- 第3页" />
              <FormItem label="知识点" value="一元一次不等式 | 解一元一次不等式" />
              <NumField label="题目数量" required value="10" unit="题" />
              <NumField label="预计用时" value="8" unit="分钟" />
              <FormItem label="难度" value="中等" />
            </div>
          </Section>

          {/* 题目来源 */}
          <Section title="题目来源">
            <div className="flex gap-2 flex-wrap">
              {[
                { icon: <Database className="w-4 h-4" />, label: '题库', t: '智能题库' },
                { icon: <Upload className="w-4 h-4" />, label: '上传', t: '上传本地题目' },
                { icon: <FileText className="w-4 h-4" />, label: '课件', t: '从课件圈选' },
                { icon: <Bot className="w-4 h-4" />, label: 'AI', t: 'AI 生成' },
                { icon: <Edit3 className="w-4 h-4" />, label: '手动', t: '手动录入' }
              ].map(s => (
                <SourceButton
                  key={s.label}
                  icon={s.icon}
                  label={s.t}
                  active={source === s.label}
                  onClick={() => setSource(s.label)}
                />
              ))}
            </div>

            <div className="text-sm font-medium text-slate-700 mt-4 mb-2">题型（多选）</div>
            <div className="flex gap-3 flex-wrap text-sm">
              {Object.keys(types).map(k => (
                <Check key={k} label={k} on={types[k]} onClick={() => toggleType(k)} />
              ))}
            </div>
          </Section>

          {/* 客观题编辑 */}
          <Section title="客观题编辑（当前: 第 1 题 / 共 10 题）" extra={
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button className="hover:text-brand-600 flex items-center gap-1"><Sigma /> 插入公式</button>
              <button className="hover:text-brand-600 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> 图片</button>
              <button className="hover:text-brand-600">清空</button>
            </div>
          }>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1"><span className="text-red-500 mr-0.5">*</span>题干</div>
                <input className="input w-full" defaultValue="不等式 3x − 1 ≥ 2x + 4 的解集是（    ）" />
              </div>

              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-slate-400 text-center">{String.fromCharCode(65 + i)}</span>
                  <input
                    type="radio"
                    name="ans"
                    checked={answer === i}
                    onChange={() => setAnswer(i)}
                    className="accent-brand-600"
                  />
                  <input
                    className="input flex-1"
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                  />
                  {i === options.length - 1 && (
                    <button onClick={addOption} className="w-7 h-7 rounded text-slate-400 hover:bg-slate-100 flex items-center justify-center" title="添加选项"><Plus className="w-3.5 h-3.5" /></button>
                  )}
                  <button
                    onClick={() => removeOption(i)}
                    disabled={options.length <= 2}
                    className="w-7 h-7 rounded text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                    title="删除选项"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                <span className="text-xs text-slate-500"><span className="text-red-500 mr-0.5">*</span>正确答案</span>
                <div className="flex gap-3 text-sm">
                  {options.map((_, i) => (
                    <label key={i} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="ans2" checked={answer === i} onChange={() => setAnswer(i)} className="accent-brand-600" />
                      <span>{String.fromCharCode(65 + i)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[80px_1fr] gap-3">
                <span className="text-xs text-slate-500 pt-2">解析</span>
                <div>
                  <textarea className="input w-full !h-20 py-2" defaultValue="解：3x − 1 ≥ 2x + 4 ⇒ 3x − 2x ≥ 4 + 1，移项: 3x − 2x ≥ 4 + 1，得 x ≥ 5。" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NumField label="分值" required value="5" unit="分" />
                <NumField label="倒计时" required value="60" unit="秒" />
              </div>
            </div>
          </Section>
        </div>

        {/* 右侧预览 + 分层 */}
        <div className="space-y-4">
          <Section title="题目预览（学生端效果）">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
                <span>1 / 10　 单选题</span>
                <span className="text-orange-500">⏱ 60秒</span>
              </div>
              <div className="text-slate-800 mb-3">不等式 3x − 1 ≥ 2x + 4 的解集是（    ）</div>
              {options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input type="radio" name="prev" checked={answer === i} onChange={() => setAnswer(i)} className="accent-brand-600" />
                  <span className="text-slate-700">{String.fromCharCode(65 + i)}. {opt}</span>
                </label>
              ))}
            </div>
          </Section>

          <Section title="分层推送设置" extra={<button onClick={() => setLayered(l => !l)}><Switch on={layered} /></button>}>
            <div className="text-xs text-slate-400 -mt-2 mb-2">{layered ? '已开启' : '未开启'}按学情分层</div>
            <table className={`w-full text-xs ${layered ? '' : 'opacity-40 pointer-events-none'}`}>
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left py-1 font-normal">层级</th>
                  <th className="text-left py-1 font-normal">预计人数</th>
                  <th className="text-left py-1 font-normal">难度</th>
                  <th className="text-left py-1 font-normal">题目数量</th>
                  <th className="text-right py-1 font-normal">操作</th>
                </tr>
              </thead>
              <tbody>
                {layers.map(l => (
                  <tr key={l.tag} className="border-t border-slate-50">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded ${layerColors[l.color]} text-white flex items-center justify-center text-[10px] font-bold`}>{l.tag}</span>
                        <span className="text-slate-700">{l.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-600">{l.n} 人</td>
                    <td className="text-slate-600">{l.diff}</td>
                    <td className="text-slate-600">{l.qn} 题</td>
                    <td className="text-right text-slate-400">
                      <button className="hover:text-brand-600 text-xs">编辑</button>
                      <button className="ml-2 hover:text-red-500 text-xs">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="回收与展示设置">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              {Object.keys(collect).map(k => (
                <Check key={k} label={k} on={collect[k]} onClick={() => toggleCollect(k)} />
              ))}
            </div>

            <div className="text-sm font-medium text-slate-700 mt-3 mb-2">展示给学生的反馈</div>
            <div className="flex gap-4 text-sm">
              {['仅结果反馈', '结果 + 解析反馈', '仅解析反馈'].map(label => (
                <Radio key={label} label={label} on={feedback === label} onClick={() => setFeedback(label)} />
              ))}
            </div>
            <div className="text-xs text-slate-400 mt-2">学生提交后可查看结果与解析。教师端可查看详细学情反馈。</div>
          </Section>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="card p-3 flex items-center justify-center gap-3">
        <button className="btn-ghost"><Save className="w-3.5 h-3.5" /> 保存为模板</button>
        <button className="btn-primary"><Send className="w-3.5 h-3.5" /> 保存并发送</button>
        <button className="btn-ghost"><Eye className="w-3.5 h-3.5" /> 预览学生端</button>
      </div>
    </div>
  )
}

function Sigma() {
  return <span className="text-base">∑</span>
}

function Section({ title, extra, children }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        {extra}
      </div>
      {children}
    </div>
  )
}

function FormItem({ label, required, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{required && <span className="text-red-500 mr-0.5">*</span>}{label}</div>
      <button className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 flex items-center justify-between hover:border-brand-300">
        <span className="truncate">{value}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
      </button>
    </div>
  )
}

function NumField({ label, required, value, unit }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{required && <span className="text-red-500 mr-0.5">*</span>}{label}</div>
      <div className="flex items-center border border-slate-200 rounded-md overflow-hidden h-9 bg-white">
        <button className="w-8 text-slate-500 hover:bg-slate-50">−</button>
        <input className="flex-1 text-center text-sm outline-none w-0" defaultValue={value} />
        <button className="w-8 text-slate-500 hover:bg-slate-50">+</button>
        <span className="px-2 text-xs text-slate-400">{unit}</span>
      </div>
    </div>
  )
}

function SourceButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-4 py-2.5 rounded-lg border flex items-center gap-2 text-sm transition ${active ? 'border-brand-500 bg-brand-50 text-brand-600 font-medium' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'}`}>
      {icon} {label}
    </button>
  )
}

function Check({ label, on, onClick }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer select-none" onClick={(e) => { if (onClick) { e.preventDefault(); onClick() } }}>
      <input type="checkbox" checked={!!on} readOnly className="accent-brand-600 pointer-events-none" />
      <span className="text-slate-700">{label}</span>
    </label>
  )
}

function Radio({ label, on, onClick }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer select-none" onClick={(e) => { if (onClick) { e.preventDefault(); onClick() } }}>
      <input type="radio" name="fb" checked={!!on} readOnly className="accent-brand-600 pointer-events-none" />
      <span className="text-slate-700">{label}</span>
    </label>
  )
}

function Switch({ on }) {
  return (
    <div className={`relative w-9 h-5 rounded-full transition ${on ? 'bg-brand-500' : 'bg-slate-300'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </div>
  )
}

