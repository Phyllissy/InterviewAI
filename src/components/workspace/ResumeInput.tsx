"use client";

import { useState, useRef } from "react";
import { Upload, FileText, ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeInputProps {
  value: string;
  onChange: (text: string) => void;
}

export function ResumeInput({ value, onChange }: ResumeInputProps) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "txt") {
      setError("仅支持 PDF 或 TXT 文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("文件大小不能超过 5MB");
      return;
    }

    setFileName(file.name);

    if (ext === "txt") {
      const text = await file.text();
      onChange(text);
      return;
    }

    // PDF: send to API
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "解析失败");
      }
      const { text } = await res.json();
      onChange(text);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <FileText size={16} className="text-indigo-500" />
        简历输入
      </h3>

      <div className="mb-3 flex">
        <button
          onClick={() => setMode("upload")}
          className={cn(
            "rounded-l-md border px-3 py-1.5 text-xs font-medium transition",
            mode === "upload"
              ? "border-indigo-500 bg-indigo-500 text-white"
              : "border-gray-300 text-gray-500 hover:bg-gray-50"
          )}
        >
          <Upload size={12} className="mr-1 inline" />
          上传文件
        </button>
        <button
          onClick={() => setMode("paste")}
          className={cn(
            "rounded-r-md border border-l-0 px-3 py-1.5 text-xs font-medium transition",
            mode === "paste"
              ? "border-indigo-500 bg-indigo-500 text-white"
              : "border-gray-300 text-gray-500 hover:bg-gray-50"
          )}
        >
          <ClipboardPaste size={12} className="mr-1 inline" />
          粘贴文本
        </button>
      </div>

      {error && (
        <div className="mb-2 rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-600">
          {error}
        </div>
      )}

      {mode === "upload" ? (
        <>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400 transition hover:border-indigo-400 hover:bg-indigo-50/30"
          >
            {parsing ? (
              <span className="text-indigo-500">解析中...</span>
            ) : fileName ? (
              <span className="text-gray-600">{fileName}</span>
            ) : (
              <>
                拖拽 PDF/TXT 文件到此处
                <br />
                <span className="text-xs">或点击选择文件 (最大 5MB)</span>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {value && (
            <div className="mt-3 max-h-32 overflow-y-auto rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
              {value.slice(0, 500)}
              {value.length > 500 && "..."}
            </div>
          )}
        </>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="将简历内容粘贴到这里..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          rows={6}
        />
      )}
    </div>
  );
}
