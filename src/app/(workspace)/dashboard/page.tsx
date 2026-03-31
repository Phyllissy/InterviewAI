"use client";

import { useState, useCallback } from "react";
import { ResumeInput } from "@/components/workspace/ResumeInput";
import { JDInput } from "@/components/workspace/JDInput";
import type { JDFields } from "@/components/workspace/JDInput";
import { ResultsPanel } from "@/components/workspace/ResultsPanel";
import { useWorkspace } from "../layout";
import { parseGenerateResult } from "@/lib/llm/parser";
import { Sparkles, Loader2 } from "lucide-react";
import type { GenerateResult } from "@/types";

function composeJDText(fields: JDFields): string {
  const parts: string[] = [];
  if (fields.jobTitle) parts.push(`岗位名称：${fields.jobTitle}`);
  if (fields.company) parts.push(`公司：${fields.company}`);
  if (fields.description) parts.push(`岗位描述：\n${fields.description}`);
  return parts.join("\n");
}

export default function DashboardPage() {
  const [resumeText, setResumeText] = useState("");
  const [jdFields, setJdFields] = useState<JDFields>({
    jobTitle: "",
    company: "",
    description: "",
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState("");

  const {
    viewedResult,
    selectedReportId,
    viewedTitle,
    viewedInputs,
    addReport,
    setSelectedReportId,
    setViewedResult,
    setViewedTitle,
    setViewedInputs,
  } = useWorkspace();

  const isViewingHistory = !!selectedReportId;
  const displayResult = isViewingHistory ? viewedResult : result;

  const jdTitle = jdFields.jobTitle || "面试报告";

  const handleGenerate = useCallback(async () => {
    if (!resumeText.trim() || !jdFields.description.trim()) {
      setError("请输入简历内容和岗位描述");
      return;
    }

    setError("");
    setGenerating(true);
    setResult(null);

    // Clear history viewing state so loading shows for new generation
    setSelectedReportId(null);
    setViewedResult(null);
    setViewedTitle("");
    setViewedInputs(null);

    try {
      const composedJD = composeJDText(jdFields);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jdText: composedJD }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "生成失败");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              accumulated += JSON.parse(data);
            } catch {
              accumulated += data;
            }
          }
        }
      }

      const parsed = parseGenerateResult(accumulated);
      setResult(parsed);

      // Auto-save via API route (server correctly sets user_id)
      const title = [jdFields.company, jdFields.jobTitle].filter(Boolean).join(" - ") || "面试报告";
      const saveRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          resume_text: resumeText,
          jd_text: composedJD,
          match_analysis: parsed.matchAnalysis,
          questions: parsed.questions,
        }),
      });

      if (saveRes.ok) {
        const saved = await saveRes.json();
        addReport(saved);
        // Auto-select the new report in sidebar
        setSelectedReportId(saved.id);
        setViewedResult(parsed);
        setViewedTitle(title);
        setViewedInputs({ resumeText, jdText: composedJD });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }, [resumeText, jdFields, addReport, setSelectedReportId, setViewedResult, setViewedTitle, setViewedInputs]);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Input Section */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ResumeInput value={resumeText} onChange={setResumeText} />
        <JDInput value={jdFields} onChange={setJdFields} />
      </div>

      {/* Generate Button */}
      <div className="mb-5 text-center">
        {error && (
          <div className="mb-3 inline-block rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-8 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                生成面试题
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {(generating || displayResult) && (
        <ResultsPanel
          result={displayResult}
          jdTitle={isViewingHistory ? (viewedTitle || "面试报告") : jdTitle}
          loading={generating}
          viewedInputs={isViewingHistory ? viewedInputs : null}
        />
      )}
    </div>
  );
}
