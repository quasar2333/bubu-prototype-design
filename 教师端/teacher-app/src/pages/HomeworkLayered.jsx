import { Link } from 'react-router-dom'
import { ChevronRight, FileText, Settings, Edit3, ChevronDown, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react'

const tiers = [
  { tag: 'A', color: 'red', name: '提升挑战', diff: '困难', n: 12, qn: 10, time: 32, names: ['李', '王', '张', '陈', '刘'], knowledge: '一元一次不等式、解不等式、不等式的应用（含较难情境）' },
  { tag: 'B', color: 'emerald', name: '标准巩固', diff: '中等', n: 21, qn: 12, time: 26, names: ['赵', '周', '吴', '徐', '黄'], knowledge: '一元一次不等式、解不等式、不等式的应用' },
  { tag: 'C', color: 'amber', name: '基础补弱', diff: '简单', n: 12, qn: 10, time: 20, names: ['陈', '孙', '刘', '胡', '杨'], knowledge: '一元一次不等式、解不等式（基础步骤与概念）' }
]
const tierBg = { red: 'bg-red-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500' }
const tierDiffBg = { red: 'bg-red-50 text-red-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600' }

export default function HomeworkLayered() {
  return (
    <div className="p-6 space-y-4">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <Link to="/homework" className="hover:text-brand-600">作业布置</Link>
        <ChevronRight className="w-3 h-3" /> <span className="text-slate-700">分层发布确认</span>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          <div className="card p-5 flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-brand-600" />
            </div>
            <Cell label="作业名称" value="一元一次不等式课后练习" />
            <Cell label="班级" value="初二(3)班 (45人)" />
            <Cell label="总题量" value="20题" />
            <Cell label="截止时间" value="2026-05-18 23:59" />
            <Cell label="推荐总时长" value="28分钟" />
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-800">分层分配方案 <span className="text-xs text-slate-400 font-normal ml-2">共 3 层</span></span>
              <button className="btn-ghost h-8"><Settings className="w-3 h-3" /> 调整分层规则</button>
            </div>

            <div className="space-y-3">
              {tiers.map(t => (
                <div key={t.tag} className="border border-slate-100 rounded-lg p-4 grid grid-cols-[100px_1fr_120px_220px_80px] gap-4 items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded ${tierBg[t.color]} text-white flex items-center justify-center text-xs font-bold`}>{t.tag}</span>
                      <span className="text-sm font-medium text-slate-800">{t.name}</span>
                    </div>
                    <span className={`pill ${tierDiffBg[t.color]} mt-2 inline-block`}>难度：{t.diff}</span>
                    <div className="text-xs text-slate-400 mt-1">{t.n} 人　{t.diff} {t.qn} 道</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">学生名单（部分）</div>
                    <div className="flex -space-x-1">
                      {t.names.map((a, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${i % 2 ? 'from-orange-300 to-pink-400' : 'from-blue-300 to-indigo-400'} text-white text-xs flex items-center justify-center border-2 border-white`}>{a}</div>
                      ))}
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center border-2 border-white">···</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">预计时长</div>
                    <div className="text-sm font-semibold text-slate-700">{t.time} 分钟</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">知识点</div>
                    <div className="text-xs text-slate-600 leading-snug">{t.knowledge}</div>
                  </div>

                  <button className="text-xs text-brand-600 hover:underline flex items-center gap-1"><Edit3 className="w-3 h-3" /> 编辑</button>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 text-xs text-brand-600 hover:underline cursor-pointer flex items-center justify-center gap-1">
              查看分层详情 <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold text-slate-800 mb-3">学生端展示预览 <span className="text-xs text-slate-400 font-normal">(以 A 层学生：李明阳 为例)</span></div>
            <div className="grid grid-cols-[80px_1fr_auto] gap-4 items-center">
              <div className="space-y-2 text-xs">
                <div className="bg-brand-50 text-brand-600 px-2 py-1 rounded text-center font-medium">作业内容</div>
                <div className="text-slate-400 px-2 py-1 rounded text-center">提交页面</div>
              </div>
              <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/40">
                <div className="text-sm text-slate-800 mb-1 flex items-center gap-2">
                  一元一次不等式课后练习 <span className="pill bg-red-50 text-red-600">A层</span> <span className="pill bg-slate-100 text-slate-600">困难</span>
                </div>
                <div className="text-xs text-slate-500">共 10 题　预计用时 32 分钟</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <div className="text-slate-500">截止时间：2026-05-18 23:59</div>
                  <div className="text-orange-500">距离截止还有 2天 8小时</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded flex items-center justify-center">👨‍💻</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <div className="text-sm font-semibold text-slate-800 mb-3">发布规则</div>
            <ToggleRow label="分层内容对学生不可见" sub="学生仅能看到自己的作业内容" on />
            <ToggleRow label="提交后显示解析" sub="学生提交后可查看题目解析" on />
            <div className="text-xs text-slate-500 mb-1 mt-3">截止前提醒</div>
            <button className="w-full h-8 px-3 rounded-md border border-slate-200 text-sm text-slate-700 flex items-center justify-between">
              提前 24 小时 <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <div className="text-xs text-slate-500 mt-2 mb-1">通过站内信提醒学生</div>
            <ToggleRow label="允许补交" sub="截止后 24 小时内可补交一次" on />
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-800">风险检查</span>
              <button className="text-xs text-brand-600 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> 重新检查</button>
            </div>
            <RiskRow icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} title="未分配学生" value="0 人" right="正常" rightColor="text-emerald-600" />
            <RiskRow icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} title="重复题目" value="2 处" right="查看详情" rightColor="text-brand-600" />
            <RiskRow icon={<AlertCircle className="w-4 h-4 text-red-500" />} title="时长偏长" value="1 个层级" right="查看详情" rightColor="text-brand-600" />
            <div className="text-xs text-slate-400 mt-2 leading-snug">建议根据检查结果优化后再发布，保障学生体验。</div>
          </div>
        </div>
      </div>

      <div className="card p-3 flex items-center justify-center gap-3">
        <button className="btn-ghost">返回修改</button>
        <button className="btn-ghost">保存草稿</button>
        <button className="btn-primary">确认发布</button>
      </div>
    </div>
  )
}

function Cell({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-800 mt-0.5">{value}</div>
    </div>
  )
}

function ToggleRow({ label, sub, on }) {
  return (
    <div className="flex items-start gap-2 py-2">
      <div className="flex-1">
        <div className="text-sm text-slate-700">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
      </div>
      <div className={`relative w-9 h-5 rounded-full transition mt-1 ${on ? 'bg-brand-500' : 'bg-slate-300'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </div>
    </div>
  )
}

function RiskRow({ icon, title, value, right, rightColor }) {
  return (
    <div className="flex items-center gap-2 py-2 border-t border-slate-50 first:border-t-0">
      {icon}
      <span className="text-sm text-slate-700 flex-1">{title}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
      <span className={`text-xs ${rightColor} ml-2`}>{right}</span>
    </div>
  )
}

