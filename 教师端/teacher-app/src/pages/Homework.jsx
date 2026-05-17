import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Layers, FileEdit, AlertTriangle, FileText, Send, Clock, PieChart,
  CheckCircle2, Edit3, Eye, MoreHorizontal
} from 'lucide-react'

const TABS = ['作业草稿', '已发布作业', '作业模板']

const rows = [
  { name: '一元一次不等式课后练习', status: '草稿', class: '初二 (3) 班', n: 20, dur: '25 分钟', deadline: '2026-05-18 周二 23:59', submit: '0/45', progress: 0, action: '编辑', state: '草稿', stateColor: 'slate' },
  { name: '函数图像周训练', status: '已发布', class: '初二 (3) 班', n: 18, dur: '22 分钟', deadline: '2026-05-17 周日 23:59', submit: '38/45 (84%)', progress: 84, action: '查看', state: '进行中', stateColor: 'amber' },
  { name: '期中复习卷', status: '已发布', class: '初二 (3) 班', n: 26, dur: '35 分钟', deadline: '2026-05-14 周四 23:59', submit: '45/45 (100%)', progress: 100, action: '查看', state: '已完成', stateColor: 'emerald' },
  { name: '二次函数基础训练', status: '草稿', class: '初二 (3) 班', n: 16, dur: '20 分钟', deadline: '2026-05-20 周三 23:59', submit: '0/45', progress: 0, action: '编辑', state: '草稿', stateColor: 'slate' },
  { name: '图形与证明专项练习', status: '已发布', class: '初二 (3) 班', n: 22, dur: '30 分钟', deadline: '2026-05-12 周一 23:59', submit: '40/45 (89%)', progress: 89, action: '查看', state: '已关闭', stateColor: 'slate' },
  { name: '分式方程练习', status: '草稿', class: '初二 (3) 班', n: 14, dur: '18 分钟', deadline: '2026-05-19 周二 23:59', submit: '0/45', progress: 0, action: '编辑', state: '草稿', stateColor: 'slate' }
]

const stateBg = { slate: 'bg-slate-100 text-slate-600', amber: 'bg-amber-100 text-amber-700', emerald: 'bg-emerald-100 text-emerald-700' }

