export type ErrorAnalysisDataStatus = 'waiting' | 'loading' | 'ready' | 'empty' | 'error'

export interface ErrorAnalysisMetric {
  key: 'accuracy' | 'averageScore' | 'submissionRate' | 'highRiskStudents'
  label: string
  value: number | null
  unit: string
  previousDelta?: number | null
  hint?: string
}

export interface WrongCauseBucket {
  causeId: string
  causeName: string
  studentCount: number
  percentage: number
}

export interface KnowledgeMasteryCell {
  groupId: string
  groupName: string
  knowledgeId: string
  knowledgeName: string
  accuracy: number | null
}

export interface TypicalWrongAnswer {
  answerId: string
  anonymousStudentName: string
  causeName: string
  answerImageUrl: string
  questionId: string
  canAddToLecture: boolean
}

export interface StepTimingAnalysis {
  stepNo: number
  stepName: string
  averageDurationSeconds: number | null
  accuracy: number | null
  mainCauseName?: string
}

export interface LayerCauseComparison {
  causeId: string
  causeName: string
  layerRatios: {
    a: number | null
    b: number | null
    c: number | null
  }
}

export interface ErrorAnalysisInsight {
  id: string
  type: 'finding' | 'teaching_suggestion'
  title: string
  description: string
  sourceCauseIds?: string[]
}

export interface HomeworkErrorAnalysisResponse {
  homeworkId: string
  generatedAt: string | null
  status: ErrorAnalysisDataStatus
  metrics: ErrorAnalysisMetric[]
  wrongCauseBuckets: WrongCauseBucket[]
  knowledgeMastery: KnowledgeMasteryCell[]
  typicalWrongAnswers: TypicalWrongAnswer[]
  stepTiming: StepTimingAnalysis[]
  layerComparisons: LayerCauseComparison[]
  insights: ErrorAnalysisInsight[]
}
