// 真实课件导入引擎：PDF 直接渲染；Office 经主进程 LibreOffice 转 PDF 后渲染；视频/图片直读。
// 渲染统一用 pdf.js，把每页画成图，供导入预览与编辑器背景使用。
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const OFFICE_EXT = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx']
const VIDEO_EXT = ['mp4', 'mov', 'avi', 'mkv']
const IMAGE_EXT = ['png', 'jpg', 'jpeg']

export const hasDesktop = () => typeof window !== 'undefined' && !!window.bubuDesktop

export function classifyExt(ext) {
  ext = String(ext || '').toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (OFFICE_EXT.includes(ext)) return 'office'
  if (VIDEO_EXT.includes(ext)) return 'video'
  if (IMAGE_EXT.includes(ext)) return 'image'
  return 'unknown'
}

function toUint8(bytes) {
  if (!bytes) return new Uint8Array()
  if (bytes instanceof Uint8Array) return bytes
  if (bytes instanceof ArrayBuffer) return new Uint8Array(bytes)
  if (Array.isArray(bytes)) return new Uint8Array(bytes)
  if (bytes.data) return new Uint8Array(bytes.data) // 序列化后的 Node Buffer
  return new Uint8Array(bytes)
}

export function formatSize(bytes) {
  if (!bytes) return ''
  const mb = bytes / 1024 / 1024
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// 把 PDF 字节渲染成逐页图片（dataURL）
export async function renderPdfBytes(bytes, { scale = 1.5, maxPages = 0, onProgress } = {}) {
  const data = toUint8(bytes)
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const total = pdf.numPages
  const count = maxPages > 0 ? Math.min(maxPages, total) : total
  const pages = []
  for (let i = 1; i <= count; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')
    await page.render({ canvasContext: ctx, viewport }).promise
    pages.push({
      page: i,
      dataUrl: canvas.toDataURL('image/jpeg', 0.82),
      w: canvas.width,
      h: canvas.height
    })
    onProgress?.(i, total)
  }
  return { pageCount: total, pages }
}

// 选择文件并解析为统一结构 { name, ext, size, kind, pageCount, pages[], video? }
export async function pickAndParse({ onStage, onRenderProgress } = {}) {
  if (!hasDesktop()) {
    const err = new Error('请在桌面应用中导入文件（Office/视频解析需要桌面端 LibreOffice 支持）')
    err.code = 'NO_DESKTOP'
    throw err
  }
  const picked = await window.bubuDesktop.openCoursewareFile()
  if (!picked) return null
  const { filePath, fileName, ext, size } = picked
  const kind = classifyExt(ext)
  const base = { name: fileName, ext, size, kind, filePath }

  if (kind === 'video') {
    onStage?.('read')
    const bytes = await window.bubuDesktop.readFileBytes(filePath)
    const mime = ext === 'mov' ? 'video/quicktime' : ext === 'avi' ? 'video/x-msvideo' : ext === 'mkv' ? 'video/x-matroska' : 'video/mp4'
    const videoUrl = URL.createObjectURL(new Blob([toUint8(bytes)], { type: mime }))
    return { ...base, pageCount: 1, video: true, pages: [{ page: 1, videoUrl }] }
  }

  if (kind === 'image') {
    onStage?.('read')
    const bytes = await window.bubuDesktop.readFileBytes(filePath)
    const url = URL.createObjectURL(new Blob([toUint8(bytes)]))
    return { ...base, pageCount: 1, pages: [{ page: 1, dataUrl: url }] }
  }

  if (kind === 'pdf') {
    onStage?.('read')
    const bytes = await window.bubuDesktop.readFileBytes(filePath)
    onStage?.('render')
    const result = await renderPdfBytes(bytes, { onProgress: onRenderProgress })
    return { ...base, ...result }
  }

  if (kind === 'office') {
    onStage?.('convert')
    const { bytes } = await window.bubuDesktop.officeToPdf(filePath)
    onStage?.('render')
    const result = await renderPdfBytes(bytes, { onProgress: onRenderProgress })
    return { ...base, ...result }
  }

  const err = new Error('暂不支持的文件类型：.' + ext)
  err.code = 'UNSUPPORTED'
  throw err
}

// 把解析结果暂存，供编辑器读取（Stage5 衔接用）
const IMPORT_KEY = 'bubu:imported-deck'
export function stashImportedDeck(deck) {
  try { window.__bubuImportedDeck = deck } catch {}
  try {
    // dataUrl 体积大，sessionStorage 仅存元信息 + 页图引用走内存
    sessionStorage.setItem(IMPORT_KEY, JSON.stringify({ name: deck.name, kind: deck.kind, pageCount: deck.pageCount, at: Date.now() }))
  } catch {}
}
export function readImportedDeck() {
  if (typeof window !== 'undefined' && window.__bubuImportedDeck) return window.__bubuImportedDeck
  return null
}

// 调试钩子：便于在桌面端直接验证导入管线
if (typeof window !== 'undefined') {
  window.__bubuImport = { renderPdfBytes, pickAndParse, classifyExt, stashImportedDeck, readImportedDeck }
}
