"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface QuestionListProps {
  questions: Question[];
}

const categoryLabels: Record<string, string> = {
  "resume-deep-dive": "简历深挖",
  business: "业务题",
  industry: "行业题",
  technical: "技术题",
};

const categoryColors: Record<string, string> = {
  "resume-deep-dive": "bg-indigo-100 text-indigo-600",
  business: "bg-emerald-100 text-emerald-600",
  industry: "bg-amber-100 text-amber-600",
  technical: "bg-purple-100 text-purple-600",
};

export function QuestionList({ questions }: QuestionListProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {questions.map((q) => (
        <div
          key={q.id}
          className="overflow-hidden rounded-lg border border-gray-200"
        >
          <button
            onClick={() => setOpenId(openId === q.id ? null : q.id)}
            className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left text-sm font-medium text-gray-800 transition hover:bg-gray-50"
          >
            <ChevronRight
              size={14}
              className={cn(
                "flex-shrink-0 text-gray-400 transition-transform",
                openId === q.id && "rotate-90"
              )}
            />
            <span
              className={cn(
                "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                categoryColors[q.category] || "bg-gray-100 text-gray-600"
              )}
            >
              {categoryLabels[q.category] || q.category}
            </span>
            <span className="flex-1">{q.question}</span>
          </button>

          {openId === q.id && (
            <div className="border-t border-gray-100 px-3.5 py-3">
              <div className="mb-2.5">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  考察意图
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  {q.intent}
                </p>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  参考答案
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  {q.referenceAnswer}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
