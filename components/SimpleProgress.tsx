'use client'

import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export interface SimpleProgressProps {
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number; // 0-100
  currentStep?: string;
  totalSteps?: number;
  completedSteps?: number;
}

export function SimpleProgress({
  status,
  progress,
  currentStep,
  totalSteps = 7,
  completedSteps = 0,
}: SimpleProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'running':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'เสร็จสมบูรณ์';
      case 'running':
        return 'กำลังดำเนินการ';
      case 'error':
        return 'เกิดข้อผิดพลาด';
      default:
        return 'พร้อมเริ่มต้น';
    }
  };

  return (
    <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {getStatusText()}
            </h2>
            {currentStep && (
              <p className="text-sm text-muted-foreground">
                {currentStep}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">
            {Math.round(progress)}%
          </p>
          <p className="text-xs text-muted-foreground">
            {completedSteps}/{totalSteps} ขั้นตอน
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            status === 'error'
              ? 'bg-red-500'
              : status === 'completed'
              ? 'bg-green-500'
              : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status Messages */}
      {status === 'running' && (
        <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            ระบบ AI กำลังวิเคราะห์และสร้างเว็บไซต์ของคุณ กรุณารอสักครู่...
          </p>
        </div>
      )}

      {status === 'completed' && (
        <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-600 dark:text-green-400">
            เว็บไซต์ของคุณพร้อมใช้งานแล้ว! ตรวจสอบผลลัพธ์ด้านล่าง
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            เกิดข้อผิดพลาดในระหว่างการสร้าง กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
      )}
    </section>
  );
}
