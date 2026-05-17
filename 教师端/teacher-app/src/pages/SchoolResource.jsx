import { useState, useMemo } from 'react'
import {
  Search, Plus, Upload, Download, Filter, Star, Eye, Heart,
  FileText, Layers, Image as ImageIcon, Video, Database, ChevronDown,
  Folder, Users, MessageCircle, Bookmark, X
} from 'lucide-react'

const categories = [
  { name: '全部资源', count: 1284, active: true },
  { name: '我的收藏', count: 86 },
  { name: '我的上传', count: 42 },
  { name: '推荐资源', count: 156 },
  { name: '最新更新', count: 28 }
]

const tags = ['一元一次不等式', '解集', '数轴表示', '应用题', '函数', '几何', '统计', '代数']

const grades = ['初一', '初二', '初三', '高一', '高二', '高三']

const resourceTypes = [
  { icon: FileText, label: '课件', n: 458, color: 'brand' },
  { icon: Layers, label: '教案', n: 286, color: 'emerald' },
  { icon: Database, label: '题库', n: 312, color: 'amber' },
  { icon: ImageIcon, label: '素材', n: 152, color: 'violet' },
  { icon: Video, label: '微课', n: 76, color: 'rose' }
]

const resTypeColor = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600'
}

const items = [
  { type: '课件', tag: 'brand', title: '一元一次不等式 (第1课时) 精品课件', author: '张老师 · 数学组', date: '2026-05-12', star: 4.8, views: 286, likes: 62, hot: true },
  { type: '题库', tag: 'amber', title: '一元一次不等式 50 题精选 (含解析)', author: '王老师 · 数学组', date: '2026-05-10', star: 4.6, views: 198, likes: 45, hot: false },
  { type: '教案', tag: 'emerald', title: '不等式与数轴表示教学设计 (人教版)', author: '李老师 · 数学组', date: '2026-05-08', star: 4.7, views: 142, likes: 38, hot: false },
  { type: '微课', tag: 'rose', title: '数轴上不等式解集表示动画 (5min)', author: '陈老师 · 信息中心', date: '2026-05-05', star: 4.9, views: 412, likes: 88, hot: true },
  { type: '素材', tag: 'violet', title: '数学常用图形素材包 (vector)', author: '赵老师 · 美术组', date: '2026-05-02', star: 4.5, views: 156, likes: 32, hot: false },
  { type: '课件', tag: 'brand', title: '8.2 一元一次不等式 (导学案版)', author: '刘老师 · 数学组', date: '2026-04-28', star: 4.4, views: 124, likes: 28, hot: false }
]

const tagColors = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600'
}

