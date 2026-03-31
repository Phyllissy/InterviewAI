"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, X } from "lucide-react";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackText: text }),
      });
      if (res.ok) {
        setSubmitted(true);
        setText("");
        setTimeout(() => {
          setOpen(false);
          setSubmitted(false);
        }, 1500);
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Feedback Panel */}
      {open && (
        <div className="mb-3 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">意见反馈</h4>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          {submitted ? (
            <p className="py-4 text-center text-sm text-emerald-600">
              感谢您的反馈！
            </p>
          ) : (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="请告诉我们您的建议或反馈..."
                maxLength={2000}
                rows={4}
                className="mb-3 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                提交反馈
              </button>
            </>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="提交反馈"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg transition hover:bg-indigo-600"
      >
        <MessageSquare size={20} />
      </button>
    </div>
  );
}
