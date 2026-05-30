export type CoursewareSyncStatus = 'synced' | 'uploading' | 'failed'

export interface CoursewareItem {
  id: string
  title: string
  subject: string
  grade: string
  className: string
  textbook: string
  lesson: string
  pageCount: number
  updatedAt: string
  hasInteraction: boolean
  syncStatus: CoursewareSyncStatus
  thumbnailUrl?: string
}

export interface CoursewareListQuery {
  subject?: string
  grade?: string
  textbook?: string
  lesson?: string
  updatedFrom?: string
  updatedTo?: string
  hasInteraction?: boolean
  sortBy?: 'updatedAt' | 'pageCount'
  sortDirection?: 'asc' | 'desc'
  keyword?: string
  page: number
  pageSize: number
}

export interface CoursewareListState {
  status: 'ready' | 'loading' | 'empty' | 'error'
  items: CoursewareItem[]
  total: number
  selectedIds: string[]
  query: CoursewareListQuery
  errorMessage?: string
}

export interface CoursewareImportSettings {
  title: string
  subject: string
  grade: string
  lesson: string
  textbook: string
  classId: string
  autoDetectQuestions: boolean
  generateOutline: boolean
  uploadToCloud: boolean
}

export interface CoursewareImportTask {
  taskId: string
  fileName: string
  fileSize: number
  status: 'uploading' | 'parsing' | 'recognizing' | 'syncing' | 'done' | 'failed'
  uploadProgress: number
  parseProgress: number
  recognizedQuestionCount: number
  pageCount: number
  errorMessage?: string
}

export interface CoursewareImportState {
  status: 'idle' | 'validating' | 'uploading' | 'parsing' | 'done' | 'error'
  selectedFile?: {
    name: string
    size: number
    mimeType: string
  }
  settings: CoursewareImportSettings
  task?: CoursewareImportTask
  errorMessage?: string
}

export interface CloudSyncPanelState {
  status: 'ready' | 'loading' | 'empty' | 'error'
  success: Array<{ id: string; title: string; syncedAt: string }>
  uploading: Array<{ id: string; title: string; progress: number }>
  failed: Array<{ id: string; title: string; reason: string }>
  storage: {
    usedGb: number
    totalGb: number
    coursewareGb: number
    resourceGb: number
  }
}

export type InteractionComponentType = 'quiz' | 'pick' | 'typical'

export interface InteractionComponent {
  type: InteractionComponentType
  label: string
  description: string
  enabled: boolean
  mvp: boolean
}

export interface CoursewareEditPayload {
  title: string
  pages: Array<{
    pageNo: number
    title: string
    elements: Array<{
      id: string
      kind: 'text' | 'image' | 'shape' | 'formula' | 'chart' | 'table' | 'interaction'
      x: number
      y: number
      width?: number
      height?: number
      content?: string
    }>
  }>
  saveTarget: 'local' | 'cloud' | 'local_and_cloud'
}

export interface CoursewareInteractionPayload {
  pageNo: number
  componentType: InteractionComponentType
  triggerMode: 'manual' | 'page_enter_prompt' | 'page_enter_auto'
  questionSource?: 'teacher_manual' | 'question_bank' | 'xkw_api' | 'from_slide'
  settings: Record<string, string | number | boolean | string[]>
}
