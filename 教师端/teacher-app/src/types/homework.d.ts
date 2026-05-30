export type HomeworkStatus = 'draft' | 'published_reviewing' | 'review_pending' | 'closed'

export interface ClassOption {
  id: string
  name: string
  studentCount: number
}

export interface HomeworkListItem {
  id: string
  name: string
  className: string
  classId?: string
  questionCount: number
  deadline: string
  submitCount: number
  reviewedCount: number
  studentCount: number
  status: HomeworkStatus
}

export interface HomeworkListQuery {
  status?: HomeworkStatus
  classId?: string
  startDate?: string
  endDate?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface CreateHomeworkRequest {
  name: string
  description?: string
}

export interface CreateHomeworkResponse {
  id: string
  name: string
  status: 'draft'
  nextStep: 'select_questions'
}

export interface UpdateHomeworkRequest {
  name?: string
  description?: string
  deadline?: string
}
