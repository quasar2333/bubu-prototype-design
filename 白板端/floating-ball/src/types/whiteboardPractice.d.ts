export type StudentAnswerStatus = 'correct' | 'wrong' | 'partial' | 'pending'

export interface WhiteboardPracticeSession {
  sessionId: string
  classroomSessionId: string
  coursewareId: string
  page: number
  title: string
  pushedToTablet: boolean
  elapsedSeconds: number
  submittedCount: number
  totalStudents: number
  answers: StudentPracticeAnswer[]
}

export interface StudentPracticeAnswer {
  studentId: string
  studentName: string
  seatNumber: number
  status: StudentAnswerStatus
  submittedAt?: string
  thumbnailUrl?: string
}

export interface WhiteboardPracticePushRequest {
  classroomSessionId: string
  coursewareId: string
  page: number
  questionIds: string[]
  durationSeconds: number
}

export interface QuickReviewAction {
  sessionId: string
  studentId: string
  status: Exclude<StudentAnswerStatus, 'partial'> | 'partial'
  score?: number
  comment?: string
}
