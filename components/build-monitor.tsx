"use client";

import { useState, useEffect } from "react";
import { FileCode, Terminal, CheckCircle2, AlertCircle, Loader2, FolderTree } from "lucide-react";

interface BuildStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "error";
  progress: number;
  logs: string[];
  files: string[];
}

interface BuildMonitorProps {
  sessionId: string;
}

export function BuildMonitor({ sessionId }: BuildMonitorProps) {
  const [steps, setSteps] = useState<BuildStep[]>([
    {
      id: "analyze",
      name: "วิเคราะห์ความต้องการ",
      status: "pending",
      progress: 0,
      logs: [],
      files: [],
    },
    {
      id: "design",
      name: "ออกแบบสถาปัตยกรรม",
      status: "pending",
      progress: 0,
      logs: [],
      files: [],
    },
    {
      id: "backend",
      name: "พัฒนา Backend",
      status: "pending",
      progress: 0,
      logs: [],
      files: [],
    },
    {
      id: "frontend",
      name: "พัฒนา Frontend",
      status: "pending",
      progress: 0,
      logs: [],
      files: [],
    },
    {
      id: "integrate",
      name: "เชื่อมต่อระบบ",
      status: "pending",
      progress: 0,
      logs: [],
      files: [],
    },
    {
      id: "test",
      name: "ทดสอบคุณภาพ",
      status: "pending",
      progress: 0,
      logs: [],
      files: [],
    },
    {
      id: "deploy",
      name: "เตรียม Deployment",
      status: "pending",
      progress: 0,
      logs: [],
      files: [],
    },
  ]);

  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  // TODO: Connect to WebSocket for real-time updates
  useEffect(() => {
    // Simulate progress for demo
    const interval = setInterval(() => {
      setSteps((prev) => {
        const updated = [...prev];
        const runningIndex = updated.findIndex((s) => s.status === "running");
        
        if (runningIndex >= 0) {
          updated[runningIndex].progress += 10;
          if (updated[runningIndex].progress >= 100) {
            updated[runningIndex].status = "completed";
            updated[runningIndex].progress = 100;
            if (runningIndex + 1 < updated.length) {
              updated[runningIndex + 1].status = "running";
            }
          }
        } else {
          const pendingIndex = updated.findIndex((s) => s.status === "pending");
          if (pendingIndex >= 0) {
            updated[pendingIndex].status = "running";
          }
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const completed = steps.filter((s) => s.status === "completed").length;
    setOverallProgress((completed / steps.length) * 100);
  }, [steps]);

  const getStatusIcon = (status: BuildStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />;
    }
  };

  const selectedStepData = steps.find((s) => s.id === selectedStep);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Overall Progress */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">ความคืบหน้าโดยรวม</h3>
          <span className="text-sm text-muted-foreground">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Steps List */}
        <div className="w-80 border-r border-border overflow-y-auto">
          <div className="p-4 space-y-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setSelectedStep(step.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedStep === step.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(step.status)}
                  <span className="font-medium text-sm">{step.name}</span>
                </div>
                {step.status === "running" && (
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedStepData ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedStepData.status)}
                  <div>
                    <h3 className="font-semibold">{selectedStepData.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedStepData.status === "completed"
                        ? "เสร็จสมบูรณ์"
                        : selectedStepData.status === "running"
                        ? `กำลังดำเนินการ... ${selectedStepData.progress}%`
                        : selectedStepData.status === "error"
                        ? "เกิดข้อผิดพลาด"
                        : "รอดำเนินการ"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border">
                <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span>Logs</span>
                  </div>
                </button>
                <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4" />
                    <span>Files</span>
                  </div>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs">
                {selectedStepData.logs.length > 0 ? (
                  <div className="space-y-1">
                    {selectedStepData.logs.map((log, i) => (
                      <div key={i} className="text-[#cccccc]">
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[#858585]">
                    {selectedStepData.status === "pending"
                      ? "รอเริ่มดำเนินการ..."
                      : selectedStepData.status === "running"
                      ? "กำลังดำเนินการ..."
                      : "ไม่มี logs"}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>เลือกขั้นตอนเพื่อดูรายละเอียด</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
