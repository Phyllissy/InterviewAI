"use client";

import { useEffect, useState, useRef } from "react";
import { useWorkspace } from "@/app/(workspace)/layout";
import { createClient } from "@/lib/supabase/client";
import { MoreHorizontal, Pencil, Trash2, Star, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportSummary, Report } from "@/types";

function formatTime(dateStr: string, now: number) {
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} 周前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

interface HistorySidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function HistorySidebar({ open, onToggle }: HistorySidebarProps) {
  const {
    reports,
    setReports,
    selectedReportId,
    setSelectedReportId,
    removeReport,
    updateReport,
    setViewedResult,
    setViewedTitle,
    setViewedInputs,
  } = useWorkspace();
  const [loaded, setLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (loaded) return;
    supabase
      .from("reports")
      .select("id, title, is_favorited, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setReports(data as ReportSummary[]);
        setLoaded(true);
        setCurrentTime(Date.now());
      });
  }, [loaded, supabase, setReports]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [menuOpenId]);

  // Focus rename input
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleSelect = async (id: string) => {
    if (renamingId) return;
    if (selectedReportId === id) {
      setSelectedReportId(null);
      setViewedResult(null);
      setViewedTitle("");
      setViewedInputs(null);
      return;
    }
    setSelectedReportId(id);
    const { data } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      const report = data as Report;
      setViewedResult({
        matchAnalysis: report.match_analysis,
        questions: report.questions,
      });
      setViewedTitle(report.title);
      setViewedInputs({
        resumeText: report.resume_text,
        jdText: report.jd_text,
      });
    }
  };

  const handleDelete = async (id: string) => {
    setMenuOpenId(null);
    await supabase.from("reports").delete().eq("id", id);
    removeReport(id);
    if (selectedReportId === id) {
      setViewedResult(null);
      setViewedTitle("");
      setViewedInputs(null);
    }
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    setMenuOpenId(null);
    const newVal = !current;
    updateReport(id, { is_favorited: newVal });
    await supabase.from("reports").update({ is_favorited: newVal }).eq("id", id);
  };

  const startRename = (id: string, currentTitle: string) => {
    setMenuOpenId(null);
    setRenamingId(id);
    setRenameValue(currentTitle);
  };

  const confirmRename = async () => {
    if (!renamingId || !renameValue.trim()) return;
    const newTitle = renameValue.trim();
    updateReport(renamingId, { title: newTitle });
    await supabase.from("reports").update({ title: newTitle }).eq("id", renamingId);
    setRenamingId(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
  };

  // Sort: favorited first, then by created_at desc
  const sortedReports = [...reports].sort((a, b) => {
    if (a.is_favorited !== b.is_favorited) return a.is_favorited ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <aside
      className={cn(
        "flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-200",
        open ? "w-60" : "w-0 overflow-hidden"
      )}
    >
      <div className="flex h-full w-60 flex-col p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            历史记录
          </h3>
          <button
            onClick={onToggle}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            收起
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto">
          {!loaded ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-gray-100"
              />
            ))
          ) : sortedReports.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-400">
              暂无历史记录
            </p>
          ) : (
            sortedReports.map((r) => (
              <div
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className={cn(
                  "group relative flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition",
                  selectedReportId === r.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "hover:bg-gray-50"
                )}
              >
                {/* Star icon for favorited */}
                {r.is_favorited && (
                  <Star size={12} className="mr-1.5 flex-shrink-0 fill-amber-400 text-amber-400" />
                )}

                <div className="min-w-0 flex-1">
                  {renamingId === r.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmRename();
                          if (e.key === "Escape") cancelRename();
                        }}
                        className="w-full rounded border border-indigo-300 px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                      <button onClick={confirmRename} className="text-emerald-500 hover:text-emerald-600">
                        <Check size={14} />
                      </button>
                      <button onClick={cancelRename} className="text-gray-400 hover:text-gray-600">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="truncate font-medium">{r.title}</div>
                      <div className="text-xs text-gray-400">
                        {formatTime(r.created_at, currentTime)}
                      </div>
                    </>
                  )}
                </div>

                {/* More menu trigger */}
                {renamingId !== r.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === r.id ? null : r.id);
                    }}
                    className="ml-1 flex-shrink-0 rounded p-0.5 text-gray-400 opacity-0 transition hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                )}

                {/* Dropdown menu */}
                {menuOpenId === r.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-2 top-full z-20 mt-0.5 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => startRename(r.id, r.title)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 transition hover:bg-gray-50"
                    >
                      <Pencil size={12} />
                      重命名
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(r.id, r.is_favorited)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-700 transition hover:bg-gray-50"
                    >
                      <Star size={12} className={r.is_favorited ? "fill-amber-400 text-amber-400" : ""} />
                      {r.is_favorited ? "取消收藏" : "收藏"}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                      删除
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
