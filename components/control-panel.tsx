"use client";

import { useState } from "react";
import { Play, Pause, Square, RotateCcw, Settings, AlertTriangle } from "lucide-react";

interface ControlPanelProps {
  sessionId: string;
  status: "idle" | "running" | "paused" | "completed" | "error";
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onResume?: () => void;
  onRestart?: () => void;
}

export function ControlPanel({
  sessionId,
  status,
  onStart,
  onPause,
  onStop,
  onResume,
  onRestart,
}: ControlPanelProps) {
  const [showConfirm, setShowConfirm] = useState<"stop" | "restart" | null>(null);

  const handleStop = () => {
    if (showConfirm === "stop") {
      onStop?.();
      setShowConfirm(null);
    } else {
      setShowConfirm("stop");
      setTimeout(() => setShowConfirm(null), 3000);
    }
  };

  const handleRestart = () => {
    if (showConfirm === "restart") {
      onRestart?.();
      setShowConfirm(null);
    } else {
      setShowConfirm("restart");
      setTimeout(() => setShowConfirm(null), 3000);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "text-blue-500";
      case "paused":
        return "text-yellow-500";
      case "completed":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "running":
        return "กำลังทำงาน";
      case "paused":
        return "หยุดชั่วคราว";
      case "completed":
        return "เสร็จสมบูรณ์";
      case "error":
        return "เกิดข้อผิดพลาด";
      default:
        return "พร้อมใช้งาน";
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-lg">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm mb-1">สถานะระบบ</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
            <span className={`text-sm ${getStatusColor()}`}>{getStatusText()}</span>
          </div>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {status === "idle" && (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Play className="w-4 h-4" />
            <span>เริ่มทำงาน</span>
          </button>
        )}

        {status === "running" && (
          <>
            <button
              onClick={onPause}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>หยุดชั่วคราว</span>
            </button>
            <button
              onClick={handleStop}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                showConfirm === "stop"
                  ? "bg-red-600 text-white"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              <Square className="w-4 h-4" />
              <span>{showConfirm === "stop" ? "ยืนยันหยุด?" : "หยุดทำงาน"}</span>
            </button>
          </>
        )}

        {status === "paused" && (
          <>
            <button
              onClick={onResume}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Play className="w-4 h-4" />
              <span>ทำงานต่อ</span>
            </button>
            <button
              onClick={handleStop}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                showConfirm === "stop"
                  ? "bg-red-600 text-white"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              <Square className="w-4 h-4" />
              <span>{showConfirm === "stop" ? "ยืนยันหยุด?" : "หยุดทำงาน"}</span>
            </button>
          </>
        )}

        {(status === "completed" || status === "error") && (
          <button
            onClick={handleRestart}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              showConfirm === "restart"
                ? "bg-purple-600 text-white"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{showConfirm === "restart" ? "ยืนยันเริ่มใหม่?" : "เริ่มใหม่"}</span>
          </button>
        )}
      </div>

      {/* Warning for confirmation */}
      {showConfirm && (
        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            {showConfirm === "stop"
              ? "คลิกอีกครั้งเพื่อยืนยันการหยุดทำงาน (ความคืบหน้าจะถูกบันทึก)"
              : "คลิกอีกครั้งเพื่อยืนยันการเริ่มใหม่ (ความคืบหน้าเดิมจะถูกลบ)"}
          </p>
        </div>
      )}

      {/* Session Info */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Session ID</span>
          <code className="px-2 py-1 bg-muted rounded font-mono">{sessionId}</code>
        </div>
      </div>
    </div>
  );
}
