export interface MatchAnalysis {
  score: number;
  strengths: string[];
  gaps: string[];
  summary: string;
}

export interface Question {
  id: number;
  category: "resume-deep-dive" | "business" | "industry" | "technical";
  question: string;
  intent: string;
  referenceAnswer: string;
}

export interface GenerateResult {
  matchAnalysis: MatchAnalysis;
  questions: Question[];
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  resume_text: string;
  jd_text: string;
  match_analysis: MatchAnalysis;
  questions: Question[];
  is_favorited: boolean;
  created_at: string;
}

export interface ReportSummary {
  id: string;
  title: string;
  is_favorited: boolean;
  created_at: string;
}
