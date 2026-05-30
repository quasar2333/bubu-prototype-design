import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

// 递归的教材章节 / 知识点目录树
function collectInitial(nodes, openSet, selectedRef) {
  nodes.forEach(n => {
    if (n.defaultOpen) openSet.add(n.id)
    if (n.selected) selectedRef.id = n.id
    if (n.children) collectInitial(n.children, openSet, selectedRef)
  })
}

function TreeNode({ node, depth, openSet, toggleOpen, selectedId, onSelect }) {
  const hasChildren = !!node.children?.length
  const open = openSet.has(node.id)
  const selected = selectedId === node.id

  return (
    <div>
      <div
        onClick={() => (hasChildren ? toggleOpen(node.id) : onSelect(node.id))}
        className={`flex items-center gap-1 py-1.5 pr-2 rounded-md cursor-pointer text-[13px] transition ${
          selected ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
        }`}
        style={{ paddingLeft: depth * 14 + 6 }}
      >
        {hasChildren ? (
          <ChevronRight className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition ${open ? 'rotate-90' : ''}`} />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && open && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              openSet={openSet}
              toggleOpen={toggleOpen}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChapterTree({ nodes }) {
  const [openSet, setOpenSet] = useState(() => {
    const set = new Set()
    const selectedRef = { id: null }
    collectInitial(nodes, set, selectedRef)
    return set
  })
  const [selectedId, setSelectedId] = useState(() => {
    const selectedRef = { id: null }
    collectInitial(nodes, new Set(), selectedRef)
    return selectedRef.id
  })

  const toggleOpen = (id) =>
    setOpenSet(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="space-y-0.5">
      {nodes.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          openSet={openSet}
          toggleOpen={toggleOpen}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      ))}
    </div>
  )
}
