export type QuestionType = "选择题" | "填空题" | "判断题" | "计算题" | "解答题" | "应用题";

export type QuestionDifficulty = "容易" | "适中" | "困难";

export interface TextbookMeta {
  subject: string;
  publisher: string;
  grade: string;
  volume: string;
}

export interface CatalogKnowledgeSection {
  id: string;
  title: string;
  knowledgePoints: string[];
}

export interface CatalogChapter {
  id: string;
  number: number;
  title: string;
  sections: CatalogKnowledgeSection[];
}

export interface QuestionBankItem {
  id: string;
  number: number;
  content: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  knowledgePoints: string[];
  source: string;
  scene: string;
  estimatedMinutes: number;
  score: number;
}

export interface QuestionBankQuery {
  textbookId?: string;
  chapterId?: string;
  sectionId?: string;
  knowledgePoint?: string;
  scene?: string;
  type?: QuestionType | "全部";
  difficulty?: QuestionDifficulty | "全部";
  keyword?: string;
  year?: string[];
  region?: string[];
  source?: string[];
  abilityDimension?: string[];
  sort?: "综合" | "最新" | "热门";
  page?: number;
  pageSize?: number;
}

export interface QuestionBasketSummary {
  total: number;
  totalScore: number;
  estimatedMinutes: number;
  difficulty: QuestionDifficulty;
  typeStats: Array<{
    type: QuestionType;
    selected: number;
    target: number;
  }>;
}

export interface AddQuestionToBasketRequest {
  homeworkId?: string;
  basketId?: string;
  questionIds: string[];
}

export interface AiRecommendRequest {
  mode: "按章节均衡" | "按难度递进" | "按能力维度";
  textbookId: string;
  selectedQuestionIds: string[];
  targetCount?: number;
}
