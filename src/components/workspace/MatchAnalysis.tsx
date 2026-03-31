"use client";

import type { MatchAnalysis as MatchAnalysisType } from "@/types";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface MatchAnalysisProps {
  data: MatchAnalysisType;
}

export function MatchAnalysis({ data }: MatchAnalysisProps) {
  return (
    <div>
      {/* Score */}
      <div className="mb-5 flex items-center gap-6">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-500">
              {data.score}
            </div>
            <div className="text-xs text-gray-400">/ 100</div>
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${data.score}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            简历与岗位 JD 匹配度 {data.score}%
            {data.score >= 80
              ? "，整体契合度较高"
              : data.score >= 60
                ? "，部分契合"
                : "，差距较大"}
          </p>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-emerald-50/70 p-3.5">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
            <CheckCircle size={14} />
            核心优势
          </h4>
          <ul className="space-y-1">
            {data.strengths.map((s, i) => (
              <li key={i} className="text-xs leading-relaxed text-gray-700">
                &bull; {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-amber-50/70 p-3.5">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-600">
            <AlertTriangle size={14} />
            潜在差距
          </h4>
          <ul className="space-y-1">
            {data.gaps.map((g, i) => (
              <li key={i} className="text-xs leading-relaxed text-gray-700">
                &bull; {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-gray-50 p-3.5">
        <h4 className="mb-1.5 text-sm font-semibold text-gray-700">
          综合评估
        </h4>
        <p className="text-sm leading-relaxed text-gray-500">{data.summary}</p>
      </div>
    </div>
  );
}
