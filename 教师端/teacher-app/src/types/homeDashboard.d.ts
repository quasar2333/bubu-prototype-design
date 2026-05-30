export interface TeacherProfile {
  id: string;
  name: string;
  school: string;
  classes: Array<{
    id: string;
    name: string;
    subject: string;
  }>;
}

export interface TeacherProfileState {
  data: TeacherProfile | null;
  ready: boolean;
  loading: boolean;
  empty: boolean;
}

export interface TodayScheduleItem {
  id: string;
  className: string;
  subject: string;
  period: string;
  timeRange: string;
  title: string;
  coursewareId?: string;
}

export interface TodayScheduleState {
  items: TodayScheduleItem[];
  ready: boolean;
  loading: boolean;
  empty: boolean;
}

export interface TodoSummary {
  pendingHomeworkReviews: number;
  pendingHomeworkClasses: number;
  unpublishedHomework: number;
  notStartedInteractions: number;
  ready: boolean;
  loading: boolean;
  empty: boolean;
}

export interface RecentCoursewareItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  thumbnailUrl?: string;
  updatedAt: string;
}

export interface RecentCoursewareState {
  items: RecentCoursewareItem[];
  ready: boolean;
  loading: boolean;
  empty: boolean;
}

export interface AnalyticsAlertSummary {
  weakKnowledgePoint: {
    title: string;
    description: string;
    declinePercent: number;
  };
  highErrorQuestions: number;
  missingSubmitStudents: number;
}

export interface AnalyticsAlertState {
  data: AnalyticsAlertSummary | null;
  ready: boolean;
  loading: boolean;
  empty: boolean;
}
