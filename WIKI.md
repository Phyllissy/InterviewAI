# InterviewAI Wiki

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 产品功能](#2-产品功能)
  - [2.1 简历-JD 匹配分析](#21-简历-jd-匹配分析)
  - [2.2 智能面试题生成](#22-智能面试题生成)
  - [2.3 难度分级](#23-难度分级)
  - [2.4 访客模式](#24-访客模式)
  - [2.5 历史记录管理](#25-历史记录管理)
  - [2.6 Markdown 导出](#26-markdown-导出)
  - [2.7 意见反馈](#27-意见反馈)
- [3. 技术架构](#3-技术架构)
  - [3.1 整体架构](#31-整体架构)
  - [3.2 技术栈](#32-技术栈)
  - [3.3 目录结构](#33-目录结构)
- [4. 核心模块详解](#4-核心模块详解)
  - [4.1 认证系统](#41-认证系统)
  - [4.2 LLM 集成](#42-llm-集成)
  - [4.3 SSE 流式传输](#43-sse-流式传输)
  - [4.4 简历解析](#44-简历解析)
  - [4.5 Prompt 工程](#45-prompt-工程)
  - [4.6 数据库设计](#46-数据库设计)
- [5. API 接口文档](#5-api-接口文档)
- [6. 本地开发指南](#6-本地开发指南)
- [7. 部署指南](#7-部署指南)

---

## 1. 项目概述

**InterviewAI** 是一款 AI 驱动的面试准备助手，帮助求职者高效备战面试。用户上传简历并输入目标岗位信息后，系统基于大语言模型自动生成简历-JD 匹配分析报告和定制化面试问题。

**在线体验**：[https://interview-ai-5qjq.vercel.app](https://interview-ai-5qjq.vercel.app)

> ⚠️ 由于部署在 Vercel 上，国内访问需要翻墙。

**核心价值**：
- 针对具体岗位生成个性化面试题，避免盲目准备
- 量化简历与 JD 的匹配度，明确优势和差距
- 提供参考答案思路，降低准备成本

---

## 2. 产品功能

### 2.1 简历-JD 匹配分析

上传简历和岗位描述后，系统自动输出匹配分析报告：

| 分析项 | 说明 |
|--------|------|
| 匹配度评分 | 0-100 分，客观反映简历与 JD 的契合程度 |
| 核心优势 | 3-5 条，引用简历中的具体技能或经历 |
| 潜在差距 | 2-4 条，JD 要求但简历未体现的能力 |
| 综合评估 | 2-3 句整体评价 |

### 2.2 智能面试题生成

根据简历和 JD 生成 6-12 道定制化面试题，覆盖四大类别：

| 类别 | 题数 | 说明 |
|------|------|------|
| 简历深挖 | 4-6 题 | 围绕核心项目经历层层追问（角色 → 过程 → 难点 → 反思） |
| 业务场景 | 1-2 题 | 从 JD 核心业务领域出发，考察岗位理解和落地能力 |
| 行业认知 | 1-2 题 | 考察行业趋势、竞争格局、技术影响等宏观认知 |
| 技术理解 | 0-2 题 | 条件生成，仅当 JD/简历涉及技术内容时出现 |

每道题目包含：
- **问题**：具体面试问题
- **考察意图**：面试官出题目的
- **参考答案**：优秀回答应包含的要点和思路

### 2.3 难度分级

支持三档难度选择，影响题目数量和深度：

| 难度 | 总题数 | 特点 |
|------|--------|------|
| 简易 | 6-8 题 | 问题偏基础，避免深入追问，适合初次准备 |
| 适中（默认） | 8-10 题 | 平衡深度与难度，适合大多数面试场景 |
| 困难 | 10-12 题 | 深度追问链，考验临场应变，适合高阶岗位 |

### 2.4 访客模式

- 无需注册即可访问工作台
- 提供 **3 次免费生成**机会（基于 localStorage 计数）
- 访客不保存历史记录，不显示侧边栏
- 达到上限后弹出登录/注册提示

### 2.5 历史记录管理

登录用户的每次生成自动保存，支持：
- **查看**：点击侧边栏记录，展示完整结果和原始输入
- **收藏**：星标置顶重要记录
- **重命名**：自定义记录名称（默认为"公司 - 岗位名称"）
- **删除**：移除不需要的记录

### 2.6 Markdown 导出

一键导出完整面试准备报告，包含：
- 目标岗位和导出时间
- 匹配度评分和分析
- 全部面试题、考察意图、参考答案

### 2.7 意见反馈

页面右下角悬浮反馈按钮，支持：
- 登录用户和访客均可提交
- 反馈内容存入数据库，记录用户信息（如有）
- 管理员在 Supabase 后台查看所有反馈

---

## 3. 技术架构

### 3.1 整体架构

```
┌──────────────────────────────────────────────────────┐
│                     Client (Browser)                  │
│  Next.js App Router + React 19 + Tailwind CSS v4     │
│  ┌─────────┐ ┌──────────┐ ┌────────────────────────┐ │
│  │ Landing  │ │ Auth     │ │ Workspace              │ │
│  │ Page     │ │ Login    │ │ Dashboard + Sidebar    │ │
│  │          │ │ Register │ │ Results + Export        │ │
│  └─────────┘ └──────────┘ └────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│                  API Routes (Serverless)               │
│  /api/generate    → SSE 流式生成面试题                  │
│  /api/parse-resume → PDF/TXT 简历文本提取               │
│  /api/reports     → 历史记录 CRUD                      │
│  /api/reports/[id] → 单条记录操作                       │
│  /api/feedback    → 用户反馈提交                        │
├──────────────────────────────────────────────────────┤
│                    LLM Service                         │
│  通义千问 qwen-plus (DashScope API)                     │
│  OpenAI-compatible SDK + Server-Sent Events            │
├──────────────────────────────────────────────────────┤
│                    Supabase                             │
│  PostgreSQL │ Auth (Email/Password) │ RLS Policies     │
│  Tables: reports, feedback                             │
├──────────────────────────────────────────────────────┤
│                    Vercel                               │
│  GitHub auto-deploy │ Serverless Functions              │
└──────────────────────────────────────────────────────┘
```

### 3.2 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 15 (App Router) | 基于 React Server Components 的全栈框架 |
| UI 框架 | React 19 + Tailwind CSS v4 | 组件化开发 + 原子化 CSS |
| 图标 | Lucide React | 轻量 SVG 图标库 |
| 认证 | Supabase Auth | Email/Password 认证，SSR cookie session |
| 数据库 | Supabase PostgreSQL | 行级安全（RLS）隔离用户数据 |
| 大模型 | 通义千问 qwen-plus | 阿里云 DashScope API，OpenAI SDK 兼容 |
| PDF 解析 | unpdf | 轻量 PDF 文本提取，兼容 Turbopack/Vercel |
| 部署 | Vercel | GitHub 推送自动部署 |

### 3.3 目录结构

```
src/
├── app/                          # Next.js App Router 页面
│   ├── layout.tsx                # 根布局（AuthProvider + FeedbackButton）
│   ├── page.tsx                  # 首页 Landing Page
│   ├── globals.css               # 全局样式
│   ├── (auth)/                   # 认证路由组
│   │   ├── layout.tsx            # 认证页面布局
│   │   ├── login/page.tsx        # 登录页
│   │   └── register/page.tsx     # 注册页
│   ├── (workspace)/              # 工作台路由组
│   │   ├── layout.tsx            # 工作台布局（侧边栏 + Context）
│   │   └── dashboard/page.tsx    # 主工作台（输入 + 生成 + 结果）
│   └── api/                      # API 路由
│       ├── generate/route.ts     # LLM 生成（SSE 流式）
│       ├── parse-resume/route.ts # 简历解析
│       ├── reports/route.ts      # 报告列表 + 创建
│       ├── reports/[id]/route.ts # 单条报告操作
│       └── feedback/route.ts     # 反馈提交
├── components/                   # React 组件
│   ├── auth/                     # 认证组件
│   │   ├── AuthProvider.tsx      # 全局认证 Context
│   │   ├── LoginForm.tsx         # 登录表单
│   │   └── RegisterForm.tsx      # 注册表单
│   ├── sidebar/
│   │   └── HistorySidebar.tsx    # 历史记录侧边栏
│   ├── ui/
│   │   ├── Navbar.tsx            # 顶部导航栏
│   │   └── FeedbackButton.tsx    # 反馈悬浮球
│   └── workspace/                # 工作台组件
│       ├── ResumeInput.tsx       # 简历输入（上传/粘贴）
│       ├── JDInput.tsx           # 岗位描述输入（三字段）
│       ├── ResultsPanel.tsx      # 结果面板（标签页切换）
│       ├── MatchAnalysis.tsx     # 匹配分析展示
│       └── QuestionList.tsx      # 面试题列表展示
├── lib/                          # 工具库
│   ├── llm/
│   │   ├── client.ts             # LLM 客户端（懒加载单例）
│   │   ├── prompts.ts            # 系统/用户提示词构建
│   │   └── parser.ts             # LLM 响应 JSON 解析
│   ├── supabase/
│   │   ├── client.ts             # 浏览器端 Supabase 客户端
│   │   ├── server.ts             # 服务端 Supabase 客户端
│   │   └── middleware.ts         # Session 管理中间件
│   ├── pdf.ts                    # PDF 文本提取
│   ├── export.ts                 # Markdown 导出
│   └── utils.ts                  # 工具函数（cn）
├── middleware.ts                 # Next.js 中间件入口
└── types/
    └── index.ts                  # TypeScript 类型定义
```

---

## 4. 核心模块详解

### 4.1 认证系统

**文件**：`components/auth/AuthProvider.tsx`、`lib/supabase/`

采用 Supabase Auth 实现 Email/Password 认证：

- **AuthProvider** 通过 React Context 全局提供 `user`、`loading`、`signOut` 状态
- **SSR Session**：`lib/supabase/middleware.ts` 在中间件层面管理 cookie session，确保服务端和客户端会话同步
- **路由保护**：已登录用户访问 `/login`、`/register` 自动重定向到 `/dashboard`
- **访客支持**：`/dashboard` 对未登录用户开放，工作台根据 `user` 状态条件渲染侧边栏

### 4.2 LLM 集成

**文件**：`lib/llm/client.ts`

使用通义千问 (qwen-plus) 模型，通过 DashScope API 调用：

- 基于 OpenAI SDK 的兼容模式，`baseURL` 指向 DashScope 端点
- **懒加载单例**：`getLLMClient()` 在首次调用时创建实例，避免构建阶段因环境变量缺失报错

```typescript
// 懒加载，避免 Vercel 构建时报错
export function getLLMClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY!,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });
  }
  return _client;
}
```

### 4.3 SSE 流式传输

**文件**：`app/api/generate/route.ts`、`app/(workspace)/dashboard/page.tsx`

LLM 响应通过 Server-Sent Events (SSE) 流式返回：

**服务端**（API Route）：
- 通过 `ReadableStream` 构建 SSE 响应
- 每个 chunk 通过 `JSON.stringify()` 编码，防止内容中的换行符破坏 SSE 协议

```typescript
controller.enqueue(encoder.encode(`data: ${JSON.stringify(content)}\n\n`));
```

**客户端**（Dashboard）：
- 使用 `ReadableStream.getReader()` 逐块读取
- 每个 data 行通过 `JSON.parse()` 解码还原

```typescript
try {
  accumulated += JSON.parse(data);
} catch {
  accumulated += data;
}
```

### 4.4 简历解析

**文件**：`lib/pdf.ts`、`app/api/parse-resume/route.ts`

- 支持 PDF 和 TXT 两种格式，文件大小限制 5MB
- PDF 解析使用 `unpdf` 库（替代了 `pdf-parse`，解决 Turbopack 环境下 worker 文件缺失问题）
- TXT 文件直接读取文本内容

### 4.5 Prompt 工程

**文件**：`lib/llm/prompts.ts`

提示词系统采用**参数化模板**设计：

- `buildSystemPrompt(difficulty)` 根据难度动态生成系统提示词
- `DIFFICULTY_CONFIG` 配置表定义每个难度的题目数量和风格要求
- 提示词全部使用中文（通义千问对中文理解更好）
- 输出格式严格约束为 JSON 结构

**LLM 响应解析**（`lib/llm/parser.ts`）包含多层容错：
1. 剥离 `<think>` 思考标签（通义千问特有）
2. 剥离 Markdown 代码块包裹
3. 修复尾逗号
4. JSON 边界提取（找到最外层 `{...}`）

### 4.6 数据库设计

**文件**：`supabase/migrations/`

#### reports 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 自动生成 |
| user_id | UUID (FK) | 关联 auth.users |
| title | TEXT | 记录标题（默认"公司 - 岗位名称"） |
| resume_text | TEXT | 简历原文 |
| jd_text | TEXT | 岗位描述原文 |
| match_analysis | JSONB | 匹配分析结果 |
| questions | JSONB | 面试题列表 |
| is_favorited | BOOLEAN | 是否收藏 |
| created_at | TIMESTAMPTZ | 创建时间 |

**RLS 策略**：用户只能操作自己的记录（`auth.uid() = user_id`）

#### feedback 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 自动生成 |
| feedback_text | TEXT | 反馈内容 |
| user_id | UUID (nullable) | 登录用户 ID，访客为 null |
| user_email | TEXT (nullable) | 登录用户邮箱 |
| target_email | TEXT | 接收邮箱（默认管理员邮箱） |
| created_at | TIMESTAMPTZ | 创建时间 |

**RLS 策略**：INSERT 对所有人开放（含访客），无 SELECT 策略（仅管理员后台可查看）

---

## 5. API 接口文档

### POST /api/generate

生成面试题（SSE 流式响应）。

**请求体**：
```json
{
  "resumeText": "简历全文...",
  "jdText": "岗位名称：...\n公司：...\n岗位描述：...",
  "difficulty": "easy" | "medium" | "hard"
}
```

**响应**：`text/event-stream`
```
data: "第一段内容..."

data: "第二段内容..."

data: [DONE]
```

### POST /api/parse-resume

解析简历文件。

**请求体**：`multipart/form-data`，字段 `resume`（PDF/TXT，最大 5MB）

**响应**：
```json
{ "text": "提取的简历文本..." }
```

### GET /api/reports

获取当前用户的历史记录列表（需登录）。

**响应**：
```json
[
  { "id": "uuid", "title": "标题", "is_favorited": false, "created_at": "2026-..." }
]
```

### POST /api/reports

保存新报告（需登录）。

**请求体**：
```json
{
  "title": "公司 - 岗位",
  "resume_text": "...",
  "jd_text": "...",
  "match_analysis": { "score": 85, "strengths": [], "gaps": [], "summary": "" },
  "questions": [...]
}
```

### PATCH /api/reports/[id]

更新报告（重命名或收藏切换）。

**请求体**：
```json
{ "title": "新标题" }
```
或
```json
{ "is_favorited": true }
```

### DELETE /api/reports/[id]

删除指定报告。

### POST /api/feedback

提交反馈（登录用户和访客均可）。

**请求体**：
```json
{ "feedbackText": "反馈内容..." }
```

---

## 6. 本地开发指南

### 环境要求
- Node.js 18+
- npm / yarn / pnpm
- Supabase 项目（免费即可）
- DashScope API Key（阿里云）

### 安装与启动

```bash
# 克隆项目
git clone git@github.com:Phyllissy/InterviewAI.git
cd InterviewAI

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 填写以下变量：
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# DASHSCOPE_API_KEY

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 数据库初始化

在 Supabase SQL Editor 中依次执行：
1. `supabase/migrations/001_create_reports.sql`
2. `supabase/migrations/002_create_feedback.sql`

---

## 7. 部署指南

### Vercel 部署

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 中导入 GitHub 仓库
3. 在 **Settings > Environment Variables** 中配置：

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公开 Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端 Key |
| `DASHSCOPE_API_KEY` | 通义千问 API Key |

4. 部署完成后，后续每次推送到 `main` 分支会自动触发重新部署
