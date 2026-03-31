"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MatchAnalysis } from "./MatchAnalysis";
import { QuestionList } from "./QuestionList";
import type { GenerateResult } from "@/types";
import { Download, Loader2, FileText, ClipboardList } from "lucide-react";
import { generateMarkdown } from "@/lib/export";

interface ViewedInputs {
  resumeText: string;
  jdText: string;
}

type TabKey = "match" | "questions" | "inputs";

interface ResultsPanelProps {
  result?: GenerateResult | null;
  jdTitle: string;
  loading?: boolean;
  viewedInputs?: ViewedInputs | null;
}

export function ResultsPanel({ result, jdTitle, loading, viewedInputs }: ResultsPanelProps) {
  const [tab, setTab] = useState<TabKey>("match");

  const showInputsTab = !!viewedInputs;

  const handleExport = () => {
    if (!result) return;
    const title = jdTitle || "面试报告";
    const md = generateMarkdown(result, title);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `面试准备报告-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { key: TabKey; label: string; show: boolean }[] = [
    { key: "match", label: "匹配分析", show: true },
    { key: "questions", label: "面试题目", show: true },
    { key: "inputs", label: "原始输入", show: showInputsTab },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-4">
        {tabs.filter((t) => t.show).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition",
              tab === t.key
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {loading ? (
          <LoadingSkeleton tab={tab} />
        ) : tab === "inputs" && viewedInputs ? (
          <InputsView inputs={viewedInputs} />
        ) : result ? (
          tab === "match" ? (
            <MatchAnalysis data={result.matchAnalysis} />
          ) : tab === "questions" ? (
            <QuestionList questions={result.questions} />
          ) : null
        ) : null}
      </div>

      {/* Actions */}
      {result && !loading && tab !== "inputs" && (
        <div className="flex items-center justify-center border-t border-gray-100 px-4 py-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Download size={14} />
            导出 Markdown
          </button>
        </div>
      )}
    </div>
  );
}

function parseJDFields(jdText: string) {
  const jobTitleMatch = jdText.match(/岗位名称：(.+)/);
  const companyMatch = jdText.match(/公司：(.+)/);
  const descMatch = jdText.match(/岗位描述：\n?([\s\S]*)/);
  return {
    jobTitle: jobTitleMatch?.[1]?.trim() || "",
    company: companyMatch?.[1]?.trim() || "",
    description: descMatch?.[1]?.trim() || jdText,
  };
}

function InputsView({ inputs }: { inputs: ViewedInputs }) {
  const jd = parseJDFields(inputs.jdText);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <FileText size={14} className="text-indigo-500" />
          简历内容
        </h4>
        <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3.5 text-sm leading-relaxed text-gray-600">
          {inputs.resumeText}
        </pre>
      </div>
      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <ClipboardList size={14} className="text-indigo-500" />
          岗位信息
        </h4>
        <div className="space-y-3">
          {jd.jobTitle && (
            <div className="rounded-lg bg-gray-50 px-3.5 py-2.5">
              <span className="text-xs font-medium text-gray-400">岗位名称</span>
              <p className="text-sm text-gray-700">{jd.jobTitle}</p>
            </div>
          )}
          {jd.company && (
            <div className="rounded-lg bg-gray-50 px-3.5 py-2.5">
              <span className="text-xs font-medium text-gray-400">所在公司</span>
              <p className="text-sm text-gray-700">{jd.company}</p>
            </div>
          )}
          {jd.description && (
            <div className="rounded-lg bg-gray-50 px-3.5 py-2.5">
              <span className="text-xs font-medium text-gray-400">岗位描述</span>
              <pre className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {jd.description}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ tab }: { tab: TabKey }) {
  if (tab === "inputs") return null;
  return (
    <div className="animate-pulse">
      <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
        <Loader2 size={12} className="animate-spin" />
        正在生成{tab === "match" ? "匹配分析" : "面试题目"}...
      </div>
      {tab === "match" ? (
        <>
          <div className="mb-5 flex items-center gap-6">
            <div className="h-20 w-20 flex-shrink-0 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-2 rounded-full bg-gray-200" />
              <div className="h-3 w-40 rounded bg-gray-200" />
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="space-y-2 rounded-lg bg-gray-100 p-3.5">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-3/4 rounded bg-gray-200" />
            </div>
            <div className="space-y-2 rounded-lg bg-gray-100 p-3.5">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-200" />
            </div>
          </div>
          <div className="space-y-2 rounded-lg bg-gray-50 p-3.5">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-5/6 rounded bg-gray-200" />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-5 w-12 rounded-full bg-gray-200" />
                <div className="h-4 flex-1 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
