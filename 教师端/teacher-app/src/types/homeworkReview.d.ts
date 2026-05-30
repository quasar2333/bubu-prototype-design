export type SubmissionReviewStatus = 'pending' | 'reviewed' | 'needs_review'

export interface HomeworkSubmissionSummary {
  submissionId: string
  studentId: string
  studentName: string
  status: SubmissionReviewStatus
  submittedAt: string
}

export interface HandwritingStepThumbnail {
  stepNo: number
  title: string
  imageUrl?: string
  note?: string
}

export interface ObjectiveAutoGradeResult {
  questionId: string
  correct: boolean
  score: number
  maxScore: number
}

export interface SubmissionReviewDetail {
  submissionId: string
  homeworkId: string
  studentId: string
  studentName: string
  questionNo: number
  answerImageUrl?: string
  handwritingSteps: HandwritingStepThumbnail[]
  objectiveResults: ObjectiveAutoGradeResult[]
  subjectiveAnswerText?: string
  teacherComment?: string
  score?: number
  maxScore: number
}

export interface SubmissionGradePayload {
  score: number
  mark: 'correct' | 'partial' | 'wrong'
  comment: string
  rubricItems: Array<{
    key: string
    selected: boolean
    score: number
  }>
}

export interface HomeworkReviewState {
  status: 'ready' | 'loading' | 'empty' | 'error'
  submissions: HomeworkSubmissionSummary[]
  activeSubmission?: SubmissionReviewDetail
  selectedStatus: 'all' | SubmissionReviewStatus
  errorMessage?: string
}
