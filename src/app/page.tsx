"use client";

import { Navbar } from "@/components/ui/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { Sparkles, Target, Download } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleCTA = () => {
    router.push(user ? "/dashboard" : "/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="px-6 pb-8 pt-16 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            AI 驱动的面试准备助手
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-gray-500">
            上传简历，粘贴岗位 JD，秒级生成定制化面试题目与匹配分析报告，助你高效备战每一场面试。
          </p>
          <button
            onClick={handleCTA}
            className="rounded-lg bg-indigo-500 px-8 py-3 text-sm font-medium text-white transition hover:bg-indigo-600"
          >
            立即开始 &rarr;
          </button>
          {!user && (
            <button
              onClick={() => router.push("/dashboard")}
              className="ml-3 rounded-lg border border-gray-300 px-8 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              访客试用
            </button>
          )}
        </section>

        {/* Features */}
        <section className="mx-auto grid max-w-3xl grid-cols-1 gap-5 px-6 pb-16 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
              <Sparkles size={20} className="text-indigo-500" />
            </div>
            <h3 className="mb-1.5 text-sm font-semibold text-gray-800">
              智能面试题
            </h3>
            <p className="text-xs leading-relaxed text-gray-500">
              基于简历与 JD 深度匹配，生成 8-12 道定制化问题，涵盖技术、行为、情景三大类别。
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <Target size={20} className="text-emerald-500" />
            </div>
            <h3 className="mb-1.5 text-sm font-semibold text-gray-800">
              精准匹配分析
            </h3>
            <p className="text-xs leading-relaxed text-gray-500">
              量化评估简历与 JD 的契合度，指出核心优势与潜在差距，帮你有的放矢。
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <Download size={20} className="text-amber-500" />
            </div>
            <h3 className="mb-1.5 text-sm font-semibold text-gray-800">
              一键导出 MD
            </h3>
            <p className="text-xs leading-relaxed text-gray-500">
              将完整报告导出为 Markdown 文件，便于复习、分享、打印，随时随地准备面试。
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-400">
        &copy; 2026 InterviewAI
      </footer>
    </div>
  );
}
