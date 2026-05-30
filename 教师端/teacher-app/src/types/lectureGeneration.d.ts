export type LectureMaterialType =
  | 'error_analysis'
  | 'typical_wrong_answer'
  | 'high_frequency_question'
  | 'excellent_answer'
  | 'school_resource'

export interface LectureMaterial {
  materialId: string
  homeworkId: string
  type: LectureMaterialType
  title: string
  description: string
  thumbnailUrl?: string
  selectedByDefault: boolean
  itemCount?: number
}

export interface LectureGenerationSettings {
  durationMinutes: number
  difficultyFocus: 'basic' | 'balanced' | 'advanced'
  layers: Array<'A' | 'B' | 'C'>
  includeVariantQuestions: boolean
  includeSchoolResources: boolean
  qualityChecks: {
    knowledgeCoverage: boolean
    anonymizeStudentCases: boolean
    hideStudentClassInfo: boolean
  }
}

export interface LectureOutlineSection {
  sectionId: string
  title: string
  order: number
  bullets: string[]
  sourceMaterialIds: string[]
}

export interface LecturePreviewPage {
  pageNo: number
  title: string
  thumbnailUrl?: string
}

export interface LectureGenerationRequest {
  homeworkId: string
  materialIds: string[]
  settings: LectureGenerationSettings
}

export interface LectureGenerationResponse {
  lectureId: string
  homeworkId: string
  status: 'generating' | 'ready' | 'failed'
  outline: LectureOutlineSection[]
  previewPages: LecturePreviewPage[]
  createdAt: string
}
