export type LearningAnalyticsStatus = 'waiting' | 'loading' | 'ready' | 'empty' | 'error'

export interface ClassAnalyticsMetric {
  key: 'weeklyAccuracy' | 'homeworkCompletionRate' | 'classParticipationRate' | 'weakKnowledgePointCount'
  label: string
  value: number | null
  unit: '%' | 'count'
  previousDelta?: number | null
}

export interface LearningTrendPoint {
  date: string
  accuracy: number | null
  participationRate: number | null
}

export interface KnowledgeMasterySummary {
  knowledgePointId: string
  knowledgePointName: string
  classAccuracy: number | null
  gradeAccuracy?: number | null
  weakStudentCount?: number | null
}

export interface StudentLearningSummary {
  studentId: string
  studentName: string
  avatarUrl?: string
  completionRate: number | null
  accuracy: number | null
  weakKnowledgePoints: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'unknown'
  latestTask?: string
}

export interface LearningReminder {
  reminderId: string
  type: 'common_weakness' | 'high_error_question' | 'missing_submission' | 'review_task'
  title: string
  count?: number
  items: Array<{
    label: string
    value?: string
  }>
}

export interface LearningMaterialRecommendation {
  materialId: string
  title: string
  tag: string
  description: string
  thumbnailUrl?: string
  usageCount?: number
}

export interface ClassLearningAnalyticsResponse {
  classId: string
  subject: string
  rangeStart: string
  rangeEnd: string
  status: LearningAnalyticsStatus
  generatedAt: string | null
  metrics: ClassAnalyticsMetric[]
  trends: LearningTrendPoint[]
  knowledgeMastery: KnowledgeMasterySummary[]
  students: StudentLearningSummary[]
  reminders: LearningReminder[]
  materialRecommendations: LearningMaterialRecommendation[]
}

export interface StudentLearningAnalyticsResponse {
  studentId: string
  status: LearningAnalyticsStatus
  metrics: ClassAnalyticsMetric[]
  trends: LearningTrendPoint[]
  knowledgeMastery: KnowledgeMasterySummary[]
  recentTasks: Array<{
    taskId: string
    title: string
    completedAt?: string
    accuracy: number | null
  }>
}
