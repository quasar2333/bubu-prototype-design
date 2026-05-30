export interface WhiteboardLearningFeedback {
  sessionId: string
  correctRate: number
  submittedCount: number
  totalStudents: number
  typicalError: string
  optionDistribution: OptionDistributionItem[]
}

export interface OptionDistributionItem {
  option: string
  count: number
  isCorrect?: boolean
}

export interface StudentCaseShowcase {
  sessionId: string
  studentId: string
  studentName: string
  answerImageUrl: string
  teacherAnnotation: string
  compareStudentId?: string
}

export interface RandomStudentResult {
  classroomSessionId: string
  studentId: string
  studentName: string
  groupName: string
  seatNumber: number
  recentSubmissionStatus: 'submitted' | 'pending' | 'absent'
}