export default function SchoolResource() {
  const [view, setView] = useState('list') // list | grid
  const [activeCategory, setActiveCategory] = useState('全部资源')
  const [activeSubject, setActiveSubject] = useState('数学')
  const [activeGrade, setActiveGrade] = useState('初二')
  const [activeTag, setActiveTag] = useState('一元一次不等式')
  const [activeType, setActiveType] = useState(null) // 选中某个类型卡片
  const [keyword, setKeyword] = useState('')
  const [favorites, setFavorites] = useState({ 0: true, 3: true })
  const [bookmarks, setBookmarks] = useState({})

  const visible = useMemo(() => {
    return items
      .map((it, idx) => ({ ...it, _idx: idx }))
      .filter(it => {
        if (activeType && it.type !== activeType) return false
        if (activeCategory === '我的收藏' && !favorites[it._idx]) return false
        if (keyword.trim() && !it.title.includes(keyword.trim()) && !it.author.includes(keyword.trim())) return false
        return true
      })
  }, [activeCategory, activeType, keyword, favorites])

  const toggleFav = (idx) => setFavorites({ ...favorites, [idx]: !favorites[idx] })
  const toggleBookmark = (idx) => setBookmarks({ ...bookmarks, [idx]: !bookmarks[idx] })
  const reset = () => {
    setActiveCategory('全部资源')
    setActiveSubject('数学')
    setActiveGrade('初二')
    setActiveTag('一元一次不等式')
    setActiveType(null)
    setKeyword('')
  }

  return (
    <div className="p-6 space-y-4">
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-800">校本资源中心</div>
          <div className="text-xs text-slate-500 mt-1">优质教学资源共享 · 教研协作 · 个人收藏</div>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost h-9"><Filter className="w-3.5 h-3.5" /> 筛选</button>
          <button className="btn-ghost h-9"><Upload className="w-3.5 h-3.5" /> 上传资源</button>
          <button className="btn-primary h-9"><Plus className="w-3.5 h-3.5" /> 新建资源</button>
        </div>
      </div>

      {/* 5 类资源数量统计 */}
      <div className="grid grid-cols-5 gap-3">
        {resourceTypes.map(t => {
          const Icon = t.icon
          const isActive = activeType === t.label
          return (
            <div
              key={t.label}
              onClick={() => setActiveType(isActive ? null : t.label)}
              className={`card p-4 flex items-center gap-3 cursor-pointer transition ${isActive ? 'ring-2 ring-brand-500 border-brand-500' : 'hover:border-brand-300'}`}
            >
              <div className={`w-12 h-12 rounded-xl ${resTypeColor[t.color]} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500">{t.label}</div>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">{t.n}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-4">
        {/* 左侧筛选 */}
        <div className="card p-4 space-y-4">
          <div>
            <div className="text-sm font-semibold text-slate-800 mb-2">资源分类</div>
            <div className="space-y-1 -mx-2">
              {categories.map(c => (
                <div
                  key={c.name}
                  onClick={() => setActiveCategory(c.name)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm ${activeCategory === c.name ? 'bg-brand-50 text-brand-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5" />{c.name}
                  </span>
                  <span className="text-xs">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800 mb-2">学科年级</div>
            <div className="flex flex-wrap gap-1.5">
              {['数学', '语文', '英语', '物理', '化学'].map(s => (
                <button
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  className={`pill ${activeSubject === s ? 'bg-brand-50 text-brand-600 font-medium' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >{s}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {grades.map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGrade(g)}
                  className={`pill ${activeGrade === g ? 'bg-brand-50 text-brand-600 font-medium' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >{g}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800 mb-2">知识点</div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={`pill ${activeTag === t ? 'bg-brand-50 text-brand-600 font-medium' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >{t}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800 mb-2">教研组</div>
            <div className="space-y-1.5 text-sm">
              <CheckRow label="数学教研组" defaultOn />
              <CheckRow label="八年级备课组" defaultOn />
              <CheckRow label="九年级备课组" />
              <CheckRow label="信息中心" />
            </div>
          </div>

          <button onClick={reset} className="w-full btn-ghost h-9">重置筛选</button>
        </div>

        {/* 右侧资源列表 */}
        <div className="space-y-3">
          {/* 搜索 + 排序 */}
          <div className="card p-3 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9 w-full"
                placeholder="搜索资源名称、教师、知识点..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
              {keyword && (
                <button onClick={() => setKeyword('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 hover:bg-slate-100 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
            <button className="btn-ghost h-9 text-xs">最近热门 <ChevronDown className="w-3 h-3" /></button>
            <div className="flex border border-slate-200 rounded overflow-hidden text-xs">
              <button onClick={() => setView('list')} className={`px-3 py-1.5 ${view === 'list' ? 'bg-brand-50 text-brand-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}>列表</button>
              <button onClick={() => setView('grid')} className={`px-3 py-1.5 ${view === 'grid' ? 'bg-brand-50 text-brand-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}>网格</button>
            </div>
          </div>

          {/* 已激活筛选展示 */}
          {(activeType || activeCategory !== '全部资源' || keyword) && (
            <div className="card p-3 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500">已选筛选：</span>
              {activeCategory !== '全部资源' && <FilterTag label={activeCategory} onRemove={() => setActiveCategory('全部资源')} />}
              {activeType && <FilterTag label={`类型:${activeType}`} onRemove={() => setActiveType(null)} />}
              {keyword && <FilterTag label={`关键词:${keyword}`} onRemove={() => setKeyword('')} />}
            </div>
          )}

          {/* 资源卡片 */}
          {visible.length === 0 ? (
            <div className="card p-12 text-center text-sm text-slate-400">没有找到匹配的资源</div>
          ) : view === 'list' ? (
            <div className="space-y-3">
              {visible.map(it => {
                const i = it._idx
                const fav = !!favorites[i]
                const bk = !!bookmarks[i]
                return (
                  <div key={i} className="card p-4 hover:border-brand-300 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-lg ${tagColors[it.tag]} flex flex-col items-center justify-center flex-shrink-0`}>
                        <FileText className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5">{it.type}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-800">{it.title}</span>
                          {it.hot && <span className="pill bg-rose-50 text-rose-600">热门</span>}
                          <span className="pill bg-emerald-50 text-emerald-600">校本</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-2">{it.author} · 更新于 {it.date}</div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {it.star}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {it.views}</span>
                          <button onClick={() => toggleFav(i)} className={`flex items-center gap-1 ${fav ? 'text-rose-500' : 'hover:text-rose-500'}`}>
                            <Heart className={`w-3 h-3 ${fav ? 'fill-rose-500' : ''}`} /> {it.likes + (fav ? 1 : 0)}
                          </button>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> 16</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button className="btn-primary h-8 text-xs">立即使用</button>
                        <div className="flex gap-1">
                          <button onClick={() => toggleBookmark(i)} className={`w-8 h-8 rounded border flex items-center justify-center ${bk ? 'bg-brand-50 border-brand-300 text-brand-600' : 'border-slate-200 hover:border-brand-300 text-slate-500'}`}>
                            <Bookmark className={`w-3.5 h-3.5 ${bk ? 'fill-brand-600' : ''}`} />
                          </button>
                          <button className="w-8 h-8 rounded border border-slate-200 hover:border-brand-300 flex items-center justify-center text-slate-500"><Download className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {visible.map(it => {
                const i = it._idx
                const fav = !!favorites[i]
                return (
                  <div key={i} className="card overflow-hidden hover:shadow-soft transition cursor-pointer">
                    <div className={`h-28 ${tagColors[it.tag]} flex flex-col items-center justify-center relative`}>
                      <FileText className="w-8 h-8" />
                      <span className="text-xs mt-1">{it.type}</span>
                      {it.hot && <span className="absolute top-2 left-2 pill bg-rose-500/90 text-white">热门</span>}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFav(i) }}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center ${fav ? 'text-rose-500' : 'text-slate-400'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug min-h-[40px]">{it.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{it.author}</div>
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {it.star}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {it.views}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {it.likes + (fav ? 1 : 0)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 分页 */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>共 {visible.length} / 1,284 条资源 · 当前第 1 页</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} className={`w-7 h-7 rounded text-sm ${n === 1 ? 'bg-brand-600 text-white' : 'border border-slate-200 hover:border-brand-300'}`}>{n}</button>
              ))}
              <span className="text-slate-400">···</span>
              <button className="w-10 h-7 rounded border border-slate-200 text-sm">86</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckRow({ label, defaultOn }) {
  const [on, setOn] = useState(!!defaultOn)
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none" onClick={(e) => { e.preventDefault(); setOn(o => !o) }}>
      <input type="checkbox" checked={on} readOnly className="accent-brand-600 pointer-events-none" />
      <span className="text-slate-700 text-sm flex-1">{label}</span>
    </label>
  )
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
      {label}
      <button onClick={onRemove} className="w-3.5 h-3.5 rounded-full hover:bg-brand-200 flex items-center justify-center">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  )
}

