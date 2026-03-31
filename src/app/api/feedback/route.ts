import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const { feedbackText } = await request.json();

    if (!feedbackText || typeof feedbackText !== "string" || !feedbackText.trim()) {
      return NextResponse.json({ error: "请输入反馈内容" }, { status: 400 });
    }

    if (feedbackText.length > 2000) {
      return NextResponse.json({ error: "反馈内容不能超过 2000 字" }, { status: 400 });
    }

    const { error } = await supabase.from("feedback").insert({
      feedback_text: feedbackText.trim(),
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
    });

    if (error) {
      return NextResponse.json({ error: "提交失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}
