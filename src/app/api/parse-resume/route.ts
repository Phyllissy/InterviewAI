import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请上传文件" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过 5MB" }, { status: 413 });
    }

    const name = file.name.toLowerCase();
    if (name.endsWith(".txt")) {
      const text = await file.text();
      return NextResponse.json({ text });
    }

    if (name.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractTextFromPDF(buffer);
      return NextResponse.json({ text });
    }

    return NextResponse.json(
      { error: "仅支持 PDF 或 TXT 文件" },
      { status: 415 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "文件解析失败: " + (e as Error).message },
      { status: 422 }
    );
  }
}