export default function Homework() {
  const [tab, setTab] = useState('作业草稿')

  return (
    <div className="p-6 grid grid-cols-[1fr_320px] gap-5">
      <div className="space-y-4 min-w-0">
        <div className="grid grid-cols-4 gap-3">
          <ActionCard primary icon={<Plus className="w-4 h-4" />} label="新建作业" to="/homework/layered" />
          <ActionCard icon={<Layers className="w-4 h-4" />} label="从题库组卷" />
          <ActionCard icon={<FileEdit className="w-4 h-4" />} label="从课件生成作业" />
          <ActionCard icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} label="从错题生成作业" />
        </div>

        <div className="grid grid-cols-5 gap-3">
          <MiniStat icon={<FileText className="w-6 h-6 text-brand-500" />} label="草稿" value="3" delta="较上周 +1" />
          <MiniStat icon={<Send className="w-6 h-6 text-emerald-500" />} label="已发布" value="12" delta="较上周 +2" />
          <MiniStat icon={<Clock className="w-6 h-6 text-amber-500" />} label="待批阅" value="32" delta="较上周 +8" />
          <MiniStat icon={<PieChart className="w-6 h-6 text-violet-500" />} label="本周提交率" value="84%" delta="较上周 +6%" />
          <div className="card p-4 flex items-center justify-center text-xs text-slate-400">未来扩展卡</div>
        </div>

        <div className="card">
          <div className="px-5 pt-4 flex items-center gap-6 border-b border-slate-100">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`pb-3 text-sm relative ${tab === t ? 'text-brand-600 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}>
                {t}
                {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
              </button>
            ))}
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="text-left py-3 px-5 font-normal">作业名称</th>
                <th className="text-left py-3 font-normal">班级</th>
                <th className="text-left py-3 font-normal">题量</th>
                <th className="text-left py-3 font-normal">预计时长</th>
                <th className="text-left py-3 font-normal">截止时间</th>
                <th className="text-left py-3 font-normal">提交进度</th>
                <th className="text-left py-3 font-normal">状态</th>
                <th className="text-right py-3 pr-5 font-normal">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/40">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-500" />
                      <span className="text-slate-800">{r.name}</span>
                      <span className={`pill ${r.status === '草稿' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>{r.status}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 pl-6">创建于 2026-05-{14 + i} 15:30</div>
                  </td>
                  <td className="text-slate-600">{r.class}</td>
                  <td className="text-slate-600">{r.n} 题</td>
                  <td className="text-slate-600">{r.dur}</td>
                  <td className="text-slate-600 text-xs">{r.deadline}</td>
                  <td className="pr-4">
                    <div className="flex items-center gap-2 max-w-[120px]">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${r.progress >= 80 ? 'bg-emerald-500' : r.progress > 0 ? 'bg-brand-500' : 'bg-slate-300'}`} style={{ width: `${r.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{r.submit}</span>
                    </div>
                  </td>
                  <td><span className={`pill ${stateBg[r.stateColor]}`}>{r.state}</span></td>
                  <td className="text-right pr-5">
                    <div className="flex items-center justify-end gap-2 text-slate-500">
                      <button className="text-brand-600 hover:underline text-xs">{r.action}</button>
                      <button className="hover:text-slate-700"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-5 py-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">共 6 条</span>
            <div className="flex items-center gap-2">
              <select className="input"><option>10 条/页</option></select>
              <div className="flex gap-1">
                <button className="w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100">‹</button>
                <button className="w-8 h-8 rounded-md bg-brand-500 text-white">1</button>
                <button className="w-8 h-8 rounded-md text-slate-500 hover:bg-slate-100">›</button>
              </div>
              <span className="text-slate-500 ml-2">前往 <input className="input w-12 inline-block ml-1" defaultValue="1" /> 页</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-slate-800">作业创建快捷区</div>
            <button className="text-xs text-brand-600 hover:underline">更换模板 ›</button>
          </div>
          <div className="text-xs text-slate-500 mb-2">当前选择模板</div>
          <div className="border border-slate-100 rounded-lg p-3 mb-3 bg-slate-50/50">
            <div className="flex gap-3">
              <div className="w-14 h-16 bg-white border border-slate-200 rounded flex items-center justify-center text-[9px] text-slate-400">封面</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">一元一次不等式（基础）</div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  <span className="pill bg-brand-50 text-brand-600">选择题</span>
                  <span className="pill bg-emerald-50 text-emerald-600">填空题</span>
                  <span className="pill bg-amber-50 text-amber-600">解答题</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 grid grid-cols-3 gap-2">
              <div>推荐难度：<span className="text-slate-700">中等</span></div>
              <div>适用对象：<span className="text-slate-700">初二</span></div>
              <div>使用 <span className="text-brand-600">128 次</span></div>
            </div>
          </div>

          <div className="font-semibold text-slate-800 text-sm mb-2">作业创建五步法</div>
          <Step n={1} title="基础信息" sub="设置作业名称、班级、截止时间" done />
          <Step n={2} title="题目区" sub="选择题目或知识点，预览试题" done />
          <Step n={3} title="时长设置" sub="设置预计时长、题量、分值" done />
          <Step n={4} title="分层发布" sub="设置分层规则与不同难度内容" />
          <Step n={5} title="发布确认" sub="预览作业详情，确认发布" />

          <div className="border-t border-slate-100 pt-3 mt-3">
            <div className="bg-slate-50 rounded-lg p-3 flex gap-3 items-start">
              <Clock className="w-5 h-5 text-brand-600 mt-0.5" />
              <div className="text-xs">
                <div className="text-slate-600">系统推荐</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">推荐总时长 28 分钟</div>
                <div className="text-slate-500 mt-1">基于题量和难度的智能估算</div>
                <a className="text-brand-600 mt-1 inline-block hover:underline">查看详情 ›</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ primary, icon, label, to }) {
  const cls = primary ? 'btn-primary' : 'card hover:shadow-soft transition'
  const content = (
    <div className={primary ? 'flex items-center justify-center gap-2 py-3' : 'p-4 flex items-center justify-center gap-2 text-slate-700'}>
      {icon} <span className="text-sm font-medium">{label}</span>
    </div>
  )
  return to ? <Link to={to} className={primary ? '' : cls}>{primary ? <div className={cls + ' w-full'}>{content}</div> : content}</Link>
    : <button className={primary ? '' : cls + ' w-full'}>{primary ? <div className={cls + ' w-full'}>{content}</div> : content}</button>
}

function MiniStat({ icon, label, value, delta }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-[11px] text-slate-400">{delta}</div>
      </div>
    </div>
  )
}

function Step({ n, title, sub, done }) {
  return (
    <div className="flex gap-3 py-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
        {done ? '✓' : n}
      </div>
      <div className="flex-1">
        <div className="text-sm text-slate-800">{title}</div>
        <div className="text-xs text-slate-400">{sub}</div>
      </div>
      {done && <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1" />}
    </div>
  )
}
