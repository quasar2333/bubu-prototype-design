import type { QuestionBankItem } from "./questionBank";

export type HomeworkSelectStep = "选题" | "排版" | "发布/保存";

export type HomeworkQuestionGroup = "计算题" | "解决问题";

export interface HomeworkSelectRouteState {
  homeworkName?: string;
  homeworkId?: string;
}

export interface HomeworkSelectFilterState {
  scene: "全部" | "作业" | "课后练习" | "单元测";
  type: "全部" | "选择题" | "填空题" | "判断题" | "计算题" | "解答题";
  difficulty: "全部" | "容易" | "中等" | "困难";
  source: "校本题库" | "近三年" | "本学期" | "只看新题";
  keyword: string;
}

export interface HomeworkSelectedQuestion extends QuestionBankItem {
  group: HomeworkQuestionGroup;
  order: number;
  checked: boolean;
}

export interface HomeworkQuestionBasketState {
  homeworkId?: string;
  selectedQuestionIds: string[];
  selectedCount: number;
  estimatedMinutes: number;
  groupStats: Array<{
    group: HomeworkQuestionGroup;
    selected: number;
    target: number;
  }>;
  ready: boolean;
  loading: boolean;
  empty: boolean;
}

export interface AddHomeworkQuestionsRequest {
  questionIds: string[];
  source: "question-bank";
}

export interface RemoveHomeworkQuestionsRequest {
  questionIds: string[];
}

export interface UpdateHomeworkQuestionOrderRequest {
  questionIds: string[];
}
