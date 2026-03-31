"use client";

import { useState, useCallback } from "react";
import { ResumeInput } from "@/components/workspace/ResumeInput";
import { JDInput } from "@/components/workspace/JDInput";
import type { JDFields } from "@/components/workspace/JDInput";
import { ResultsPanel } from "@/components/workspace/ResultsPanel";
import { useWorkspace } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { parseGenerateResult } from "@/lib/llm/parser";
import { Sparkles, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { GenerateResult, Difficulty } from "@/types";

const GUEST_STORAGE_KEY = "interviewai_guest_usage_count";
const GUEST_LIMIT = 3;

function getGuestUsageCount(): number {
  try {
    return parseInt(localStorage.getItem(GUEST_STORAGE_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function incrementGuestUsageCount(): number {
  try {
    const next = getGuestUsageCount() + 1;
    localStorage.setItem(GUEST_STORAGE_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

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
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const isGuest = !user;

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
  const guestRemaining = isGuest ? GUEST_LIMIT - getGuestUsageCount() : null;

  const handleGenerate = useCallback(async () => {
    if (!resumeText.trim() || !jdFields.description.trim()) {
      setError("请输入简历内容和岗位描述");
      return;
    }

    // Guest usage limit check
    if (isGuest && getGuestUsageCount() >= GUEST_LIMIT) {
      setShowLoginPrompt(true);
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
        body: JSON.stringify({ resumeText, jdText: composedJD, difficulty }),
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

      // Guest: increment usage count, skip auto-save
      if (isGuest) {
        incrementGuestUsageCount();
      } else {
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
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }, [resumeText, jdFields, difficulty, isGuest, addReport, setSelectedReportId, setViewedResult, setViewedTitle, setViewedInputs]);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Input Section */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ResumeInput value={resumeText} onChange={setResumeText} />
        <JDInput value={jdFields} onChange={setJdFields} />
      </div>

      {/* Difficulty Selector */}
      <div className="mb-3 flex items-center justify-center gap-0">
        {([
          { value: "easy" as Difficulty, label: "简易" },
          { value: "medium" as Difficulty, label: "适中" },
          { value: "hard" as Difficulty, label: "困难" },
        ]).map((opt, i) => (
          <button
            key={opt.value}
            onClick={() => setDifficulty(opt.value)}
            className={`px-4 py-1.5 text-xs font-medium transition border ${
              i === 0 ? "rounded-l-md" : i === 2 ? "rounded-r-md" : ""
            } ${
              difficulty === opt.value
                ? "bg-indigo-500 text-white border-indigo-500 z-10"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            } ${i > 0 ? "-ml-px" : ""}`}
          >
            {opt.label}
          </button>
        ))}
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
        {isGuest && guestRemaining !== null && (
          <p className="mt-2 text-xs text-gray-400">
            访客模式 &middot; 剩余 {guestRemaining} 次免费机会
          </p>
        )}
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

      {/* Guest Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
            <h3 className="mb-2 text-center text-lg font-semibold text-gray-800">
              免费次数已用完
            </h3>
            <p className="mb-5 text-center text-sm text-gray-500">
              您已使用 {GUEST_LIMIT} 次免费生成机会。注册账号即可无限使用，并保存历史记录。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/register")}
                className="flex-1 rounded-lg bg-indigo-500 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
              >
                立即注册
              </button>
              <button
                onClick={() => router.push("/login")}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                去登录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
