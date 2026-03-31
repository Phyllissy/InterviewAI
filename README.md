# InterviewAI

AI 驱动的面试准备助手，帮助求职者高效备战每一场面试。

> **在线体验**：[https://interview-ai-5qjq.vercel.app](https://interview-ai-5qjq.vercel.app)
> 
> ⚠️ 注意：由于部署在 Vercel 上，国内访问需要翻墙。

---

## 产品简介

InterviewAI 是一款基于大语言模型的面试辅助工具。用户上传简历、输入目标岗位信息后，系统会自动分析简历与岗位的匹配程度，并生成针对性的面试问题与参考答案，帮助用户快速了解自身优劣势、高效准备面试。

---

## 核心功能

### 简历-JD 匹配分析
- 量化评估简历与岗位描述的契合度（0-100 分）
- 指出核心优势与潜在差距
- 给出综合评价与建议

### 智能面试题生成
根据简历内容和岗位要求，生成 6-12 道定制化面试问题，涵盖四大类别：
- **简历深挖**：围绕核心项目经历层层追问
- **业务场景**：考察对目标岗位的理解和落地能力
- **行业认知**：评估行业趋势洞察与竞争格局理解
- **技术理解**：针对技术相关岗位考察技术概念与应用

### 难度分级
支持三档难度选择：
- **简易模式**：适合初次准备，问题偏基础
- **适中模式**：平衡深度与难度，适合大多数场景
- **困难模式**：深度追问，适合高阶岗位准备

### 其他功能
- **访客试用**：无需注册即可体验 3 次免费生成
- **历史记录**：自动保存生成记录，支持收藏、重命名、删除
- **原始输入查看**：回顾历史记录时可查看当时的简历和 JD
- **Markdown 导出**：一键导出完整报告，便于复习与分享
- **意见反馈**：全局悬浮按钮，随时提交使用反馈

---

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js 15 (App Router) + React 19 + Tailwind CSS v4       │
├─────────────────────────────────────────────────────────────┤
│                        Backend                               │
│  Next.js API Routes (Serverless Functions)                  │
│  - /api/generate (SSE streaming)                            │
│  - /api/parse-resume (PDF/TXT extraction)                   │
│  - /api/reports (CRUD)                                      │
│  - /api/feedback                                            │
├─────────────────────────────────────────────────────────────┤
│                      LLM Service                             │
│  通义千问 (Qwen) via DashScope API                           │
│  OpenAI-compatible SDK + SSE streaming                      │
├─────────────────────────────────────────────────────────────┤
│                       Database                               │
│  Supabase (PostgreSQL + Auth + RLS)                         │
│  - auth.users (built-in)                                    │
│  - reports (user history)                                   │
│  - feedback (user feedback)                                 │
├─────────────────────────────────────────────────────────────┤
│                      Deployment                              │
│  Vercel (auto-deploy from GitHub)                           │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术选型 |
|------|----------|
| 框架 | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| 认证 | Supabase Auth (Email/Password) |
| 数据库 | Supabase PostgreSQL + RLS |
| LLM | 通义千问 (qwen-plus) via DashScope |
| PDF 解析 | unpdf |
| 部署 | Vercel |

---

## 本地开发

### 环境要求
- Node.js 18+
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DASHSCOPE_API_KEY=your_dashscope_api_key
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

---

## 数据库迁移

在 Supabase SQL Editor 中依次执行：

1. `supabase/migrations/001_create_reports.sql` — 创建 reports 表
2. `supabase/migrations/002_create_feedback.sql` — 创建 feedback 表

---

## License

MIT
