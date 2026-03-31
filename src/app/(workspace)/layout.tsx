"use client";

import { Navbar } from "@/components/ui/Navbar";
import { HistorySidebar } from "@/components/sidebar/HistorySidebar";
import { useState, createContext, useContext, useCallback } from "react";
import { PanelLeftOpen } from "lucide-react";
import type { ReportSummary, GenerateResult } from "@/types";

interface ViewedInputs {
  resumeText: string;
  jdText: string;
}

interface WorkspaceContextType {
  reports: ReportSummary[];
  setReports: (reports: ReportSummary[]) => void;
  addReport: (report: ReportSummary) => void;
  removeReport: (id: string) => void;
  updateReport: (id: string, updates: Partial<Pick<ReportSummary, "title" | "is_favorited">>) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  viewedResult: GenerateResult | null;
  setViewedResult: (result: GenerateResult | null) => void;
  viewedTitle: string;
  setViewedTitle: (title: string) => void;
  viewedInputs: ViewedInputs | null;
  setViewedInputs: (inputs: ViewedInputs | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>(null!);
export const useWorkspace = () => useContext(WorkspaceContext);

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewedResult, setViewedResult] = useState<GenerateResult | null>(null);
  const [viewedTitle, setViewedTitle] = useState("");
  const [viewedInputs, setViewedInputs] = useState<ViewedInputs | null>(null);

  const addReport = useCallback((report: ReportSummary) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const removeReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setSelectedReportId((prev) => (prev === id ? null : prev));
  }, []);

  const updateReport = useCallback((id: string, updates: Partial<Pick<ReportSummary, "title" | "is_favorited">>) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        reports,
        setReports,
        addReport,
        removeReport,
        updateReport,
        selectedReportId,
        setSelectedReportId,
        viewedResult,
        setViewedResult,
        viewedTitle,
        setViewedTitle,
        viewedInputs,
        setViewedInputs,
      }}
    >
      <div className="flex h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <HistorySidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex-shrink-0 border-r border-gray-200 bg-white px-1.5 py-3 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
              title="展开历史记录"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
