export interface WhiteboardCloudCourseware {
  coursewareId: string
  title: string
  source: 'teacher_cloud' | 'local_import'
  totalPages: number
  currentPage: number
  syncedAt: string
}

export interface WhiteboardPageToolState {
  tool: 'select' | 'annotation' | 'highlighter' | 'laser' | 'magnifier' | 'fullscreen' | 'thumbnail'
  enabled: boolean
}

export interface WhiteboardPageThumbnail {
  page: number
  title: string
  type: 'cover' | 'lecture' | 'annotation' | 'interaction' | 'practice'
  thumbnailUrl?: string
}

export interface WhiteboardInteractionButton {
  id: 'push' | 'start_practice'
  label: string
  visible: boolean
  disabled?: boolean
}

export interface WhiteboardPlaybackState {
  courseware: WhiteboardCloudCourseware
  tools: WhiteboardPageToolState[]
  thumbnails: WhiteboardPageThumbnail[]
  interactionButtons: WhiteboardInteractionButton[]
}
