import type { GenerateResult } from "@/types";

export function generateMarkdown(result: GenerateResult, title?: string): string {
  const now = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
  const { matchAnalysis, questions } = result;

  const lines: string[] = [
    "# 面试准备报告",
    "",
    `**生成时间:** ${now}`,
  ];

  if (title) {
    lines.push(`**目标岗位:** ${title}`);
  }

  lines.push("", "---", "", "## 简历-JD 匹配分析", "");
  lines.push(`**匹配度评分: ${matchAnalysis.score} / 100**`, "");

  lines.push("### 核心优势", "");
  matchAnalysis.strengths.forEach((s) => lines.push(`- ${s}`));

  lines.push("", "### 潜在差距", "");
  matchAnalysis.gaps.forEach((g) => lines.push(`- ${g}`));

  lines.push("", "### 综合评估", "");
  lines.push(matchAnalysis.summary);

  lines.push("", "---", "", "## 面试题目", "");

  const categoryLabels: Record<string, string> = {
    "resume-deep-dive": "简历深挖",
    business: "业务题",
    industry: "行业题",
    technical: "技术题",
  };

  questions.forEach((q, i) => {
    const label = categoryLabels[q.category] || q.category;
    lines.push(`### 问题 ${i + 1} - [${label}]`, "");
    lines.push(`**Q:** ${q.question}`, "");
    lines.push(`**考察意图:** ${q.intent}`, "");
    lines.push(`**参考答案:** ${q.referenceAnswer}`, "");
  });

  return lines.join("\n");
}
