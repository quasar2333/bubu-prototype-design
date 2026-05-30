import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight, ChevronDown, Plus, Upload, Edit3, Trash2, Volume2,
  Send, Save, HelpCircle
} from 'lucide-react'

const words = [
  { idx: 1, word: 'inequality', pos: '名词', phonetic: "/ɪnɪˈkwɒlɪti/" },
  { idx: 2, word: 'coordinate', pos: '名词', phonetic: "/kəʊˈɔːdɪnət/" },
  { idx: 3, word: 'function', pos: '名词', phonetic: "/ˈfʌŋkʃn/" },
  { idx: 4, word: 'axis', pos: '名词', phonetic: "/ˈæksɪs/" },
  { idx: 5, word: 'solution', pos: '名词', phonetic: "/səˈluːʃn/" }
]

const errorWords = [
  { w: 'inequality', n: 8 },
  { w: 'function', n: 6 },
  { w: 'coordinate', n: 5 },
  { w: 'axis', n: 4 },
  { w: 'solution', n: 3 }
]

export default function DictationConfig() {
  const [mode, setMode] = useState('拼音模式')
  const [delivery, setDelivery] = useState('白板手动下发')
  return (
    <div className="p-6 space-y-4">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        课堂互动设计 <ChevronRight className="w-3 h-3" /> <span className="text-slate-700">听写配置</span>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4">
          {/* 基础信息 */}
          <Section title="基础信息">
            <div className="grid grid-cols-3 gap-3">
              <FormItem label="听写名称" required value="八上 Unit 2 词汇听写" />
              <FormItem label="关联课件页" required value="8.2 一元一次不等式（第1课时）" />
              <FormItem label="学科" required value="英语" />
              <FormItem label="班级" required value="初二 (3) 班" />
              <NumField label="预计耗时" value="10" unit="分钟" />
              <FormItem label="难度" value="中等" />
            </div>
          </Section>

          {/* 听写模式 */}
          <Section title="听写模式">
            <div className="flex gap-2">
              {['拼音模式', '汉义模式', '原意模式', '教师朗读', '系统朗读'].map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-md text-sm border transition ${mode === m ? 'border-brand-500 bg-brand-50 text-brand-600 font-medium' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'}`}>
                  {m}
                </button>
              ))}
            </div>
          </Section>

          {/* 题目设置 */}
          <Section title="题目设置">
            <div className="flex gap-2 mb-3 flex-wrap">
              <button className="btn-ghost h-8"><Upload className="w-3 h-3" /> 批量导入词语</button>
              <button className="btn-ghost h-8">从教材选择</button>
              <button className="btn-ghost h-8">从题库选择</button>
              <button className="btn-ghost h-8"><Plus className="w-3 h-3" /> 手动新增</button>
              <button className="btn-ghost h-8 ml-auto">上传音频</button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-100">
                  <th className="text-left py-2 font-normal w-12">序号</th>
                  <th className="text-left py-2 font-normal">词语</th>
                  <th className="text-left py-2 font-normal">词性</th>
                  <th className="text-left py-2 font-normal">音标 / 提示</th>
                  <th className="text-center py-2 font-normal">播放音频</th>
                  <th className="text-right py-2 font-normal">操作</th>
                </tr>
              </thead>
              <tbody>
                {words.map(w => (
                  <tr key={w.idx} className="border-b border-slate-50">
                    <td className="py-2 text-slate-500">{w.idx}</td>
                    <td className="py-2 text-slate-800 font-medium">{w.word}</td>
                    <td className="py-2 text-slate-600">{w.pos}</td>
                    <td className="py-2 text-slate-600">{w.phonetic}</td>
                    <td className="text-center">
                      <button className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 inline-flex items-center justify-center hover:bg-brand-100">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center gap-2 justify-end text-slate-400">
                        <button className="hover:text-brand-600"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button className="hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-xs text-slate-400 mt-3">共 5 题 · 提示：可拖拽调整题目顺序</div>
          </Section>

          {/* 防抄设置 */}
          <Section title="防抄设置">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Check label="题目顺序随机" on />
              <Check label="选项顺序随机" on />
              <Check label="禁止切屏" />
              <Check label="倒计时" on />
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-slate-500">时间:</span>
                <input className="input w-24" defaultValue="08:00" />
                <span className="text-slate-500 text-xs">分钟</span>
              </div>
            </div>
          </Section>
        </div>

        {/* 右侧配置 */}
        <div className="space-y-4">
          <Section title="下发设置" extra={<button className="btn-ghost h-7 text-xs"><HelpCircle className="w-3 h-3" /> 使用帮助</button>}>
            <RadioRow label="白板手动下发" sub="教师在白板上手动点击下发，学生端开始作答" on={delivery === '白板手动下发'} onClick={() => setDelivery('白板手动下发')} />
            <RadioRow label="翻页后提示" sub="切换到下一页时，提示是否下发作答" on={delivery === '翻页后提示'} onClick={() => setDelivery('翻页后提示')} />
            <RadioRow label="指定学生" sub="仅下发给选中的学生" on={delivery === '指定学生'} onClick={() => setDelivery('指定学生')} />
            <RadioRow label="全班" sub="下发给全班学生" on={delivery === '全班'} onClick={() => setDelivery('全班')} />
          </Section>

          <Section title="回收设置">
            <Check label="自动回收" sub="倒计时结束后自动回收" on />
            <Check label="手动结束" sub="教师手动结束并回收" />
            <Check label="超时自动提交" sub="学生未答完时，倒计时结束后自动提交" />
            <Check label="提交后显示结果" sub="学生提交答题后立即显示对错情况" on />
          </Section>

          <Section title="学生端预览">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">第 1 题 / 共 5 题</span>
                <span className="text-orange-500">⏱ 08:00</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-700">听写词语</span>
                <Volume2 className="w-3.5 h-3.5 text-brand-500" />
              </div>
              <textarea className="w-full h-20 border border-slate-200 rounded p-2 text-sm bg-white" placeholder="请输入听写内容" />
              <button className="w-full mt-2 btn-primary h-8 text-xs"><Send className="w-3 h-3" /> 提交</button>
            </div>
          </Section>

          <Section title="白板端预览">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center gap-3">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="62,100" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-base font-bold text-brand-600">71%</div>
              </div>
              <div className="flex-1 text-xs">
                <div className="text-slate-500">已提交 / 总人数</div>
                <div className="text-xl font-bold text-slate-800">32 <span className="text-base text-slate-400">/ 45</span></div>
              </div>
            </div>

            <div className="mt-3 text-xs">
              <div className="text-slate-500 mb-1">未提交名单 (共 13 人)</div>
              <div className="flex gap-1 flex-wrap">
                {['李明阳', '王思涵', '张子涵', '陈宇航'].map(n => (
                  <span key={n} className="pill bg-slate-100 text-slate-600">{n}</span>
                ))}
                <span className="pill bg-slate-100 text-slate-400">···</span>
              </div>
            </div>

            <div className="mt-3 text-xs">
              <div className="text-slate-500 mb-1">错词高频 (Top 5)</div>
              <div className="flex flex-wrap gap-1.5">
                {errorWords.map((e, i) => (
                  <span key={i} className="pill bg-rose-50 text-rose-600">{e.w} <span className="text-rose-500 font-semibold">{e.n}人</span></span>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="card p-3 flex items-center justify-center gap-3">
        <button className="btn-ghost"><Save className="w-3.5 h-3.5" /> 保存为模板</button>
        <button className="btn-ghost">保存并绑定课件</button>
        <button className="btn-primary"><Send className="w-3.5 h-3.5" /> 发送到白板</button>
      </div>
    </div>
  )
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

function NumField({ label, value, unit }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <input className="input w-20" defaultValue={value} />
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  )
}

function RadioRow({ label, sub, on, onClick }) {
  return (
    <label onClick={onClick} className="flex items-start gap-2 py-1.5 cursor-pointer">
      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${on ? 'border-brand-500' : 'border-slate-300'}`}>
        {on && <div className="w-2 h-2 rounded-full bg-brand-500 m-0.5" />}
      </div>
      <div className="text-xs">
        <div className="text-slate-700">{label}</div>
        <div className="text-slate-400 mt-0.5">{sub}</div>
      </div>
    </label>
  )
}

function Check({ label, sub, on }) {
  return (
    <label className="flex items-start gap-2 py-1.5 cursor-pointer text-sm">
      <input type="checkbox" defaultChecked={on} className="mt-0.5 accent-brand-600" />
      <div className="text-xs">
        <div className="text-slate-700">{label}</div>
        {sub && <div className="text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </label>
  )
}

