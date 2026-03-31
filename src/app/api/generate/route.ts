import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLLMClient } from "@/lib/llm/client";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/llm/prompts";
import type { Difficulty } from "@/types";

export async function POST(request: NextRequest) {
  // Auth is optional — guests can generate without logging in
  const supabase = await createClient();
  await supabase.auth.getUser();

  try {
    const { resumeText, jdText, difficulty: rawDifficulty } = await request.json();
    const difficulty: Difficulty = ["easy", "medium", "hard"].includes(rawDifficulty) ? rawDifficulty : "medium";

    if (!resumeText || resumeText.length < 50) {
      return new Response(
        JSON.stringify({ error: "简历内容过短，请至少输入 50 个字符" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!jdText || jdText.length < 30) {
      return new Response(
        JSON.stringify({ error: "岗位描述过短，请至少输入 30 个字符" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = await getLLMClient().chat.completions.create({
      model: "qwen-plus",
      messages: [
        { role: "system", content: buildSystemPrompt(difficulty) },
        { role: "user", content: buildUserPrompt(resumeText, jdText) },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(content)}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e) {
          controller.enqueue(
            encoder.encode(
              `data: [ERROR] ${(e as Error).message}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "生成失败: " + (e as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
